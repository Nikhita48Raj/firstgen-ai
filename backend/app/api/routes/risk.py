from fastapi import APIRouter, HTTPException

from app.schemas.risk import RiskPredictionRequest, RiskPredictionResponse
from app.services.risk_service import (
    calculate_risk_summary,
    generate_risk_explanation,
)


router = APIRouter(
    prefix="/risk",
    tags=["Student Risk Prediction"]
)


@router.post("/predict", response_model=RiskPredictionResponse)
def predict_student_risk(request: RiskPredictionRequest):
    if not request.branch.strip():
        raise HTTPException(status_code=400, detail="Branch is required")

    if not request.year.strip():
        raise HTTPException(status_code=400, detail="Year/Semester is required")

    if request.cgpa < 0 or request.cgpa > 10:
        raise HTTPException(status_code=400, detail="CGPA must be between 0 and 10")

    if request.attendance_percent < 0 or request.attendance_percent > 100:
        raise HTTPException(
            status_code=400,
            detail="Attendance percentage must be between 0 and 100"
        )

    if request.active_backlogs < 0:
        raise HTTPException(
            status_code=400,
            detail="Active backlogs cannot be negative"
        )

    if request.project_count < 0:
        raise HTTPException(
            status_code=400,
            detail="Project count cannot be negative"
        )

    if request.internship_count < 0:
        raise HTTPException(
            status_code=400,
            detail="Internship count cannot be negative"
        )

    summary = calculate_risk_summary(request)
    explanation = generate_risk_explanation(request, summary)

    return RiskPredictionResponse(
        summary=summary,
        explanation=explanation,
        message="Student risk prediction generated successfully"
    )