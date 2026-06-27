from pydantic import BaseModel
from typing import Literal


class ResumeAnalysisResponse(BaseModel):
    analysis: str
    language: str
    target_role: str
    message: str