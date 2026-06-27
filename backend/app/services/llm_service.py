import time
from google import genai

from app.core.config import settings
from app.core.prompts import GENERAL_STUDENT_PROMPT, PARENT_MODE_PROMPT
from app.schemas.chat import ChatRequest


FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
]


def build_prompt(request: ChatRequest) -> str:
    if request.mode == "parent":
        system_prompt = PARENT_MODE_PROMPT
    else:
        system_prompt = GENERAL_STUDENT_PROMPT

    return f"""
{system_prompt}

Language required: {request.language}

Student/Parent question:
{request.message}

Rules:
- Answer in {request.language}.
- Use simple words.
- Keep the answer practical.
- Use examples from Indian colleges when useful.
- Do not give fake university-specific rules unless a document is provided.
"""


def generate_general_answer(request: ChatRequest) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = build_prompt(request)

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

    return (
        "The AI model is temporarily busy due to high demand. "
        "Please try again after a few minutes."
    )