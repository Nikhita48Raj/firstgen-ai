import time
from google import genai

from app.core.config import settings


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def build_simplify_prompt(
    text: str,
    language: str,
    audience: str
) -> str:
    if audience == "parent":
        audience_instruction = """
Explain this to a parent who has never attended college.
Use very simple examples.
Avoid technical terms. If a technical term is needed, explain it clearly.
"""
    else:
        audience_instruction = """
Explain this to a first-generation college student.
Use simple student-friendly language.
Use examples from Indian colleges where useful.
"""

    return f"""
You are FirstGen AI, an AI assistant helping first-generation Indian college students.

Task:
Simplify the given university/college text.

Audience:
{audience}

Instructions:
{audience_instruction}

Rules:
- Answer in {language}.
- Do not remove important rules or conditions.
- Do not invent new rules.
- Keep the explanation clear and practical.
- Use headings and bullet points if useful.
- Highlight important warnings, deadlines, eligibility rules, or conditions.

Original text:
{text}
"""


def simplify_text_with_ai(
    text: str,
    language: str,
    audience: str
) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = build_simplify_prompt(
        text=text,
        language=language,
        audience=audience
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