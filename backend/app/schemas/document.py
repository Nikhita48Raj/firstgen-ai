from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    file_name: str
    saved_path: str
    page_count: int
    extracted_text_preview: str
    message: str