from neo4j import GraphDatabase
import uuid


# Connect to Neo4j
driver = GraphDatabase.driver("neo4j://127.0.0.1:7687", auth=("neo4j", "set3password"))

def save_document(filename: str, content: str) -> str:
    doc_id = str(uuid.uuid4())
    with driver.session() as session:
        session.run(
            "CREATE (d:Document {id:$id, filename:$filename, content:$content})",
            id=doc_id, filename=filename, content=content
        )
    return doc_id

def get_document(doc_id: str):
    with driver.session() as session:
        result = session.run("MATCH (d:Document {id:$id}) RETURN d", id=doc_id).single()
        if result:
            node = result["d"]
            return {"id": node["id"], "filename": node["filename"], "content": node["content"]}
        return None

def save_entities(doc_id: str, entities: list):
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
def run_query(query: str, parameters: dict = None) -> list[dict]:
    
    
    
    """
    Execute Cypher query and return list of records as dicts.
    """
    with driver.session() as session:
        result = session.run(query, parameters or {})
        return [dict(record) for record in result]