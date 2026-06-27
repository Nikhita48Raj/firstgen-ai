from pydantic import BaseModel
from typing import Literal


class RiskPredictionRequest(BaseModel):
    branch: str
    year: str
    cgpa: float
    attendance_percent: float
    active_backlogs: int
    internal_marks_average: float | None = None
    skills: list[str] = []
    project_count: int = 0
    internship_count: int = 0
    target_role: str = "Software Engineering Internship"
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"


class RiskSummary(BaseModel):
    attendance_risk: Literal["Low", "Medium", "High"]
    backlog_risk: Literal["Low", "Medium", "High"]
    placement_readiness_score: int
    overall_risk: Literal["Low", "Medium", "High"]


class RiskPredictionResponse(BaseModel):
    summary: RiskSummary
    explanation: str
    message: str