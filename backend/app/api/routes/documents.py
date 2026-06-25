import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.schemas.document import DocumentUploadResponse
from app.services.embedding_service import generate_embeddings
from app.services.pdf_service import extract_text_from_pdf
from app.services.text_splitter import split_text_into_chunks
from app.vectorstore.chroma_client import add_chunks_to_chroma


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload university PDF, extract text, split into chunks,
    generate embeddings, and store in ChromaDB.
    """

    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    document_id = str(uuid4())
    unique_file_name = f"{document_id}_{file.filename}"
    saved_path = UPLOAD_DIR / unique_file_name

    try:
        with saved_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text, page_count = extract_text_from_pdf(str(saved_path))

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in this PDF"
            )

        chunks = split_text_into_chunks(extracted_text)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Could not split PDF text into chunks"
            )

        embeddings = generate_embeddings(
            chunks,
            task_type="RETRIEVAL_DOCUMENT"
        )

        add_chunks_to_chroma(
            document_id=document_id,
            file_name=file.filename,
            chunks=chunks,
            embeddings=embeddings
        )

        preview = extracted_text[:1500]

        return DocumentUploadResponse(
            document_id=document_id,
            file_name=file.filename,
            saved_path=str(saved_path),
            page_count=page_count,
            chunk_count=len(chunks),
            chroma_collection=settings.CHROMA_COLLECTION_NAME,
            extracted_text_preview=preview,
            message="PDF uploaded, chunked, embedded, and stored in ChromaDB successfully"
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(error)}"
        )

    finally:
        file.file.close()