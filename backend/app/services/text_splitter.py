def split_text_into_chunks(
    text: str,
    chunk_size: int = 450,
    overlap: int = 80
) -> list[str]:
    """
    Split long PDF text into smaller overlapping chunks.

    Why chunks?
    LLMs and embedding models work better with smaller text pieces.
    Overlap prevents important context from getting cut between chunks.
    """

    words = text.split()

    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk = " ".join(chunk_words)

        if chunk.strip():
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks