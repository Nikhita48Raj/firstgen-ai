from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    saved_path: str
    page_count: int
    chunk_count: int
    chroma_collection: str
    extracted_text_preview: str
    message: str