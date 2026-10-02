import os
import re
from pathlib import Path
from typing import Optional
import fitz  # PyMuPDF
from docx import Document as DocxDocument

class DocumentParser:
    ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".markdown", ".docx"}
    
    @classmethod
    def is_allowed_file(cls, filename: str) -> bool:
        ext = Path(filename).suffix.lower()
        return ext in cls.ALLOWED_EXTENSIONS

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        # Remove path separators and special chars
        clean = Path(filename).name
        clean = re.sub(r"[^\w\s\.\-]", "", clean).strip()
        return clean or "document"

    @classmethod
    def extract_text_and_pages(cls, file_path: str, file_type: str) -> list[dict]:
        """Extract text chunks with page tracking.
        Returns a list of dicts: [{"content": "...", "page": 1}, ...]
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = file_type.lower().strip(".")
        pages_data = []

        if ext == "pdf":
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                text = page.get_text() or ""
                cleaned = cls.clean_text(text)
                if cleaned:
                    pages_data.append({"content": cleaned, "page": page_idx + 1})
            doc.close()

        elif ext in ("txt", "md", "markdown"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            cleaned = cls.clean_text(content)
            if cleaned:
                pages_data.append({"content": cleaned, "page": 1})

        elif ext == "docx":
            doc = DocxDocument(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            joined = "\n\n".join(full_text)
            cleaned = cls.clean_text(joined)
            if cleaned:
                pages_data.append({"content": cleaned, "page": 1})

        else:
            raise ValueError(f"Unsupported file format: {file_type}")

        return pages_data

    @staticmethod
    def clean_text(text: str) -> str:
        # Normalize whitespace, remove weird non-printable control characters
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
        return text.strip()

    @classmethod
    def chunk_document(cls, pages_data: list[dict], chunk_size: int = 600, chunk_overlap: int = 120) -> list[dict]:
        """Splits page text into coherent overlapping chunks with page metadata."""
        chunks = []
        chunk_index = 0

        for item in pages_data:
            page_text = item["content"]
            page_num = item["page"]

            # Break page_text into paragraphs or sentences
            paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
            current_chunk = ""

            for p in paragraphs:
                if len(current_chunk) + len(p) + 2 <= chunk_size:
                    current_chunk = (current_chunk + "\n\n" + p).strip()
                else:
                    if current_chunk:
                        chunks.append({
                            "chunk_index": chunk_index,
                            "content": current_chunk,
                            "page_number": page_num
                        })
                        chunk_index += 1
                        # Retain overlap from end of current_chunk
                        overlap_start = max(0, len(current_chunk) - chunk_overlap)
                        current_chunk = current_chunk[overlap_start:].strip() + "\n\n" + p
                    else:
                        # Single paragraph exceeds chunk size, split by character count
                        for i in range(0, len(p), chunk_size - chunk_overlap):
                            sub_text = p[i: i + chunk_size]
                            if sub_text.strip():
                                chunks.append({
                                    "chunk_index": chunk_index,
                                    "content": sub_text.strip(),
                                    "page_number": page_num
                                })
                                chunk_index += 1
                        current_chunk = ""

            if current_chunk.strip():
                chunks.append({
                    "chunk_index": chunk_index,
                    "content": current_chunk.strip(),
                    "page_number": page_num
                })
                chunk_index += 1

        return chunks

document_parser = DocumentParser()
