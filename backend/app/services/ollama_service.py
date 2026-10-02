import time
import json
import logging
from typing import Optional, Any
import httpx
from app.config import settings

logger = logging.getLogger("palmind.ollama")

class AIUnavailableException(Exception):
    def __init__(self, message: str = "Local AI is currently unavailable."):
        self.message = message
        super().__init__(self.message)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.preferred_model = settings.OLLAMA_MODEL
        self._active_model: Optional[str] = None

    async def get_status(self) -> dict[str, Any]:
        """Check Ollama connectivity and detect installed models."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    
                    # Choose active model
                    active = None
                    if self.preferred_model in models:
                        active = self.preferred_model
                    elif any(m.startswith(self.preferred_model.split(":")[0]) for m in models):
                        # match tag prefix e.g. qwen2.5
                        match = next(m for m in models if m.startswith(self.preferred_model.split(":")[0]))
                        active = match
                    elif len(models) > 0:
                        active = models[0]
                    
                    self._active_model = active
                    return {
                        "available": True,
                        "configured_model": self.preferred_model,
                        "active_model": active,
                        "installed_models": models,
                        "ollama_url": self.base_url,
                        "embedding_model": settings.EMBEDDING_MODEL,
                        "error_message": None if active else "No models installed in Ollama. Run: ollama pull qwen2.5:3b"
                    }
                else:
                    return {
                        "available": False,
                        "configured_model": self.preferred_model,
                        "active_model": None,
                        "installed_models": [],
                        "ollama_url": self.base_url,
                        "embedding_model": settings.EMBEDDING_MODEL,
                        "error_message": f"Ollama returned HTTP {res.status_code}"
                    }
        except Exception as e:
            logger.warning(f"Ollama connection check failed: {e}")
            return {
                "available": False,
                "configured_model": self.preferred_model,
                "active_model": None,
                "installed_models": [],
                "ollama_url": self.base_url,
                "embedding_model": settings.EMBEDDING_MODEL,
                "error_message": "Local AI is currently unavailable. Ensure Ollama is running at " + self.base_url
            }

    async def test_connection(self) -> dict[str, Any]:
        """Runs a tiny inference test to check latency and readiness."""
        status = await self.get_status()
        if not status["available"]:
            return {
                "success": False,
                "message": "Cannot reach Ollama at " + self.base_url + ". Please start Ollama.",
                "latency_ms": None,
                "model_used": None
            }
        
        active_model = status["active_model"]
        if not active_model:
            return {
                "success": False,
                "message": f"No models found. Please pull a model using: ollama pull {self.preferred_model}",
                "latency_ms": None,
                "model_used": None
            }

        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": active_model,
                        "prompt": "Respond with the single word: OK",
                        "stream": False,
                        "options": {"temperature": 0.0, "num_predict": 5}
                    }
                )
                latency = round((time.time() - start_time) * 1000, 2)
                if res.status_code == 200:
                    return {
                        "success": True,
                        "message": f"Successfully connected to Ollama ({active_model}) in {latency}ms.",
                        "latency_ms": latency,
                        "model_used": active_model
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Ollama generation failed with status {res.status_code}: {res.text}",
                        "latency_ms": latency,
                        "model_used": active_model
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"Inference test failed: {str(e)}",
                "latency_ms": None,
                "model_used": active_model
            }

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.3) -> str:
        """Call Ollama /api/generate with resilient model selection."""
        status = await self.get_status()
        if not status["available"] or not status["active_model"]:
            raise AIUnavailableException(status.get("error_message") or "Local AI is currently unavailable.")
        
        active_model = status["active_model"]
        payload = {
            "model": active_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
                else:
                    raise AIUnavailableException(f"Ollama returned HTTP {res.status_code}: {res.text}")
        except httpx.RequestError as e:
            logger.error(f"Ollama request error: {e}")
            raise AIUnavailableException(f"Connection error to Ollama: {str(e)}")

    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.4) -> str:
        """Call Ollama /api/chat with resilient model selection."""
        status = await self.get_status()
        if not status["available"] or not status["active_model"]:
            raise AIUnavailableException(status.get("error_message") or "Local AI is currently unavailable.")

        active_model = status["active_model"]
        payload = {
            "model": active_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    msg = data.get("message", {})
                    return msg.get("content", "").strip()
                else:
                    raise AIUnavailableException(f"Ollama returned HTTP {res.status_code}: {res.text}")
        except httpx.RequestError as e:
            logger.error(f"Ollama chat error: {e}")
            raise AIUnavailableException(f"Connection error to Ollama: {str(e)}")

ollama_service = OllamaService()
