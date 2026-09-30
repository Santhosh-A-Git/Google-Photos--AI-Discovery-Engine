import os
import json
import hashlib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Mock Embedder to completely bypass PyTorch CUDA max_path limitations on Windows
class DummyEmbedder:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=384, stop_words='english')
        self.fitted = False
        
    def fit_from_db(self):
        try:
            from src.database.db_manager import SessionLocal
            from src.database.models import Conversation
            session = SessionLocal()
            convs = session.query(Conversation.raw_text).all()
            session.close()
            
            texts = [c[0] for c in convs if c[0]]
            if texts:
                self.vectorizer.fit(texts)
                self.fitted = True
        except Exception as e:
            print("Failed to fit dummy embedder on DB:", e)
            
    def encode(self, texts):
        if isinstance(texts, str):
            texts = [texts]
        if not self.fitted:
            self.fit_from_db()
        if not self.fitted:
            # Fallback if DB is empty
            self.vectorizer.fit(texts if texts else ["dummy"])
            self.fitted = True
        return self.vectorizer.transform(texts).toarray()

print("Loading mock TF-IDF embedding model (avoiding Windows max_path errors)...")
embedder = DummyEmbedder()

# In-Memory Mock of ChromaDB to avoid Native binary compilation issues
class MockCollection:
    def __init__(self, path="./chroma_mock.json"):
        self.path = path
        self.data = {"ids": [], "documents": [], "embeddings": [], "metadatas": []}
        if os.path.exists(self.path):
            try:
                with open(self.path, 'r') as f:
                    self.data = json.load(f)
            except Exception as e:
                print("Failed to load mock chroma db:", e)
                
    def _save(self):
        with open(self.path, 'w') as f:
            json.dump(self.data, f)
            
    def upsert(self, ids, documents, embeddings, metadatas):
        for i, doc_id in enumerate(ids):
            if doc_id in self.data["ids"]:
                idx = self.data["ids"].index(doc_id)
                self.data["documents"][idx] = documents[i]
                self.data["embeddings"][idx] = embeddings[i]
                self.data["metadatas"][idx] = metadatas[i]
            else:
                self.data["ids"].append(doc_id)
                self.data["documents"].append(documents[i])
                self.data["embeddings"].append(embeddings[i])
                self.data["metadatas"].append(metadatas[i])
        self._save()
        
    def query(self, query_embeddings, n_results=10):
        if not self.data["embeddings"]:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
        
        q_emb = np.array(query_embeddings[0]).flatten()
        db_emb = np.array(self.data["embeddings"])
        
        # Calculate cosine similarity using numpy
        norm_q = np.linalg.norm(q_emb)
        norm_db = np.linalg.norm(db_emb, axis=1)
        norm_db[norm_db == 0] = 1e-10
        if norm_q == 0: norm_q = 1e-10
            
        similarities = np.dot(db_emb, q_emb) / (norm_db * norm_q)
        
        # Get top n_results indices
        top_indices = similarities.argsort()[::-1][:n_results]
        
        return {
            "ids": [[self.data["ids"][i] for i in top_indices]],
            "documents": [[self.data["documents"][i] for i in top_indices]],
            "metadatas": [[self.data["metadatas"][i] for i in top_indices]],
            "distances": [[1.0 - float(similarities[i]) for i in top_indices]] 
        }

def get_chroma_collection():
    return MockCollection()

def generate_embeddings_and_upsert(conversations):
    if not conversations: return
    collection = get_chroma_collection()
    texts = [conv.raw_text for conv in conversations]
    
    vectors = embedder.encode(texts).tolist()
    
    ids = []
    documents = []
    embeddings = []
    metadatas = []
    
    for i, conv in enumerate(conversations):
        doc_id = hashlib.md5(conv.raw_text.encode('utf-8')).hexdigest()
        ids.append(f"conv_{doc_id}")
        documents.append(conv.raw_text)
        embeddings.append(vectors[i])
        metadatas.append({
            "conversation_id": conv.id,
            "source": conv.source,
            "source_type": conv.source_type,
            "timestamp": conv.timestamp.isoformat() if conv.timestamp else ""
        })
        
    collection.upsert(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
    print(f"Successfully upserted {len(ids)} vectors into mock ChromaDB.")
