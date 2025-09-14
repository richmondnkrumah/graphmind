import uuid
from typing import List
from fastapi import UploadFile, APIRouter, File, HTTPException
from app.services.file_parser import parse_file
from app.services.preprocess import preprocess_document
from app.services.neo4j import save_document, get_document, run_query, save_entities

from fastapi import APIRouter, HTTPException
from neo4j import GraphDatabase
router = APIRouter()

@router.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Accepts up to 3 documents (PDF, DOCX, TXT), saves to Neo4j,
    immediately preprocesses with spaCy, and stores entities.
    """
    if len(files) > 3:
        raise HTTPException(status_code=400, detail="You can upload up to 3 files only.")

    results = []
    for file in files:
        # 1. Parse file content
        text = await parse_file(file)

        # 2. Save the raw document
        doc_id = save_document(file.filename, text)

        # 3. Preprocess document with spaCy (chunks + entities)
        result = preprocess_document(text)

        # 4. Save entities linked to this document
        save_entities(doc_id, result["entities"])

        results.append({
            "id": doc_id,
            "filename": file.filename,
            "preview": text[:500],
            "entities_preview": result["entities"][:10]  # first 10 entities
        })

    return {"documents": results}

# @router.post("/preprocess/{doc_id}")
# async def preprocess(doc_id: str):
#     """
#     Fetch raw text from Neo4j by doc_id, preprocess with spaCy,
#     store entities back into Neo4j.
#     """
#     document = get_document(doc_id)
#     if not document:
#         raise HTTPException(status_code=404, detail="Document not found.")

#     result = preprocess_document(document["content"])
#     save_entities(doc_id, result["entities"])

#     return {
#         "doc_id": doc_id,
#         "chunks_preview": result["chunks"][:3],
#         "entities_preview": result["entities"][:10]  # first 10 entities
#     }



driver = GraphDatabase.driver("neo4j://127.0.0.1:7687", auth=("neo4j", "set3password"))


@router.get("/graph/{doc_id}")
async def get_graph(doc_id: str):
    """
    Return nodes + edges for Cytoscape.
    Each document is a root node connected to entity nodes.
    """
    with driver.session() as session:
        query = """
        MATCH (d:Document {id: $doc_id})-[:HAS_ENTITY]->(e:Entity)
        RETURN d, e, 'HAS_ENTITY' as rel
        """
        results = session.run(query, doc_id=doc_id)

        nodes = {}
        edges = []

        for record in results:
            d = record["d"]
            e = record["e"]
            rel = record["rel"]

            # Add document node once
            if d.id not in nodes:
                nodes[d.id] = {
                    "id": d.id,
                    "label": d.get("label", "Document"),
                    "description": d.get("text", "Uploaded document")
                }

            # Add entity node
            if e.id not in nodes:
                nodes[e.id] = {
                    "id": e.id,
                    "label": e.get("label", "Entity"),
                    "description": e.get("text", "")
                }

            # Add edge
            edges.append({
                "source": d.id,
                "target": e.id,
                "label": rel
            })

        if not nodes:
            raise HTTPException(status_code=404, detail="Graph not found")

        return {"id": doc_id, "nodes": list(nodes.values()), "edges": edges}

@router.get("/documents")
async def list_documents():
    """
    Return all documents stored in Neo4j with their id + title/filename.
    Used to populate sidebar in the UI.
    """
    with driver.session() as session:
        query = """
        MATCH (d:Document)
        RETURN d.id AS id, d.filename AS filename
        ORDER BY d.filename
        """
        results = session.run(query)

        documents = []
        for record in results:
            documents.append({
                "id": record["id"],
                # Prefer label > filename > fallback name
                "title": record["filename"]
            })

        if not documents:
            raise HTTPException(status_code=404, detail="No documents found")

        return documents