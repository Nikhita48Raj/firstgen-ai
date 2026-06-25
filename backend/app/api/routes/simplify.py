import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.simplify import TextSimplifyRequest, SimplifyResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.simplify_service import simplify_text_with_ai


router = APIRouter(
    prefix="/simplify",
    tags=["Simplifier"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/text", response_model=SimplifyResponse)
def simplify_text(request: TextSimplifyRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    simplified = simplify_text_with_ai(
        text=request.text,
        language=request.language,
        audience=request.audience
    )

    return SimplifyResponse(
        simplified_text=simplified,
        language=request.language,
        audience=request.audience,
        message="Text simplified successfully"
    )


@router.post("/pdf", response_model=SimplifyResponse)
async def simplify_pdf(
    file: UploadFile = File(...),
    language: str = Form("English"),
    audience: str = Form("student")
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if language not in ["English", "Tamil", "Hindi", "Telugu"]:
        raise HTTPException(status_code=400, detail="Unsupported language")

    if audience not in ["student", "parent"]:
        raise HTTPException(status_code=400, detail="Unsupported audience")

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

        # Limit text for MVP so we don't overload Gemini.
        text_for_simplification = extracted_text[:12000]

        simplified = simplify_text_with_ai(
            text=text_for_simplification,
            language=language,
            audience=audience
        )

        return SimplifyResponse(
            simplified_text=simplified,
            language=language,
            audience=audience,
            message=f"PDF simplified successfully. Pages processed: {page_count}"
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"PDF simplification failed: {str(error)}"
        )

    finally:
        file.file.close()