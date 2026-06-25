from pydantic import BaseModel
from typing import Literal


class ChatRequest(BaseModel):
    message: str
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"
    mode: Literal["student", "parent"] = "student"


class ChatResponse(BaseModel):
    answer: str