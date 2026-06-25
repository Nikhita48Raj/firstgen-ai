from google import genai
from google.genai import types

from app.core.config import settings


def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is missing in .env file")

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_embeddings(
    texts: list[str],
    task_type: str = "RETRIEVAL_DOCUMENT",
    batch_size: int = 32
) -> list[list[float]]:
    """
    Convert text chunks into numerical embeddings using Gemini.

    For PDF chunks: RETRIEVAL_DOCUMENT
    For user questions: RETRIEVAL_QUERY
    """

    if not texts:
        return []

    client = get_gemini_client()
    all_embeddings = []

    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]

        result = client.models.embed_content(
            model=settings.GEMINI_EMBEDDING_MODEL,
            contents=batch,
            config=types.EmbedContentConfig(task_type=task_type)
        )

        batch_embeddings = [embedding.values for embedding in result.embeddings]
        all_embeddings.extend(batch_embeddings)

    return all_embeddings


def generate_query_embedding(question: str) -> list[float]:
    """
    Convert a user question into an embedding for semantic search.
    """

    embeddings = generate_embeddings(
        texts=[question],
        task_type="RETRIEVAL_QUERY",
        batch_size=1
    )

    if not embeddings:
        raise ValueError("Could not generate query embedding")

    return embeddings[0]