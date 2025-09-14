import re
import spacy
from typing import List

# Load spaCy model (download with: python -m spacy download en_core_web_sm)
nlp = spacy.load("en_core_web_sm")

def clean_text(text: str) -> str:
    """Basic cleaning: remove extra whitespace and newlines."""
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def chunk_text(text: str, max_length: int = 500) -> List[str]:
    """Split text into chunks of ~max_length tokens."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_length):
        chunks.append(" ".join(words[i:i+max_length]))
    return chunks

def preprocess_document(text: str) -> dict:
    """
    Clean, chunk, and extract entities using spaCy.
    Returns dictionary with chunks and extracted entities.
    """
    text = clean_text(text)
    chunks = chunk_text(text)

    entities = []
    for chunk in chunks:
        doc = nlp(chunk)
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_
            })

    return {
        "chunks": chunks,
        "entities": entities
    }
