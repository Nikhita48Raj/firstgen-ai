from pydantic import BaseModel
from typing import Literal


class AdvisorRequest(BaseModel):
    branch: str
    year: str
    cgpa: float
    skills: list[str]
    career_goal: str
    language: Literal["English", "Tamil", "Hindi", "Telugu"] = "English"


class AdvisorResponse(BaseModel):
    roadmap: str
    message: str