import time
from google import genai

from app.core.config import settings
from app.schemas.risk import RiskPredictionRequest, RiskSummary


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def calculate_risk_summary(request: RiskPredictionRequest) -> RiskSummary:
    if request.attendance_percent < 65:
        attendance_risk = "High"
    elif request.attendance_percent < 75:
        attendance_risk = "Medium"
    else:
        attendance_risk = "Low"

    if request.active_backlogs >= 2:
        backlog_risk = "High"
    elif request.active_backlogs == 1 or request.cgpa < 6.5:
        backlog_risk = "Medium"
    else:
        backlog_risk = "Low"

    placement_score = 100

    if request.cgpa < 6:
        placement_score -= 30
    elif request.cgpa < 7:
        placement_score -= 20
    elif request.cgpa < 8:
        placement_score -= 10

    if request.active_backlogs > 0:
        placement_score -= request.active_backlogs * 15

    if request.attendance_percent < 75:
        placement_score -= 10

    if len(request.skills) < 3:
        placement_score -= 15

    if request.project_count == 0:
        placement_score -= 15
    elif request.project_count == 1:
        placement_score -= 5

    if request.internship_count == 0:
        placement_score -= 5

    placement_score = max(0, min(100, placement_score))

    high_count = 0
    medium_count = 0

    for risk in [attendance_risk, backlog_risk]:
        if risk == "High":
            high_count += 1
        elif risk == "Medium":
            medium_count += 1

    if placement_score < 50:
        high_count += 1
    elif placement_score < 70:
        medium_count += 1

    if high_count >= 1:
        overall_risk = "High"
    elif medium_count >= 1:
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    return RiskSummary(
        attendance_risk=attendance_risk,
        backlog_risk=backlog_risk,
        placement_readiness_score=placement_score,
        overall_risk=overall_risk,
    )


def build_risk_prompt(
    request: RiskPredictionRequest,
    summary: RiskSummary
) -> str:
    skills_text = ", ".join(request.skills) if request.skills else "No skills mentioned"

    return f"""
You are FirstGen AI, a supportive academic risk advisor for Indian college students.

Student Profile:
- Branch: {request.branch}
- Year/Semester: {request.year}
- CGPA: {request.cgpa}
- Attendance: {request.attendance_percent}%
- Active Backlogs: {request.active_backlogs}
- Internal Marks Average: {request.internal_marks_average}
- Skills: {skills_text}
- Project Count: {request.project_count}
- Internship Count: {request.internship_count}
- Target Role: {request.target_role}

Calculated Risk Summary:
- Attendance Risk: {summary.attendance_risk}
- Backlog Risk: {summary.backlog_risk}
- Placement Readiness Score: {summary.placement_readiness_score}/100
- Overall Risk: {summary.overall_risk}

Task:
Explain the risk prediction clearly and give practical improvement steps.

Rules:
- Answer in {request.language}.
- Use simple student-friendly language.
- Do not scare or shame the student.
- Be honest but supportive.
- Clearly explain why the risk is Low, Medium, or High.
- Give a practical 30-day improvement plan.
- Include what the student should do immediately.
- Mention that actual university rules may differ and students should verify with their college.

Output format:
1. Risk Summary
2. Why This Risk Level Was Given
3. Immediate Actions
4. 30-Day Improvement Plan
5. Placement Readiness Advice
6. Final Encouragement
"""


def generate_risk_explanation(
    request: RiskPredictionRequest,
    summary: RiskSummary
) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = build_risk_prompt(request, summary)

    models_to_try = [settings.GEMINI_MODEL]

    for model in FALLBACK_MODELS:
        if model not in models_to_try:
            models_to_try.append(model)

    last_error = ""

    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            if response.text:
                return response.text

        except Exception as error:
            last_error = str(error)

            if "503" in last_error or "UNAVAILABLE" in last_error:
                time.sleep(2)
                continue

            return f"AI service error: {last_error}"

    return "The AI model is temporarily busy. Please try again after a few minutes."