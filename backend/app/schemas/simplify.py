from pydantic import BaseModel
from typing import Literal


class TextSimplifyRequest(BaseModel):
    text: str
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"
    audience: Literal["student", "parent"] = "student"


class SimplifyResponse(BaseModel):
    simplified_text: str
    language: str
    audience: str
    message: str