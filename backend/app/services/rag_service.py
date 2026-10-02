import re
import json
import logging
import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.database.models import UserProfile, Task, Document, DocumentChunk, Memory
from app.services.vector_store import vector_store
from app.services.ollama_service import ollama_service, AIUnavailableException
from app.services.embedding_service import embedding_service
from app.schemas.schemas import SourceCitation

logger = logging.getLogger("palmind.rag")

class RAGService:
    @staticmethod
    def classify_memory(content: str) -> Tuple[str, int]:
        """Classify memory into a category and importance level."""
        lower = content.lower()
        
        # Commitment / Promise
        if any(w in lower for w in ["promised", "promise", "owe", "will send", "agreed to", "told him", "told her"]):
            return "Commitment", 4

        # Deadline / Exam
        if any(w in lower for w in ["exam", "due date", "deadline", "test", "submission", "midterm", "quiz"]):
            return "Deadline" if "deadline" in lower or "due" in lower else "Academic", 5

        # People
        if any(w in lower for w in ["prefers", "birthday", "likes", "dislikes", "lives at", "contact", "mentor", "professor"]):
            return "People", 3

        # Preference
        if any(w in lower for w in ["i prefer", "always like", "favorite", "routine", "habit"]):
            return "Preference", 2

        # Project
        if any(w in lower for w in ["repository", "repo", "architecture", "api", "database", "feature", "deployment"]):
            return "Project", 3

        # Personal
        if any(w in lower for w in ["health", "doctor", "medicine", "family", "workout", "gym"]):
            return "Personal", 3

        return "Academic" if any(w in lower for w in ["chapter", "page", "slide", "class", "lecture", "topic"]) else "Other", 3

    async def answer_question(
        self,
        db: Session,
        question: str,
        conversation_history: list[dict] = []
    ) -> Tuple[str, list[SourceCitation]]:
        """Core RAG pipeline:
        Retrieves relevant documents, memories, and task deadlines,
        constructs a grounded prompt, invokes Ollama, and returns answer + citations.
        """
        citations: list[SourceCitation] = []
        context_parts = []

        # 1. Retrieve relevant memories (semantic)
        memories = vector_store.search_memories(db, query=question, top_k=4, min_similarity=0.20)
        if memories:
            context_parts.append("### RELEVANT PERSONAL MEMORIES:")
            for m in memories:
                context_parts.append(f"- [{m['memory_type']}] {m['content']}")
                citations.append(SourceCitation(
                    type="memory",
                    title=f"Memory ({m['memory_type']})",
                    snippet=m["content"],
                    id=m["id"]
                ))

        # 2. Retrieve relevant document chunks (semantic)
        doc_chunks = vector_store.search_document_chunks(db, query=question, top_k=4, min_similarity=0.25)
        if doc_chunks:
            context_parts.append("\n### RELEVANT DOCUMENT EXCERPTS:")
            for c in doc_chunks:
                page_str = f"Page {c['page_number']}" if c.get("page_number") else "Document"
                context_parts.append(f"- From {c['filename']} ({page_str}):\n\"{c['content']}\"")
                citations.append(SourceCitation(
                    type="document",
                    title=c["filename"],
                    snippet=c["content"][:200] + ("..." if len(c["content"]) > 200 else ""),
                    page=c.get("page_number"),
                    id=c["document_id"]
                ))

        # 3. Retrieve pending tasks and upcoming deadlines
        tasks = db.query(Task).filter(Task.status != "Completed").order_by(Task.ai_priority_score.desc()).limit(8).all()
        if tasks:
            context_parts.append("\n### CURRENT ACTIVE TASKS & DEADLINES:")
            for t in tasks:
                due_str = t.due_date.strftime("%Y-%m-%d %H:%M") if t.due_date else "No deadline"
                context_parts.append(f"- {t.title} [Priority: {t.priority}, Due: {due_str}, Status: {t.status}]")
                # If question seems related to this task, add citation
                if any(w in question.lower() for w in t.title.lower().split() if len(w) > 3):
                    citations.append(SourceCitation(
                        type="task",
                        title=f"Task: {t.title}",
                        snippet=f"Priority: {t.priority}, Due: {due_str}",
                        id=t.id
                    ))

        # 4. User profile info
        user = db.query(UserProfile).first()
        user_name = user.name if user else "Friend"
        user_goal = user.goal if user else "Academic success"

        context_text = "\n".join(context_parts) if context_parts else "No specific matching documents or memories found in the database."

        system_prompt = f"""You are PalMind, a warm, private, highly capable local AI companion built for {user_name}.
Current goal: {user_goal}.
Today's Date: {datetime.date.today().strftime('%A, %B %d, %Y')}.

You have access to {user_name}'s private local memories, documents, and tasks below.
STRICT GUIDELINES:
1. Always ground your answers in the provided context whenever relevant.
2. Be direct, compassionate, supportive, and actionable.
3. If referencing a document or memory, mention it naturally (e.g. 'According to your Computer Networks notes...' or 'You promised Rahul...').
4. If you don't know something or it is not in the stored information, politely state that you don't have that in your memory yet.
5. Never invent or hallucinate dates, exams, or promises that aren't in the context."""

        user_prompt = f"""CONTEXT:
{context_text}

USER QUESTION:
{question}

Provide a helpful, grounded response:"""

        # Format conversation messages for Ollama chat
        messages = [{"role": "system", "content": system_prompt}]
        for prev in conversation_history[-4:]:  # last 2 turns
            messages.append({"role": prev.get("role", "user"), "content": prev.get("content", "")})
        messages.append({"role": "user", "content": user_prompt})

        try:
            answer = await ollama_service.chat(messages, temperature=0.3)
            return answer, citations
        except AIUnavailableException as e:
            # Graceful contextual fallback without LLM
            logger.warning(f"Ollama unavailable during question answering: {e}")
            fallback_answer = self._generate_rule_based_fallback(question, memories, doc_chunks, tasks, user_name)
            return fallback_answer, citations

    def _generate_rule_based_fallback(
        self,
        question: str,
        memories: list,
        doc_chunks: list,
        tasks: list,
        user_name: str
    ) -> str:
        """Heuristic answer generator when local LLM is offline."""
        q = question.lower()
        parts = [f"*(Local AI is currently offline. Showing relevant records from your private database for {user_name})*\n"]

        if any(w in q for w in ["study", "work on", "priorit", "urgent", "deadline", "what should"]):
            if tasks:
                urgent = [t for t in tasks if t.priority in ("Urgent", "High") or t.ai_priority_score >= 50]
                pick = urgent[0] if urgent else tasks[0]
                due = pick.due_date.strftime('%B %d') if pick.due_date else 'no deadline'
                parts.append(f"[Target] **Recommended Focus:** **{pick.title}** (Priority: {pick.priority}, Due: {due}).")
                parts.append(f"Reason: {pick.ai_priority_reason or 'Highest priority task in queue.'}\n")
            if memories:
                parts.append("[Note] **Relevant memory note:** " + memories[0]["content"])
            return "\n".join(parts)

        if "rahul" in q or "promise" in q or "commitment" in q:
            commitments = [m for m in memories if m["memory_type"] == "Commitment" or "rahul" in m["content"].lower()]
            if commitments:
                return "\n".join(parts + [f"[Commitment] **Commitment found:** {commitments[0]['content']}"])

        if doc_chunks:
            parts.append(f"[Document] **Found in {doc_chunks[0]['filename']}:**")
            parts.append(f"> \"{doc_chunks[0]['content'][:300]}...\"")
            return "\n".join(parts)

        if memories:
            parts.append("[Note] **From your memory:** " + memories[0]["content"])
            return "\n".join(parts)

        return (
            "I checked your private local database, but couldn't find a direct match. "
            "To get full generative AI answers, please start Ollama (`ollama serve`)."
        )

    async def generate_study_plan(
        self,
        db: Session,
        subject: str,
        duration_minutes: int,
        focus_topic: Optional[str] = None,
        document_id: Optional[int] = None
    ) -> dict:
        """Generates a structured, time-blocked study session."""
        doc_summary = ""
        if document_id:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc_summary = f"Document '{doc.filename}' content summary: {doc.summary or ''}"

        # Related memories
        mems = vector_store.search_memories(db, query=f"{subject} {focus_topic or ''}", top_k=3)
        mem_text = " ".join([m["content"] for m in mems])

        prompt = f"""You are PalMind Study Coach.
Subject: {subject}
Duration: {duration_minutes} minutes
Specific focus: {focus_topic or 'General comprehensive study'}
Extra notes: {mem_text} {doc_summary}

Create an actionable, Pomodoro-inspired study schedule totaling exactly {duration_minutes} minutes.
Return valid JSON with this exact structure:
{{
  "plan": [
    {{"time_range": "0-15 min", "topic": "Brief topic name", "activity": "Clear action to do"}},
    {{"time_range": "15-35 min", "topic": "Core topic name", "activity": "Deep work action"}},
    ...
  ],
  "advice": "1-2 sentences of encouraging, tailored advice"
}}
Output ONLY valid JSON."""

        try:
            status = await ollama_service.get_status()
            if status["available"]:
                raw = await ollama_service.generate(prompt, temperature=0.2)
                match = re.search(r"\{.*\}", raw, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    return {
                        "subject": subject,
                        "duration_minutes": duration_minutes,
                        "plan": data.get("plan", []),
                        "advice": data.get("advice", "Stay focused, turn off notifications, and drink water!")
                    }
        except Exception as e:
            logger.warning(f"LLM study plan failed: {e}")

        # Deterministic fallback plan
        t1 = int(duration_minutes * 0.25)
        t2 = int(duration_minutes * 0.65)
        t3 = int(duration_minutes * 0.85)
        return {
            "subject": subject,
            "duration_minutes": duration_minutes,
            "plan": [
                {"time_range": f"0–{t1} min", "topic": f"Quick review & concepts: {subject}", "activity": "Review slides and high-level principles"},
                {"time_range": f"{t1}–{t2} min", "topic": f"Deep dive: {focus_topic or 'Key problem solving'}", "activity": "Active recall and solving exercises"},
                {"time_range": f"{t2}–{t3} min", "topic": "Self-testing & practice problems", "activity": "Test knowledge without looking at notes"},
                {"time_range": f"{t3}–{duration_minutes} min", "topic": "Summary & flash cards", "activity": "Consolidate formulas and key terms"}
            ],
            "advice": f"Set your phone across the room for the next {duration_minutes} minutes. You got this!"
        }

rag_service = RAGService()
