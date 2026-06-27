from fastapi import APIRouter, HTTPException

from app.schemas.career import (
    CareerRecommendationRequest,
    CareerRecommendationResponse,
)
from app.services.career_service import generate_career_recommendations


router = APIRouter(
    prefix="/career",
    tags=["Career Recommendation"]
)


@router.post("/recommend", response_model=CareerRecommendationResponse)
def recommend_career(request: CareerRecommendationRequest):
    if not request.branch.strip():
        raise HTTPException(status_code=400, detail="Branch is required")

    if not request.year.strip():
        raise HTTPException(status_code=400, detail="Year/Semester is required")

    if request.cgpa < 0 or request.cgpa > 10:
        raise HTTPException(status_code=400, detail="CGPA must be between 0 and 10")

    recommendations = generate_career_recommendations(request)

    return CareerRecommendationResponse(
        recommendations=recommendations,
        message="Career recommendations generated successfully"
    )