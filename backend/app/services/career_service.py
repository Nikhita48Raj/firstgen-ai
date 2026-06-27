import time
from google import genai

from app.core.config import settings
from app.schemas.career import CareerRecommendationRequest


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def build_career_prompt(request: CareerRecommendationRequest) -> str:
    skills_text = ", ".join(request.skills) if request.skills else "No skills mentioned"
    interests_text = ", ".join(request.interests) if request.interests else "No interests mentioned"
    strengths_text = ", ".join(request.strengths) if request.strengths else "No strengths mentioned"

    return f"""
You are FirstGen AI, a career recommendation mentor for Indian college students.

Student Profile:
- Branch: {request.branch}
- Year/Semester: {request.year}
- CGPA: {request.cgpa}
- Skills: {skills_text}
- Interests: {interests_text}
- Strengths: {strengths_text}

Task:
Recommend suitable career paths for this student.

Rules:
- Answer in {request.language}.
- Use simple student-friendly language.
- Be practical for Indian college placements and internships.
- Recommend realistic options based on current profile.
- Do not discourage the student.
- Explain why each career path fits.
- Mention skill gaps clearly.
- Suggest projects for each career path.
- Suggest what to do in the next 3 months.

Output format:
1. Profile Summary
2. Top 3 Career Recommendations
3. Best Career Match
4. Why This Career Fits You
5. Skills You Already Have
6. Missing Skills to Learn
7. Project Ideas
8. Internship Preparation Plan
9. 3-Month Action Plan
10. Final Advice
"""


def generate_career_recommendations(
    request: CareerRecommendationRequest
) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = build_career_prompt(request)

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