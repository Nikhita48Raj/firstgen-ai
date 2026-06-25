from pathlib import Path
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
    """
    Extract text from a PDF file.

    Returns:
        extracted_text: complete extracted text
        page_count: number of pages in the PDF
    """

    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError("PDF file not found")

    reader = PdfReader(str(pdf_path))
    page_count = len(reader.pages)

    extracted_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            extracted_text += page_text + "\n\n"

    return extracted_text.strip(), page_count