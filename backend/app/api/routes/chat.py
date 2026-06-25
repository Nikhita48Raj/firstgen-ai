from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import generate_general_answer

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/general", response_model=ChatResponse)
def general_chat(request: ChatRequest):
    answer = generate_general_answer(request)

    return ChatResponse(answer=answer)