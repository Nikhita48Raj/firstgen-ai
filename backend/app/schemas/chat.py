from pydantic import BaseModel
from typing import Literal


class ChatRequest(BaseModel):
    message: str
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"
    mode: Literal["student", "parent"] = "student"


class ChatResponse(BaseModel):
    answer: str


class RAGChatRequest(BaseModel):
    message: str
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"
    document_id: str | None = None


class SourceChunk(BaseModel):
    document_id: str | None = None
    file_name: str | None = None
    chunk_index: int | None = None
    preview: str


class RAGChatResponse(BaseModel):
    answer: str
    source_count: int
    sources: list[SourceChunk]