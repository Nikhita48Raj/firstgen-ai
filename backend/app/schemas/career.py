from pydantic import BaseModel
from typing import Literal


class CareerRecommendationRequest(BaseModel):
    branch: str
    year: str
    cgpa: float
    skills: list[str]
    interests: list[str]
    strengths: list[str]
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"


class CareerRecommendationResponse(BaseModel):
    recommendations: str
    message: str