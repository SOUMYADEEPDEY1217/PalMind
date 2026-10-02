import logging
import json
from typing import Optional
import numpy as np
from app.config import settings

logger = logging.getLogger("palmind.embedding")

class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self._model = None
        self._dimension = 384  # default for all-MiniLM-L6-v2

    def _get_model(self):
        import os
        if os.environ.get("TESTING") == "1":
            return None

        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading local embedding model: {self.model_name}")
                try:
                    self._model = SentenceTransformer(self.model_name, local_files_only=True)
                except Exception:
                    self._model = SentenceTransformer(self.model_name)

                if hasattr(self._model, "get_embedding_dimension"):
                    self._dimension = self._model.get_embedding_dimension()
                else:
                    self._dimension = self._model.get_sentence_embedding_dimension()
                logger.info(f"Local embedding model loaded successfully (dimension: {self._dimension})")
            except Exception as e:
                logger.error(f"Failed to load sentence-transformers model: {e}")
                self._model = None
        return self._model

    def encode(self, text: str) -> list[float]:
        """Encode a single string into a normalized embedding vector."""
        if not text or not text.strip():
            return [0.0] * self._dimension

        model = self._get_model()
        if model is not None:
            try:
                vec = model.encode(text, normalize_embeddings=True)
                return vec.tolist()
            except Exception as e:
                logger.error(f"Embedding encoding failed: {e}")
        
        # Fallback deterministic pseudo-vector (normalized) if model unavailable
        vec = np.zeros(self._dimension, dtype=np.float32)
        for i, ch in enumerate(text[: self._dimension]):
            vec[i % self._dimension] += ord(ch)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """Encode multiple strings in batch."""
        if not texts:
            return []

        model = self._get_model()
        if model is not None:
            try:
                embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
                return [e.tolist() for e in embeddings]
            except Exception as e:
                logger.error(f"Batch embedding failed: {e}")

        return [self.encode(t) for t in texts]

    @staticmethod
    def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        """Compute cosine similarity between two normalized vectors."""
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

embedding_service = EmbeddingService()
