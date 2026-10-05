"""Text extraction for uploaded documents (PDF, image via OCR, or plain text)."""
import io
from pypdf import PdfReader


def extract_text(filename: str, file_bytes: bytes) -> str:
    lower = filename.lower()
    try:
        if lower.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(pages).strip()
        if lower.endswith((".txt",)):
            return file_bytes.decode("utf-8", errors="ignore")
        if lower.endswith((".png", ".jpg", ".jpeg")):
            return _extract_with_ocr(file_bytes)
    except Exception as exc:
        return f"[Could not extract text automatically: {exc}]"
    return "[Unsupported file type for text extraction]"


def _extract_with_ocr(file_bytes: bytes) -> str:
    """OCR fallback for scanned/image documents, using pytesseract if available."""
    try:
        import pytesseract
        from PIL import Image

        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
    except Exception:
        return "[OCR engine (tesseract) not installed in this environment. Install pytesseract + tesseract-ocr to enable scanned-image understanding.]"
