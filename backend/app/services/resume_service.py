import time
from google import genai

from app.core.config import settings


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def build_resume_prompt(
    resume_text: str,
    target_role: str,
    language: str
) -> str:
    return f"""
You are FirstGen AI, a resume mentor for Indian college students.

The student is applying for this role:
{target_role}

Task:
Analyze the resume text and give practical improvement suggestions.

Rules:
- Answer in {language}.
- Use simple student-friendly language.
- Be honest but supportive.
- Do not insult or discourage the student.
- Focus on internship and placement readiness.
- Give specific improvements, not generic advice.
- If the resume lacks important sections, mention them clearly.

Output format:

1. Overall Resume Score out of 100
2. ATS Friendliness
3. Strengths
4. Weak Areas
5. Missing Skills for {target_role}
6. Project Improvement Suggestions
7. Internship/Placement Readiness
8. Better Resume Bullet Examples
9. Final Action Plan for Next 7 Days

Resume text:
{resume_text}
"""


def analyze_resume_with_ai(
    resume_text: str,
    target_role: str,
    language: str
) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = build_resume_prompt(
        resume_text=resume_text,
        target_role=target_role,
        language=language
    )

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