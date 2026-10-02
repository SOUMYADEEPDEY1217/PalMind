import re
import datetime
from typing import Optional, Tuple
from app.services.ollama_service import ollama_service

class TaskPriorityService:
    @staticmethod
    def calculate_priority_score(
        priority: str,
        due_date: Optional[datetime.datetime],
        estimated_minutes: int,
        status: str = "To Do"
    ) -> Tuple[float, str]:
        """Calculates an explainable priority score (0.0 - 100.0) and human rationale."""
        if status == "Completed":
            return 0.0, "Task is already completed."

        now = datetime.datetime.now(datetime.timezone.utc)
        score = 0.0
        reasons = []

        # 1. Base Priority Weight
        base_weights = {"Urgent": 40.0, "High": 30.0, "Medium": 20.0, "Low": 10.0}
        b_weight = base_weights.get(priority, 20.0)
        score += b_weight
        reasons.append(f"Marked as {priority} priority (+{int(b_weight)} pts)")

        # 2. Deadline Proximity
        if due_date:
            # Ensure due_date has timezone
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=datetime.timezone.utc)
            
            delta = due_date - now
            hours_remaining = delta.total_seconds() / 3600.0

            if hours_remaining < 0:
                score += 50.0
                reasons.append("Overdue! Requires immediate action (+50 pts)")
            elif hours_remaining <= 24:
                score += 45.0
                reasons.append("Due within 24 hours (+45 pts)")
            elif hours_remaining <= 48:
                score += 35.0
                reasons.append("Due tomorrow (+35 pts)")
            elif hours_remaining <= 7 * 24:
                score += 20.0
                days = int(hours_remaining / 24)
                reasons.append(f"Due in {days} days (+20 pts)")
            else:
                score += 5.0
                reasons.append("Due in more than a week")
        else:
            reasons.append("No explicit deadline set")

        # 3. Effort Consideration
        if estimated_minutes >= 120:
            score += 10.0
            reasons.append(f"Significant effort estimated ({estimated_minutes}m)")
        elif estimated_minutes <= 30:
            score += 5.0
            reasons.append(f"Quick win item ({estimated_minutes}m)")

        final_score = min(100.0, round(score, 1))
        explanation = " • ".join(reasons)
        return final_score, explanation

    @classmethod
    async def parse_natural_language_task(cls, text: str) -> dict:
        """Extracts task attributes (title, due_date, category, priority, estimated_minutes)
        using Ollama LLM with regex heuristic fallback.
        """
        # Try LLM first if available
        try:
            status = await ollama_service.get_status()
            if status["available"] and status["active_model"]:
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                prompt = f"""You are a precise task parser.
Current local time: {now_str}.
Input text: "{text}"

Extract structured task information in valid JSON with these exact keys:
{{
  "title": "clean concise task title",
  "due_date": "YYYY-MM-DDTHH:MM:SS or null",
  "category": "Academic" or "Project" or "Personal" or "Exam" or "General",
  "priority": "Low" or "Medium" or "High" or "Urgent",
  "estimated_minutes": integer
}}
Output ONLY the JSON object. Do not include markdown codeblocks or extra text."""
                
                raw = await ollama_service.generate(prompt, temperature=0.1)
                # Extract json object
                match = re.search(r"\{.*\}", raw, re.DOTALL)
                if match:
                    import json
                    parsed = json.loads(match.group(0))
                    # Validate due_date
                    due = None
                    if parsed.get("due_date"):
                        try:
                            due = datetime.datetime.fromisoformat(parsed["due_date"].replace("Z", "+00:00"))
                        except Exception:
                            due = None
                    return {
                        "title": parsed.get("title", text).strip(),
                        "due_date": due,
                        "category": parsed.get("category", "Academic"),
                        "priority": parsed.get("priority", "Medium"),
                        "estimated_minutes": int(parsed.get("estimated_minutes", 45))
                    }
        except Exception:
            pass

        # Robust Heuristic Fallback
        lower = text.lower()
        priority = "Medium"
        if any(w in lower for w in ["urgent", "asap", "immediately", "critical"]):
            priority = "Urgent"
        elif any(w in lower for w in ["important", "exam", "high priority"]):
            priority = "High"
        elif any(w in lower for w in ["someday", "low priority", "optional"]):
            priority = "Low"

        category = "Academic"
        if any(w in lower for w in ["exam", "revision", "study", "lecture", "chapter"]):
            category = "Exam" if "exam" in lower else "Academic"
        elif any(w in lower for w in ["project", "code", "github", "bug", "build"]):
            category = "Project"
        elif any(w in lower for w in ["doctor", "groceries", "gym", "call", "buy"]):
            category = "Personal"

        # Deadline parsing heuristics
        due_date = None
        now = datetime.datetime.now()
        if "today" in lower:
            due_date = now.replace(hour=20, minute=0, second=0, microsecond=0)
        elif "tomorrow" in lower:
            due_date = (now + datetime.timedelta(days=1)).replace(hour=18, minute=0, second=0, microsecond=0)
        elif "friday" in lower:
            days_ahead = (4 - now.weekday() + 7) % 7
            if days_ahead == 0:
                days_ahead = 7
            due_date = (now + datetime.timedelta(days=days_ahead)).replace(hour=17, minute=0, second=0, microsecond=0)
        elif "next week" in lower:
            due_date = (now + datetime.timedelta(days=7)).replace(hour=12, minute=0, second=0, microsecond=0)

        # Clean title
        clean_title = text.strip()
        for prefix in ["remind me to ", "i need to ", "finish ", "submit "]:
            if lower.startswith(prefix):
                clean_title = text[len(prefix):].capitalize()
                break

        return {
            "title": clean_title,
            "due_date": due_date,
            "category": category,
            "priority": priority,
            "estimated_minutes": 60 if category in ("Academic", "Exam") else 30
        }

task_priority_service = TaskPriorityService()
