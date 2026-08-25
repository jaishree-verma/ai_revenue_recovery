"""
api/chat.py
------------
Chat API router for interaction between Customer Chat UI and AI Servicing Agent.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ChatMessageRequest, ChatMessageResponse
from ai.agent import AIServicingAgent

router = APIRouter(prefix="/chat", tags=["AI Chat Servicing"])

agent = AIServicingAgent()


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    summary="Send a natural language message to the AI Servicing Agent",
)
def send_chat_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
) -> ChatMessageResponse:
    result = agent.process_message(
        customer_id=payload.customer_id,
        session_id=payload.session_id,
        message=payload.message,
        db=db,
    )
    return ChatMessageResponse(
        message=result.get("message", ""),
        intent=result.get("intent", "general_query"),
        governance_decision=result.get("governance_decision"),
        action_executed=result.get("action_executed", False),
        escalated=result.get("escalated", False),
        data=result.get("data"),
        suggested_prompts=result.get("suggested_prompts"),
    )
