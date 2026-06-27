import chromadb

from app.core.config import settings


def get_chroma_collection():
    """
    Create or load a local ChromaDB collection.
    """

    client = chromadb.PersistentClient(path=settings.CHROMA_PATH)

    collection = client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    return collection


def add_chunks_to_chroma(
    document_id: str,
    file_name: str,
    chunks: list[str],
    embeddings: list[list[float]]
) -> None:
    """
    Store PDF chunks and their embeddings inside ChromaDB.
    """

    if len(chunks) != len(embeddings):
        raise ValueError("Chunks and embeddings count do not match")

    collection = get_chroma_collection()

    ids = []
    metadatas = []

    for index, _chunk in enumerate(chunks):
        ids.append(f"{document_id}_chunk_{index}")

        metadatas.append({
            "document_id": document_id,
            "file_name": file_name,
            "chunk_index": index
        })

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )


def query_chroma(
    query_embedding: list[float],
    n_results: int = 5,
    document_id: str | None = None
):
    """
    Search ChromaDB for the most relevant document chunks.

    If document_id is provided, search only inside that uploaded PDF.
    If document_id is not provided, search across all uploaded PDFs.
    """

    collection = get_chroma_collection()

    query_args = {
        "query_embeddings": [query_embedding],
        "n_results": n_results
    }

    if document_id:
        query_args["where"] = {
            "document_id": document_id
        }

    results = collection.query(**query_args)

    return results