import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.resume import ResumeAnalysisResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.resume_service import analyze_resume_with_ai


router = APIRouter(
    prefix="/resume",
    tags=["Resume Analyzer"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineering Internship"),
    language: str = Form("English")
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are allowed")

    if language not in ["English", "Tamil", "Hindi", "Telugu"]:
        raise HTTPException(status_code=400, detail="Unsupported language")

    if not target_role.strip():
        raise HTTPException(status_code=400, detail="Target role is required")

    unique_file_name = f"{uuid4()}_{file.filename}"
    saved_path = UPLOAD_DIR / unique_file_name

    try:
        with saved_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text, page_count = extract_text_from_pdf(str(saved_path))

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in this resume PDF"
            )

        text_for_analysis = resume_text[:12000]

        analysis = analyze_resume_with_ai(
            resume_text=text_for_analysis,
            target_role=target_role,
            language=language
        )

        return ResumeAnalysisResponse(
            analysis=analysis,
            language=language,
            target_role=target_role,
            message=f"Resume analyzed successfully. Pages processed: {page_count}"
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(error)}"
        )

    finally:
        file.file.close()