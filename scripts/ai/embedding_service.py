# scripts/ai/embedding_service.py
# Service để generate embeddings từ OpenAI
# GEMRAL AI BRAIN - Phase 1

import os
import time
import hashlib
from typing import List, Dict, Any, Optional
from openai import OpenAI
import tiktoken

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
EMBEDDING_MODEL = 'text-embedding-3-small'
EMBEDDING_DIMENSIONS = 1536
CHUNK_SIZE = 500  # tokens
CHUNK_OVERLAP = 100  # tokens
BATCH_SIZE = 100  # texts per API call
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds

# ═══════════════════════════════════════════════════════════════════════════
# INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════════

client = None
tokenizer = None

def initialize():
    """Initialize OpenAI client and tokenizer."""
    global client, tokenizer
    if client is None:
        client = OpenAI(api_key=OPENAI_API_KEY)
    if tokenizer is None:
        tokenizer = tiktoken.get_encoding('cl100k_base')

# ═══════════════════════════════════════════════════════════════════════════
# TEXT PROCESSING
# ═══════════════════════════════════════════════════════════════════════════

def count_tokens(text: str) -> int:
    """Đếm số tokens trong text."""
    initialize()
    return len(tokenizer.encode(text))

def generate_content_hash(content: str) -> str:
    """Generate MD5 hash của content để deduplication."""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP
) -> List[str]:
    """
    Split text thành chunks với overlap.

    Args:
        text: Text cần split
        chunk_size: Số tokens mỗi chunk
        overlap: Số tokens overlap giữa các chunks

    Returns:
        List các text chunks
    """
    initialize()

    if not text or not text.strip():
        return []

    tokens = tokenizer.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text_str = tokenizer.decode(chunk_tokens)

        # Clean up chunk
        chunk_text_str = chunk_text_str.strip()
        if chunk_text_str:
            chunks.append(chunk_text_str)

        # Move to next position with overlap
        start = end - overlap

        # Prevent infinite loop
        if start >= len(tokens) - overlap:
            break

    return chunks

def smart_chunk_text(text: str) -> List[Dict[str, Any]]:
    """
    Chunk text thông minh, giữ nguyên semantic boundaries.

    Returns:
        List of {
            'text': chunk text,
            'index': chunk index,
            'token_count': number of tokens
        }
    """
    initialize()

    if not text or not text.strip():
        return []

    # Split by paragraphs first
    paragraphs = text.split('\n\n')

    chunks = []
    current_chunk = []
    current_tokens = 0
    chunk_index = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        para_tokens = count_tokens(para)

        # If single paragraph is too long, split it
        if para_tokens > CHUNK_SIZE:
            # Flush current chunk first
            if current_chunk:
                chunk_text_str = '\n\n'.join(current_chunk)
                chunks.append({
                    'text': chunk_text_str,
                    'index': chunk_index,
                    'token_count': count_tokens(chunk_text_str)
                })
                chunk_index += 1
                current_chunk = []
                current_tokens = 0

            # Split long paragraph
            sub_chunks = chunk_text(para)
            for sub_chunk in sub_chunks:
                chunks.append({
                    'text': sub_chunk,
                    'index': chunk_index,
                    'token_count': count_tokens(sub_chunk)
                })
                chunk_index += 1

        # If adding this paragraph exceeds limit
        elif current_tokens + para_tokens > CHUNK_SIZE:
            # Save current chunk
            if current_chunk:
                chunk_text_str = '\n\n'.join(current_chunk)
                chunks.append({
                    'text': chunk_text_str,
                    'index': chunk_index,
                    'token_count': count_tokens(chunk_text_str)
                })
                chunk_index += 1

            # Start new chunk
            current_chunk = [para]
            current_tokens = para_tokens

        else:
            # Add to current chunk
            current_chunk.append(para)
            current_tokens += para_tokens

    # Don't forget last chunk
    if current_chunk:
        chunk_text_str = '\n\n'.join(current_chunk)
        chunks.append({
            'text': chunk_text_str,
            'index': chunk_index,
            'token_count': count_tokens(chunk_text_str)
        })

    return chunks

