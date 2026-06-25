from fastapi import APIRouter

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    RAGChatRequest,
    RAGChatResponse
)
from app.services.llm_service import generate_general_answer
from app.services.rag_service import answer_question_from_documents


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/general", response_model=ChatResponse)
def general_chat(request: ChatRequest):
    answer = generate_general_answer(request)

    return ChatResponse(answer=answer)


@router.post("/rag", response_model=RAGChatResponse)
def rag_chat(request: RAGChatRequest):
    return answer_question_from_documents(request)