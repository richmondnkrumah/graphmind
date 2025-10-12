from neo4j import Driver
import uuid

def save_document(filename: str, content: str,driver: Driver) -> str:
    doc_id = str(uuid.uuid4())
    with driver.session() as session:
        session.run(
            "CREATE (d:Document {id:$id, filename:$filename, content:$content})",
            id=doc_id, filename=filename, content=content
        )
    return doc_id

def save_entities(doc_id: str, entities: list,driver: Driver):
    with driver.session() as session:
        for ent in entities:
            session.run(
                """
                MATCH (d:Document {id:$doc_id})
                MERGE (e:Entity {text:$text, label:$label})
                MERGE (d)-[:HAS_ENTITY]->(e)
                """,
                doc_id=doc_id, text=ent["text"], label=ent["label"]
            )