# ═══════════════════════════════════════════════════════════════════════════
# EMBEDDING GENERATION
# ═══════════════════════════════════════════════════════════════════════════

def get_embedding(text: str) -> Optional[List[float]]:
    """
    Get embedding cho một text.

    Args:
        text: Text cần embed

    Returns:
        List of 1536 floats, hoặc None nếu lỗi
    """
    initialize()

    if not text or not text.strip():
        return None

    for attempt in range(MAX_RETRIES):
        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text.strip(),
            )
            return response.data[0].embedding

        except Exception as e:
            print(f'[Embedding] Attempt {attempt + 1} failed: {e}')
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                print(f'[Embedding] All retries failed for text: {text[:100]}...')
                return None

def batch_get_embeddings(
    texts: List[str],
    batch_size: int = BATCH_SIZE,
    show_progress: bool = True
) -> List[Optional[List[float]]]:
    """
    Get embeddings cho nhiều texts với batching.

    Args:
        texts: List texts cần embed
        batch_size: Số texts per API call
        show_progress: Show progress output

    Returns:
        List embeddings (có thể chứa None nếu lỗi)
    """
    initialize()

    if not texts:
        return []

    # Filter empty texts
    cleaned_texts = [t.strip() if t else '' for t in texts]

    all_embeddings = []
    total_batches = (len(cleaned_texts) + batch_size - 1) // batch_size

    for batch_idx in range(0, len(cleaned_texts), batch_size):
        batch = cleaned_texts[batch_idx:batch_idx + batch_size]
        current_batch = batch_idx // batch_size + 1

        # Skip empty batch
        valid_batch = [t for t in batch if t]
        if not valid_batch:
            all_embeddings.extend([None] * len(batch))
            continue

        for attempt in range(MAX_RETRIES):
            try:
                response = client.embeddings.create(
                    model=EMBEDDING_MODEL,
                    input=valid_batch,
                )

                # Map results back
                valid_idx = 0
                for text in batch:
                    if text:
                        all_embeddings.append(response.data[valid_idx].embedding)
                        valid_idx += 1
                    else:
                        all_embeddings.append(None)

                if show_progress:
                    print(f'  Batch {current_batch}/{total_batches} completed ({len(valid_batch)} texts)')

                break  # Success, exit retry loop

            except Exception as e:
                print(f'[Embedding] Batch {current_batch} attempt {attempt + 1} failed: {e}')
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    # All retries failed, add None for this batch
                    all_embeddings.extend([None] * len(batch))
                    print(f'[Embedding] Batch {current_batch} failed after all retries')

    return all_embeddings

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'count_tokens',
    'generate_content_hash',
    'chunk_text',
    'smart_chunk_text',
    'get_embedding',
    'batch_get_embeddings',
    'EMBEDDING_MODEL',
    'EMBEDDING_DIMENSIONS',
    'CHUNK_SIZE',
    'CHUNK_OVERLAP',
]

if __name__ == '__main__':
    # Test embedding service
    print('Testing embedding service...')
    initialize()

    test_text = '''
    Ngũ Hành và Pha Lê - Hướng Dẫn Đầy Đủ

    Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ) là nền tảng của phong thủy phương Đông.
    Mỗi mệnh có những loại đá phù hợp để tăng cường năng lượng và cân bằng cuộc sống.

    Mệnh Kim có các đặc điểm: Quyết đoán, mạnh mẽ, công bằng.
    Đá phù hợp: Citrine (Thạch Anh Vàng), Tiger Eye (Mắt Hổ), Pyrite.
    '''

    # Test token counting
    token_count = count_tokens(test_text)
    print(f'Token count: {token_count}')

    # Test chunking
    chunks = smart_chunk_text(test_text)
    print(f'Chunks: {len(chunks)}')
    for chunk in chunks:
        print(f'  - Index {chunk["index"]}: {chunk["token_count"]} tokens')

    # Test embedding (only if API key is set)
    if OPENAI_API_KEY:
        embedding = get_embedding(test_text)
        if embedding:
            print(f'Embedding dimensions: {len(embedding)}')
        else:
            print('Embedding failed')
    else:
        print('OPENAI_API_KEY not set, skipping embedding test')
