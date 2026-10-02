import json
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Conversation, Message, ActivityLog
from app.schemas.schemas import ChatRequest, ChatResponse, ConversationOut, ConversationDetailOut, MessageOut, SourceCitation
from app.services.rag_service import rag_service

router = APIRouter()

@router.get("/conversations", response_model=list[ConversationOut])
def get_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages_out = []
    for msg in conv.messages:
        sources_list = []
        if msg.sources_json:
            try:
                sources_list = [SourceCitation(**s) for s in json.loads(msg.sources_json)]
            except Exception:
                sources_list = []
        messages_out.append(MessageOut(
            id=msg.id,
            conversation_id=msg.conversation_id,
            role=msg.role,
            content=msg.content,
            sources=sources_list,
            created_at=msg.created_at
        ))

    return ConversationDetailOut(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=messages_out
    )

@router.post("/chat", response_model=ChatResponse)
async def chat(data: ChatRequest, db: Session = Depends(get_db)):
    # 1. Get or create conversation
    conv = None
    if data.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == data.conversation_id).first()
    
    if not conv:
        # Title conversation based on the first prompt
        title = data.message.strip()[:40] + ("..." if len(data.message.strip()) > 40 else "")
        conv = Conversation(title=title)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2. Record User Message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=data.message.strip(),
        sources_json="[]"
    )
    db.add(user_msg)
    db.commit()

    # 3. Retrieve conversation history for context
    history_records = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in history_records[-6:]]

    # 4. Invoke RAG pipeline
    answer, citations = await rag_service.answer_question(
        db=db,
        question=data.message.strip(),
        conversation_history=history
    )

    # 5. Record Assistant Message
    sources_data = [c.model_dump() for c in citations]
    bot_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=answer,
        sources_json=json.dumps(sources_data)
    )
    db.add(bot_msg)
    conv.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(bot_msg)

    return ChatResponse(
        conversation_id=conv.id,
        message=answer,
        sources=citations,
        created_at=bot_msg.created_at
    )

@router.delete("/conversations/{conversation_id}", status_code=200)
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully", "id": conversation_id}
