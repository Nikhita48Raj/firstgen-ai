from fastapi import APIRouter, HTTPException

from app.schemas.advisor import AdvisorRequest, AdvisorResponse
from app.services.advisor_service import generate_personalized_roadmap


router = APIRouter(
    prefix="/advisor",
    tags=["Academic Advisor"]
)


@router.post("/roadmap", response_model=AdvisorResponse)
def create_roadmap(request: AdvisorRequest):
    if not request.branch.strip():
        raise HTTPException(status_code=400, detail="Branch is required")

    if not request.year.strip():
        raise HTTPException(status_code=400, detail="Year/Semester is required")

    if request.cgpa < 0 or request.cgpa > 10:
        raise HTTPException(status_code=400, detail="CGPA must be between 0 and 10")

    if not request.career_goal.strip():
        raise HTTPException(status_code=400, detail="Career goal is required")

    roadmap = generate_personalized_roadmap(request)

    return AdvisorResponse(
        roadmap=roadmap,
        message="Personalized roadmap generated successfully"
    )