import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.document import DocumentUploadResponse
from app.services.pdf_service import extract_text_from_pdf


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a university PDF and extract text preview.
    """

    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    unique_file_name = f"{uuid4()}_{file.filename}"
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

        preview = extracted_text[:1500]

        return DocumentUploadResponse(
            file_name=file.filename,
            saved_path=str(saved_path),
            page_count=page_count,
            extracted_text_preview=preview,
            message="PDF uploaded and text extracted successfully"
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