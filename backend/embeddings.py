import math
import re
import os
import hashlib
from typing import List, Optional, Any
import numpy as np

# Hash dimension for deterministic local vector fallback
LOCAL_VECTOR_DIM = 256

STOPWORDS = {
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 
    'of', 'it', 'this', 'that', 'i', 'my', 'me', 'we', 'you', 'your', 'he', 'she',
    'they', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'but', 'if', 'so', 'with', 'as', 'what', 'when', 'how', 'who'
}

def _tokenize(text: str) -> List[str]:
    """Tokenizes and normalizes text into alphanumeric tokens."""
    return re.findall(r'\w+', text.lower())

def generate_local_embedding(text: str, dim: int = LOCAL_VECTOR_DIM) -> List[float]:
    """
    Generates a deterministic semantic n-gram hashed feature vector for text.
    Provides fast, zero-dependency, local embeddings for similarity matching.
    """
    tokens = _tokenize(text)
    if not tokens:
        return [0.0] * dim
        
    vector = np.zeros(dim, dtype=np.float32)
    
    # 1. Unigram hashing with stopword damping
    for i, token in enumerate(tokens):
        weight = 0.2 if token in STOPWORDS else 1.0
        h_uni = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16) % dim
        vector[h_uni] += weight
        
        # Bigram hash
        if i < len(tokens) - 1:
            next_tok = tokens[i+1]
            bigram = f"{token}_{next_tok}"
            bi_weight = 0.3 if (token in STOPWORDS and next_tok in STOPWORDS) else 0.8
            h_bi = int(hashlib.md5(bigram.encode('utf-8')).hexdigest(), 16) % dim
            vector[h_bi] += bi_weight

        # Character subword 3-grams for content words
        if len(token) >= 4 and token not in STOPWORDS:
            for c in range(len(token) - 2):
                char_tri = token[c:c+3]
                h_char = int(hashlib.md5(char_tri.encode('utf-8')).hexdigest(), 16) % dim
                vector[h_char] += 0.4

    # L2 normalize
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
        
    return vector.tolist()

async def get_embedding(text: str, client_override: Optional[Any] = None) -> List[float]:
    """
    Retrieves vector embedding for text.
    Uses local semantic hash vector as robust base.
    """
    return generate_local_embedding(text)

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return float(np.dot(a, b) / (norm_a * norm_b))
