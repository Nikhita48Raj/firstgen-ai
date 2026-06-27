from google import genai

from app.core.config import settings
from app.schemas.chat import RAGChatRequest, RAGChatResponse, SourceChunk
from app.services.embedding_service import generate_query_embedding
from app.vectorstore.chroma_client import query_chroma


def build_rag_prompt(
    question: str,
    language: str,
    context_chunks: list[str]
) -> str:
    context_text = "\n\n---\n\n".join(context_chunks)

    return f"""
You are FirstGen AI, a helpful college guide for first-generation Indian students.

Answer the question using ONLY the uploaded university document context below.

If the answer is not clearly available in the uploaded document context, say:
"The uploaded document does not clearly mention this."

Do not invent university rules.
Do not give fake placement, attendance, backlog, or CGPA policies.
Explain in simple student-friendly language.
Answer in this language: {language}

Uploaded document context:
{context_text}

Student question:
{question}
"""


def generate_answer_from_context(
    question: str,
    language: str,
    context_chunks: list[str]
) -> str:
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is missing. Please add GEMINI_API_KEY in your .env file."

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = build_rag_prompt(
        question=question,
        language=language,
        context_chunks=context_chunks
    )

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt
    )

    if response.text:
        return response.text

    return "I could not generate an answer from the uploaded document."


def extract_sources_from_chroma_results(results) -> tuple[list[str], list[SourceChunk]]:
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    context_chunks = []
    sources = []

    for index, document_text in enumerate(documents):
        metadata = metadatas[index] if index < len(metadatas) else {}

        context_chunks.append(document_text)

        sources.append(
            SourceChunk(
                document_id=metadata.get("document_id"),
                file_name=metadata.get("file_name"),
                chunk_index=metadata.get("chunk_index"),
                preview=document_text[:300]
            )
        )

    return context_chunks, sources


def answer_question_from_documents(request: RAGChatRequest) -> RAGChatResponse:
    query_embedding = generate_query_embedding(request.message)

    results = query_chroma(
        query_embedding=query_embedding,
        n_results=5,
        document_id=request.document_id
    )

    context_chunks, sources = extract_sources_from_chroma_results(results)

    if not context_chunks:
        return RAGChatResponse(
            answer="I could not find relevant information in the uploaded document.",
            source_count=0,
            sources=[]
        )

    answer = generate_answer_from_context(
        question=request.message,
        language=request.language,
        context_chunks=context_chunks
    )

    return RAGChatResponse(
        answer=answer,
        source_count=len(sources),
        sources=sources
    )