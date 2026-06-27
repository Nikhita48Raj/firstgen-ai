import time
from google import genai

from app.core.config import settings
from app.schemas.advisor import AdvisorRequest


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def build_advisor_prompt(request: AdvisorRequest) -> str:
    skills_text = ", ".join(request.skills) if request.skills else "No skills mentioned"

    return f"""
You are FirstGen AI, a personalized academic and career advisor for Indian college students.

Student Profile:
- Branch: {request.branch}
- Year/Semester: {request.year}
- CGPA: {request.cgpa}
- Current Skills: {skills_text}
- Career Goal: {request.career_goal}

Task:
Create a personalized roadmap for this student.

Rules:
- Answer in {request.language}.
- Use simple student-friendly language.
- Be realistic for an Indian college student.
- Do not discourage the student if CGPA is low.
- Give practical steps for the next 3 months, 6 months, and 1 year.
- Include academic improvement tips.
- Include skill-building suggestions.
- Include internship/project suggestions.
- Include placement preparation advice.
- Mention what to avoid.
- Keep the tone supportive and mentor-like.

Output format:
1. Student Profile Summary
2. Strengths
3. Weak Areas to Improve
4. 3-Month Roadmap
5. 6-Month Roadmap
6. 1-Year Roadmap
7. Project Ideas
8. Internship/Placement Preparation
9. Final Advice
"""


def generate_personalized_roadmap(request: AdvisorRequest) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = build_advisor_prompt(request)

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