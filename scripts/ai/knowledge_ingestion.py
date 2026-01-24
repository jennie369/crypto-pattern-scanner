# scripts/ai/knowledge_ingestion.py
# Pipeline để ingest knowledge vào database
# GEMRAL AI BRAIN - Phase 1

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from supabase import create_client, Client

from embedding_service import (
    smart_chunk_text,
    batch_get_embeddings,
    generate_content_hash,
    count_tokens
)

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Supabase client
supabase: Client = None

def initialize():
    """Initialize Supabase client."""
    global supabase
    if supabase is None:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ═══════════════════════════════════════════════════════════════════════════
# DOCUMENT LOADERS
# ═══════════════════════════════════════════════════════════════════════════

def load_markdown_file(file_path: str) -> Dict[str, Any]:
    """Load document từ file markdown."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from first heading
    lines = content.split('\n')
    title = Path(file_path).stem
    for line in lines:
        if line.startswith('# '):
            title = line[2:].strip()
            break

    return {
        'title': title,
        'content': content,
        'source_url': str(file_path),
    }

def load_json_knowledge(file_path: str) -> List[Dict[str, Any]]:
    """Load documents từ file JSON."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    documents = []
    for item in data:
        documents.append({
            'title': item.get('title', 'Untitled'),
            'content': item.get('content', ''),
            'source_url': item.get('source_url', file_path),
            'category': item.get('category'),
            'tags': item.get('tags', []),
        })

    return documents

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════

def check_duplicate(content_hash: str) -> Optional[str]:
    """Check nếu document đã tồn tại."""
    initialize()

    result = supabase.table('ai_knowledge_documents').select('id').eq(
        'content_hash', content_hash
    ).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['id']
    return None

def upsert_document(
    doc: Dict[str, Any],
    source_type: str
) -> Optional[str]:
    """
    Insert hoặc update document trong database.

    Returns:
        Document ID nếu thành công, None nếu lỗi
    """
    initialize()

    content_hash = generate_content_hash(doc['content'])

    # Check duplicate
    existing_id = check_duplicate(content_hash)
    if existing_id:
        print(f'  [SKIP] Document already exists: {doc["title"]}')
        return existing_id

    # Check by source_url
    result = supabase.table('ai_knowledge_documents').select('id').eq(
        'source_url', doc.get('source_url', '')
    ).execute()

    if result.data and len(result.data) > 0:
        # Update existing
        doc_id = result.data[0]['id']
        supabase.table('ai_knowledge_documents').update({
            'title': doc['title'],
            'content': doc['content'],
            'content_hash': content_hash,
            'category': doc.get('category'),
            'tags': doc.get('tags', []),
            'updated_at': datetime.utcnow().isoformat(),
        }).eq('id', doc_id).execute()

        # Delete old chunks
        supabase.table('ai_knowledge_chunks').delete().eq('document_id', doc_id).execute()

        print(f'  [UPDATE] Updated existing document: {doc["title"]}')
        return doc_id
    else:
        # Insert new
        insert_data = {
            'title': doc['title'],
            'content': doc['content'],
            'content_hash': content_hash,
            'source_type': source_type,
            'source_url': doc.get('source_url', ''),
            'category': doc.get('category'),
            'tags': doc.get('tags', []),
        }

        result = supabase.table('ai_knowledge_documents').insert(insert_data).execute()

        if result.data and len(result.data) > 0:
            print(f'  [INSERT] Inserted new document: {doc["title"]}')
            return result.data[0]['id']
        else:
            print(f'  [ERROR] Failed to insert document: {doc["title"]}')
            return None

def insert_chunks(
    document_id: str,
    chunks: List[Dict[str, Any]],
    embeddings: List[List[float]]
) -> int:
    """
    Insert chunks với embeddings vào database.

    Returns:
        Số chunks đã insert thành công
    """
    initialize()

    if len(chunks) != len(embeddings):
        print(f'  [ERROR] Chunk/embedding count mismatch: {len(chunks)} vs {len(embeddings)}')
        return 0

    records = []
    for chunk, embedding in zip(chunks, embeddings):
        if embedding is None:
            continue

        records.append({
            'document_id': document_id,
            'chunk_text': chunk['text'],
            'chunk_index': chunk['index'],
            'embedding': embedding,
            'token_count': chunk['token_count'],
            'metadata': {},
        })

    if not records:
        return 0

    # Insert in batches of 50
    batch_size = 50
    inserted = 0

    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            result = supabase.table('ai_knowledge_chunks').insert(batch).execute()
            if result.data:
                inserted += len(result.data)
        except Exception as e:
            print(f'  [ERROR] Error inserting chunk batch: {e}')

    return inserted

def update_document_indexed(document_id: str):
    """Update last_indexed_at timestamp."""
    initialize()

    supabase.table('ai_knowledge_documents').update({
        'last_indexed_at': datetime.utcnow().isoformat()
    }).eq('id', document_id).execute()

# ═══════════════════════════════════════════════════════════════════════════
# MAIN INGESTION FUNCTION
# ═══════════════════════════════════════════════════════════════════════════

def ingest_document(
    doc: Dict[str, Any],
    source_type: str,
    show_progress: bool = True
) -> bool:
    """
    Ingest một document hoàn chỉnh.

    Args:
        doc: Document dict với title, content, source_url
        source_type: spiritual, trading, product, etc.
        show_progress: Show progress output

    Returns:
        True nếu thành công
    """
    if show_progress:
        print(f'\n[DOC] Processing: {doc.get("title", "Unknown")}')

    # Step 1: Upsert document
    doc_id = upsert_document(doc, source_type)
    if not doc_id:
        return False

    # Step 2: Chunk content
    chunks = smart_chunk_text(doc['content'])
    if not chunks:
        print(f'  [WARN] No chunks created (empty content?)')
        return False

    if show_progress:
        print(f'  [CHUNK] Created {len(chunks)} chunks')

    # Step 3: Generate embeddings
    chunk_texts = [c['text'] for c in chunks]
    embeddings = batch_get_embeddings(chunk_texts, show_progress=show_progress)

    # Count successful embeddings
    valid_count = sum(1 for e in embeddings if e is not None)
    if show_progress:
        print(f'  [EMBED] Generated {valid_count}/{len(chunks)} embeddings')

    # Step 4: Insert chunks
    inserted = insert_chunks(doc_id, chunks, embeddings)
    if show_progress:
        print(f'  [STORE] Inserted {inserted} chunks')

    # Step 5: Update timestamp
    update_document_indexed(doc_id)

    if show_progress:
        print(f'  [DONE] {doc.get("title", "Unknown")}')

    return inserted > 0

def ingest_directory(
    directory: str,
    source_type: str,
    file_pattern: str = '**/*.md'
) -> Dict[str, int]:
    """
    Ingest tất cả files trong directory.

    Returns:
        Stats dict với success, failed counts
    """
    path = Path(directory)
    stats = {'success': 0, 'failed': 0, 'skipped': 0}

    for file_path in path.glob(file_pattern):
        try:
            doc = load_markdown_file(str(file_path))
            if ingest_document(doc, source_type):
                stats['success'] += 1
            else:
                stats['failed'] += 1
        except Exception as e:
            print(f'[ERROR] Error processing {file_path}: {e}')
            stats['failed'] += 1

    return stats

# ═══════════════════════════════════════════════════════════════════════════
# GEMRAL SPECIFIC KNOWLEDGE
# ═══════════════════════════════════════════════════════════════════════════

def ingest_gemral_spiritual_knowledge():
    """Ingest Gemral spiritual knowledge."""
    print('\n' + '='*60)
    print('INGESTING SPIRITUAL KNOWLEDGE')
    print('='*60)

    documents = [
        {
            'title': 'Ngu Hanh va Pha Le - Huong Dan Day Du',
            'content': '''
# Ngu Hanh va Pha Le - Huong Dan Day Du

## Gioi Thieu

Ngu Hanh (Kim, Moc, Thuy, Hoa, Tho) la nen tang cua phong thuy phuong Dong. Moi menh co nhung loai da phu hop de tang cuong nang luong va can bang cuoc song.

## Menh Kim (1960, 1961, 1970, 1971, 1980, 1981, 1990, 1991, 2000, 2001)

### Dac Diem
- Tinh cach: Quyet doan, manh me, cong bang
- Yeu to: Kim loai, mau trang, vang kim
- Huong tot: Tay, Tay Bac

### Da Phu Hop
1. **Citrine (Thach Anh Vang)**
   - Tac dung: Thu hut tai loc, tang cuong su tu tin
   - Cach deo: Tay phai de thu hut nang luong
   - Chakra: Solar Plexus (Dam roi mat troi)

2. **Tiger Eye (Mat Ho)**
   - Tac dung: Bao ve, tang su quyet doan
   - Cach deo: Co tay hoac day chuyen
   - Chakra: Solar Plexus, Sacral

3. **Pyrite (Vang Thien Nhien)**
   - Tac dung: Tai chinh, nang luong duong
   - Cach deo: Dat trong nha hoac van phong
   - Chakra: Solar Plexus

## Menh Moc (1962, 1963, 1972, 1973, 1982, 1983, 1992, 1993, 2002, 2003)

### Dac Diem
- Tinh cach: Sang tao, tu do, nhan ai
- Yeu to: Go, cay co, mau xanh la
- Huong tot: Dong, Dong Nam

### Da Phu Hop
1. **Green Aventurine (Thach Anh Xanh La)**
   - Tac dung: May man, co hoi moi
   - Cach deo: Tay trai de nhan nang luong
   - Chakra: Heart (Tim)

2. **Malachite (Khong Tuoc Thach)**
   - Tac dung: Bao ve, chuyen hoa
   - Cach deo: Day chuyen gan tim
   - Chakra: Heart, Throat

3. **Jade (Ngoc Phi Thuy)**
   - Tac dung: Binh an, truong tho
   - Cach deo: Vong tay hoac day chuyen
   - Chakra: Heart

## Menh Thuy (1964, 1965, 1974, 1975, 1984, 1985, 1994, 1995, 2004, 2005)

### Dac Diem
- Tinh cach: Thong minh, linh hoat, truc giac manh
- Yeu to: Nuoc, mau xanh duong, den
- Huong tot: Bac, Tay Bac

### Da Phu Hop
1. **Aquamarine (Da Bich Ngoc)**
   - Tac dung: Binh an, giao tiep
   - Cach deo: Day chuyen hoac nhan
   - Chakra: Throat (Hong)

2. **Lapis Lazuli (Da Thanh Kim)**
   - Tac dung: Tri tue, su that
   - Cach deo: Gan co de kich hoat Throat chakra
   - Chakra: Third Eye, Throat

3. **Obsidian (Hac Nhien Thach)**
   - Tac dung: Bao ve, thanh loc
   - Cach deo: Tay trai hoac dat trong nha
   - Chakra: Root (Goc)

## Menh Hoa (1966, 1967, 1976, 1977, 1986, 1987, 1996, 1997, 2006, 2007)

### Dac Diem
- Tinh cach: Nhiet tinh, nam dong, lanh dao
- Yeu to: Lua, mau do, cam, hong
- Huong tot: Nam, Dong Nam

### Da Phu Hop
1. **Carnelian (Hong Ngoc Tuyet)**
   - Tac dung: Nang luong, dam me
   - Cach deo: Vong tay hoac day chuyen
   - Chakra: Sacral, Root

2. **Garnet (Luu Ly)**
   - Tac dung: Tinh yeu, suc khoe
   - Cach deo: Nhan hoac vong tay
   - Chakra: Root, Heart

3. **Ruby (Hong Ngoc)**
   - Tac dung: Quyen luc, bao ve
   - Cach deo: Nhan hoac day chuyen
   - Chakra: Heart, Root

## Menh Tho (1968, 1969, 1978, 1979, 1988, 1989, 1998, 1999, 2008, 2009)

### Dac Diem
- Tinh cach: On dinh, dang tin cay, thuc te
- Yeu to: Dat, mau vang, nau
- Huong tot: Trung tam, Tay Nam, Dong Bac

### Da Phu Hop
1. **Tiger Eye (Mat Ho)**
   - Tac dung: Bao ve, tap trung
   - Cach deo: Vong tay hoac mat day chuyen
   - Chakra: Solar Plexus

2. **Yellow Jasper (Bach Ngoc Vang)**
   - Tac dung: On dinh, bao ve khi di chuyen
   - Cach deo: Vong tay hoac dat trong tui
   - Chakra: Solar Plexus

3. **Smoky Quartz (Thach Anh Khoi)**
   - Tac dung: Tiep dat, giai toa stress
   - Cach deo: Vong tay hoac dat tren ban lam viec
   - Chakra: Root

## Cach Su Dung Da Pha Le

### Lam Sach Da
1. Ngam trong nuoc muoi 4-8 tieng
2. Phoi duoi anh trang 1 dem
3. Xong kho (sage, tram huong)

### Nap Nang Luong
1. Phoi sang (mat troi hoac mat trang)
2. Dat len cum thach anh
3. Meditate cung da

### Bao Quan
1. Tranh tiep xuc hoa chat
2. Bao quan trong tui vai
3. Khong de chung voi nhau
            ''',
            'source_url': 'internal://gemral/spiritual/ngu_hanh_pha_le',
            'category': 'crystals',
            'tags': ['ngu_hanh', 'pha_le', 'phong_thuy', 'menh'],
        },
        {
            'title': 'Tarot - Huong Dan Doc Bai Co Ban',
            'content': '''
# Tarot - Huong Dan Doc Bai Co Ban

## Gioi Thieu ve Tarot

Tarot la mot bo bai gom 78 la, duoc chia thanh 2 nhom chinh:
- **Major Arcana (22 la)**: Dai dien cho cac bai hoc lon va chuyen doi trong cuoc song
- **Minor Arcana (56 la)**: Dai dien cho cac su kien hang ngay

## Major Arcana - Y Nghia Chinh

### 0. The Fool (Ke Ngoc)
- **Y nghia thuan**: Khoi dau moi, phieu luu, tu do
- **Y nghia nguoc**: Lieu linh, thieu suy nghi, ngay tho

### I. The Magician (Phap Su)
- **Y nghia thuan**: Kha nang, suc manh, y chi
- **Y nghia nguoc**: Lua doi, tham vong, bi dung

### II. The High Priestess (Nu Tu Te)
- **Y nghia thuan**: Truc giac, bi mat, su that noi tam
- **Y nghia nguoc**: Bi mat bi lo, thieu ket noi tam linh

### III. The Empress (Nu Hoang)
- **Y nghia thuan**: Doi dao, sinh san, thien nhien
- **Y nghia nguoc**: Phu thuoc, trong rong, thieu sang tao

### IV. The Emperor (Hoang De)
- **Y nghia thuan**: Quyen luc, cau truc, cha
- **Y nghia nguoc**: Doc doan, cung nhac, thieu ky luat

### V. The Hierophant (Giao Hoang)
- **Y nghia thuan**: Truyen thong, giao duc, tam linh
- **Y nghia nguoc**: Noi loan, khong chinh thong

### VI. The Lovers (Nguoi Yeu)
- **Y nghia thuan**: Tinh yeu, lua chon, hoa hop
- **Y nghia nguoc**: Mat can bang, khong dong dieu

### VII. The Chariot (Co Xe)
- **Y nghia thuan**: Chien thang, y chi, quyet tam
- **Y nghia nguoc**: That bai, thieu huong di

### VIII. Strength (Suc Manh)
- **Y nghia thuan**: Can dam, kien nhan, thuong cam
- **Y nghia nguoc**: Yeu duoi, nghi ngo ban than

### IX. The Hermit (An Si)
- **Y nghia thuan**: Noi tam, tim kiem, huong dan
- **Y nghia nguoc**: Co don, co lap, tu choi

### X. Wheel of Fortune (Banh Xe Van Menh)
- **Y nghia thuan**: May man, chu ky, dinh menh
- **Y nghia nguoc**: Xui xeo, thay doi bat ngo

### XI. Justice (Cong Ly)
- **Y nghia thuan**: Cong bang, su that, luat phap
- **Y nghia nguoc**: Bat cong, khong trung thuc

### XII. The Hanged Man (Nguoi Treo Co)
- **Y nghia thuan**: Hy sinh, buong bo, nhin nhan moi
- **Y nghia nguoc**: Tri hoan, khang cu thay doi

### XIII. Death (Cai Chet)
- **Y nghia thuan**: Ket thuc, chuyen doi, thay doi
- **Y nghia nguoc**: So thay doi, tram tre

### XIV. Temperance (Dieu Do)
- **Y nghia thuan**: Can bang, kien nhan, muc dich
- **Y nghia nguoc**: Mat can bang, qua do

### XV. The Devil (Quy Du)
- **Y nghia thuan**: Rang buoc, nghien, vat chat
- **Y nghia nguoc**: Giai thoat, vuot qua cam do

### XVI. The Tower (Thap)
- **Y nghia thuan**: Sup do, khai sang, thay doi dot ngot
- **Y nghia nguoc**: Tranh thay doi, soan tan

### XVII. The Star (Ngoi Sao)
- **Y nghia thuan**: Hy vong, cam hung, binh an
- **Y nghia nguoc**: That vong, thieu niem tin

### XVIII. The Moon (Mat Trang)
- **Y nghia thuan**: Ao giac, truc giac, vo thuc
- **Y nghia nguoc**: Lo au, bi lua doi

### XIX. The Sun (Mat Troi)
- **Y nghia thuan**: Hanh phuc, thanh cong, nang luong
- **Y nghia nguoc**: Bi quan, that bai tam thoi

### XX. Judgement (Phan Xet)
- **Y nghia thuan**: Phan xet, tan sinh, tieng goi
- **Y nghia nguoc**: Nghi ngo, tu choi tieng goi noi tam

### XXI. The World (The Gioi)
- **Y nghia thuan**: Hoan thanh, tron ven, dat duoc
- **Y nghia nguoc**: Thieu hoan chinh, cham tre

## Cac Trai Bai Pho Bien

### 1. Trai 3 La (Qua Khu - Hien Tai - Tuong Lai)
- La 1: Qua khu - anh huong tu qua khu
- La 2: Hien tai - tinh huong hien tai
- La 3: Tuong lai - huong di sap toi

### 2. Trai Celtic Cross (10 la)
- La 1: Tinh huong hien tai
- La 2: Thach thuc
- La 3: Y thuc
- La 4: Vo thuc
- La 5: Qua khu
- La 6: Tuong lai gan
- La 7: Chinh minh
- La 8: Moi truong
- La 9: Hy vong/So hai
- La 10: Ket qua

## Luu Y Khi Doc Bai

1. Tap trung vao cau hoi truoc khi rut bai
2. Tin tuong truc giac cua ban
3. Xem xet moi lien he giua cac la
4. Khong de cam xuc anh huong qua nhieu
5. Nho rang tarot la huong dan, khong phai dinh menh
            ''',
            'source_url': 'internal://gemral/spiritual/tarot_guide',
            'category': 'tarot',
            'tags': ['tarot', 'boi_bai', 'tam_linh', 'major_arcana'],
        },
        {
            'title': 'I Ching (Kinh Dich) - Huong Dan Co Ban',
            'content': '''
# I Ching (Kinh Dich) - Huong Dan Co Ban

## Gioi Thieu

Kinh Dich (I Ching) la mot trong nhung he thong boi toan co xua nhat cua Trung Quoc, co lich su hon 3000 nam. No dua tren 64 que, moi que gom 6 hao (vach).

## Cach Boi I Ching

### Phuong Phap Co Xu (3 dong xu)
1. Tap trung vao cau hoi
2. Tung 3 dong xu 6 lan
3. Ghi lai ket qua:
   - 3 mat = Hao Am dong (---x---)
   - 3 sap = Hao Duong dong (===o===)
   - 2 mat 1 sap = Hao Duong (=======)
   - 2 sap 1 mat = Hao Am (--- ---)
4. Xep tu duoi len tren

### Cach Doc Que

1. **Que Chinh**: Tinh huong hien tai
2. **Que Bien**: Huong phat trien (neu co hao dong)
3. **Hao Dong**: Yeu to then chot can chu y

## 8 Que Co Ban (Bat Quai)

### 1. Can (Troi)
- **Bieu tuong**: Troi, cha, lanh dao
- **Tinh chat**: Sang tao, manh me, chinh nghia
- **Huong**: Tay Bac

### 2. Khon (Dat)
- **Bieu tuong**: Dat, me, nuoi duong
- **Tinh chat**: Tiep nhan, nhu hoa, on dinh
- **Huong**: Tay Nam

### 3. Chan (Sam)
- **Bieu tuong**: Sam set, con truong
- **Tinh chat**: Khoi dong, hanh dong, hot hoang
- **Huong**: Dong

### 4. Ton (Gio)
- **Bieu tuong**: Gio, con gai truong
- **Tinh chat**: Nhe nhang, tham nhap, tuan tu
- **Huong**: Dong Nam

### 5. Kham (Nuoc)
- **Bieu tuong**: Nuoc, con trai thu
- **Tinh chat**: Hiem nguy, sau sac, tham hiem
- **Huong**: Bac

### 6. Ly (Lua)
- **Bieu tuong**: Lua, con gai thu
- **Tinh chat**: Sang sua, dep de, bam dinh
- **Huong**: Nam

### 7. Can (Nui)
- **Bieu tuong**: Nui, con trai ut
- **Tinh chat**: Dung lai, on dinh, tinh lang
- **Huong**: Dong Bac

### 8. Doai (Dam)
- **Bieu tuong**: Dam/ho, con gai ut
- **Tinh chat**: Vui ve, giao tiep, thoa man
- **Huong**: Tay

## 64 Que - Tong Quan

### Que Tot
- Que 1 (Can): Sang tao, thanh cong
- Que 11 (Thai): Thong suot, may man
- Que 14 (Dai Huu): Tai loc lon
- Que 19 (Lam): Co hoi tot

### Que Can Than
- Que 29 (Kham): Gap nhieu kho khan
- Que 47 (Khon): Tuy cuc, can kien nhan
- Que 36 (Minh Di): Thoi ky kho khan
- Que 23 (Bac): Mat mat, suy giam

## Cach Ap Dung I Ching

### Trong Kinh Doanh
- Xem xet thoi diem khoi nghiep
- Danh gia co hoi dau tu
- Lua chon doi tac

### Trong Cuoc Song
- Quyet dinh lon (chuyen nha, doi viec)
- Moi quan he
- Phat trien ban than

### Luu Y Quan Trong
1. Dat cau hoi cu the, ro rang
2. Chi boi khi that su can
3. Ton trong loi giai
4. Ket hop voi hieu biet ban than
5. Khong boi lai cung mot cau hoi
            ''',
            'source_url': 'internal://gemral/spiritual/iching_guide',
            'category': 'iching',
            'tags': ['kinh_dich', 'i_ching', 'boi_toan', '64_que'],
        },
    ]

    success_count = 0
    for doc in documents:
        if ingest_document(doc, 'spiritual'):
            success_count += 1

    print(f'\n[SUMMARY] Ingested {success_count}/{len(documents)} spiritual documents')
    return success_count

def ingest_gemral_trading_knowledge():
    """Ingest Gemral trading knowledge - GEM Frequency Method."""
    print('\n' + '='*60)
    print('INGESTING TRADING KNOWLEDGE')
    print('='*60)

    documents = [
        {
            'title': 'GEM Frequency Trading Method - Tong Quan',
            'content': '''
# GEM Frequency Trading Method - Tong Quan

## Gioi Thieu

GEM Frequency la phuong phap giao dich doc quyen duoc phat trien boi GEMRAL, tap trung vao viec xac dinh cac vung tan so cao (HFZ) va tan so thap (LFZ) de tim diem vao lenh tot nhat.

## Cac Mau Hinh Chinh

### 1. UPU (Up-Pause-Up) - Tang-Nghi-Tang
- **Mo ta**: Gia tang manh, nghi lai (tich luy), roi tiep tuc tang
- **Tin hieu**: BULLISH (Long)
- **Win rate co ban**: 68%
- **Risk/Reward**: 2.8:1
- **Dieu kien**:
  - Dot tang dau tien: it nhat 2%
  - Giai doan Pause: 3-12 nen
  - Breakout phai xac nhan bang volume

### 2. DPD (Down-Pause-Down) - Giam-Nghi-Giam
- **Mo ta**: Gia giam manh, nghi lai (tich luy), roi tiep tuc giam
- **Tin hieu**: BEARISH (Short)
- **Win rate co ban**: 71%
- **Risk/Reward**: 2.5:1
- **Dieu kien**:
  - Dot giam dau tien: it nhat 2%
  - Giai doan Pause: 3-12 nen
  - Breakdown phai xac nhan bang volume

### 3. UPD (Up-Pause-Down) - Tang-Nghi-Giam
- **Mo ta**: Gia tang manh, nghi lai, roi dao chieu giam
- **Tin hieu**: BEARISH (Short)
- **Win rate co ban**: 65%
- **Risk/Reward**: 2.2:1
- **Tier**: TIER1+

### 4. DPU (Down-Pause-Up) - Giam-Nghi-Tang
- **Mo ta**: Gia giam manh, nghi lai, roi dao chieu tang
- **Tin hieu**: BULLISH (Long)
- **Win rate co ban**: 67%
- **Risk/Reward**: 2.4:1
- **Tier**: TIER1+

## Vung Tan So (Frequency Zones)

### HFZ (High Frequency Zone) - Vung Ho Tro
- **Dinh nghia**: Vung gia duoc cham nhieu lan va bau gia
- **Dieu kien**:
  - It nhat 3 lan cham
  - Bounce it nhat 1%
  - Do rong vung: 1-1.5%
- **Cach giao dich**: Mua khi gia quay ve HFZ
- **Win rate**: 70%

### LFZ (Low Frequency Zone) - Vung Khang Cu
- **Dinh nghia**: Vung gia duoc cham nhieu lan va tu choi
- **Dieu kien**:
  - It nhat 3 lan cham
  - Rejection it nhat 1%
  - Do rong vung: 1-1.5%
- **Cach giao dich**: Ban khi gia len toi LFZ
- **Win rate**: 71%

## Zone Retest - Bi Quyet Tang Win Rate

### Tai Sao Zone Retest Quan Trong?

Zone Retest la yeu to THEN CHOT de tang win rate tu 38% len 68%+:

1. **Xac nhan vung manh**: Vung duoc retest va giu duoc chung to vung do rat manh
2. **Entry tot hon**: Entry sau retest cho Risk/Reward tot hon
3. **Loc tin hieu gia**: Loai bo cac breakout gia khong co retest
4. **Tam ly thi truong**: Retest cho thay su dong thuan cua thi truong

### Cach Nhan Dien Zone Retest

1. **Breakout xay ra**: Gia pha vo vung support/resistance
2. **Quay lai vung**: Gia quay tro lai vung vua pha
3. **Phan ung tai vung**: Vung cu support thanh resistance (hoac nguoc lai)
4. **Xac nhan**: Nen xac nhan tai vung retest

### Dieu Kien Zone Retest Hop Le

- Retest trong vong 20 nen sau breakout
- Gia cham vung va phan ung ro rang
- Volume giam trong qua trinh retest
- Nen xac nhan sau khi cham vung

## Quan Ly Lenh

### Entry Rules
1. Doi xac nhan breakout/breakdown
2. Doi zone retest neu co the
3. Entry tai gia dong cua nen xac nhan

### Stop Loss
- Dat sau vung support/resistance
- Khong qua 2% tai khoan cho moi lenh
- Su dung ATR de tinh SL dong

### Take Profit
- TP1: 1.5R (chot 50%)
- TP2: 2.5R (chot 30%)
- TP3: Trailing stop (20% con lai)

## Cac Indicator Ho Tro

### RSI (Relative Strength Index)
- Dung de xac nhan phan ky
- Oversold (<30): Tim mua
- Overbought (>70): Tim ban

### Volume
- Xac nhan breakout: Volume tang 150%+
- Xac nhan retest: Volume giam

### EMA (Exponential Moving Average)
- EMA 20: Xu huong ngan
- EMA 50: Xu huong trung
- EMA 200: Xu huong dai

## Luu Y Quan Trong

1. **Khong FOMO**: Doi tin hieu ro rang
2. **Quan ly von**: Toi da 2% moi lenh
3. **Ghi chep**: Ghi lai moi giao dich de hoc hoi
4. **Kiem nhan**: Khong trade qua nhieu
5. **Tam ly**: Giu binh tinh, khong de cam xuc anh huong
            ''',
            'source_url': 'internal://gemral/trading/gem_frequency_overview',
            'category': 'trading_method',
            'tags': ['gem_frequency', 'upu', 'dpd', 'hfz', 'lfz', 'zone_retest'],
        },
        {
            'title': 'Cac Mau Hinh Chart Pattern Pho Bien',
            'content': '''
# Cac Mau Hinh Chart Pattern Pho Bien

## 1. Mau Hinh Dao Chieu (Reversal Patterns)

### Head and Shoulders (Vai Dau Vai)
- **Mo ta**: 3 dinh, dinh giua cao nhat
- **Tin hieu**: Bearish (sau uptrend)
- **Entry**: Khi pha Neckline
- **Target**: Tu Neckline xuong bang khoang cach tu dau den Neckline
- **Win rate**: 68%

### Inverse Head and Shoulders (Vai Dau Vai Nguoc)
- **Mo ta**: 3 day, day giua thap nhat
- **Tin hieu**: Bullish (sau downtrend)
- **Entry**: Khi pha Neckline
- **Target**: Tu Neckline len bang khoang cach tu dau den Neckline
- **Win rate**: 69%

### Double Top (Hai Dinh)
- **Mo ta**: 2 dinh gan bang nhau
- **Tin hieu**: Bearish
- **Entry**: Khi pha neckline
- **Win rate**: 66%

### Double Bottom (Hai Day)
- **Mo ta**: 2 day gan bang nhau
- **Tin hieu**: Bullish
- **Entry**: Khi pha neckline
- **Win rate**: 67%

### Rounding Bottom (Day Vong Cung)
- **Mo ta**: Day hinh chu U
- **Tin hieu**: Bullish
- **Duration**: it nhat 20 nen
- **Win rate**: 68%

### Rounding Top (Dinh Vong Cung)
- **Mo ta**: Dinh hinh chu U nguoc
- **Tin hieu**: Bearish
- **Duration**: it nhat 20 nen
- **Win rate**: 67%

## 2. Mau Hinh Tiep Dien (Continuation Patterns)

### Bull Flag (Co Tang)
- **Mo ta**: Tang manh roi tich luy nhe
- **Tin hieu**: Bullish
- **Entry**: Khi breakout khoi flag
- **Target**: Do dai cua pole
- **Win rate**: 70%

### Bear Flag (Co Giam)
- **Mo ta**: Giam manh roi tich luy nhe
- **Tin hieu**: Bearish
- **Entry**: Khi breakdown khoi flag
- **Target**: Do dai cua pole
- **Win rate**: 69%

### Ascending Triangle (Tam Giac Tang)
- **Mo ta**: Khang cu ngang, ho tro tang dan
- **Tin hieu**: Bullish (thuong breakout len)
- **Entry**: Khi pha khang cu
- **Win rate**: 66%

### Descending Triangle (Tam Giac Giam)
- **Mo ta**: Ho tro ngang, khang cu giam dan
- **Tin hieu**: Bearish (thuong breakdown xuong)
- **Entry**: Khi pha ho tro
- **Win rate**: 65%

### Symmetrical Triangle (Tam Giac Can)
- **Mo ta**: Ca ho tro va khang cu hoi tu
- **Tin hieu**: Bilateral (ca 2 huong)
- **Entry**: Doi breakout/breakdown xac nhan
- **Win rate**: 63%

### Cup and Handle (Coc va Tay Cam)
- **Mo ta**: Hinh coc U roi tay cam nho
- **Tin hieu**: Bullish
- **Entry**: Khi pha rim cua cup
- **Win rate**: 72%

## 3. Mau Nen Nhat Ban (Candlestick Patterns)

### Hammer (Bua)
- **Mo ta**: Than nho, bong duoi dai
- **Tin hieu**: Bullish (sau downtrend)
- **Xac nhan**: Can nen tang sau do
- **Win rate**: 62%

### Shooting Star (Sao Bang)
- **Mo ta**: Than nho, bong tren dai
- **Tin hieu**: Bearish (sau uptrend)
- **Xac nhan**: Can nen giam sau do
- **Win rate**: 61%

### Engulfing (Nhan Chim)
- **Mo ta**: Nen sau bao trum nen truoc
- **Tin hieu**: Dao chieu theo huong nen engulfing
- **Win rate**: 64%

### Morning Star (Sao Mai)
- **Mo ta**: 3 nen - giam > nho > tang
- **Tin hieu**: Bullish
- **Win rate**: 66%

### Evening Star (Sao Hom)
- **Mo ta**: 3 nen - tang > nho > giam
- **Tin hieu**: Bearish
- **Win rate**: 65%

### Three Methods (Ba Phuong Phap)
- **Mo ta**: Nen lon > 3 nen nho trong > nen lon cung huong
- **Tin hieu**: Tiep dien xu huong
- **Win rate**: 67%

## 4. Cach Su Dung Hieu Qua

### Ket Hop Nhieu Yeu To
1. Mau hinh chart + Volume
2. Mau hinh + RSI divergence
3. Mau hinh + Zone (HFZ/LFZ)
4. Mau hinh + Zone Retest

### Thu Tu Uu Tien
1. **Tier cao hon = Tin cay hon**: Mau hinh o TIER3 da qua nhieu bo loc
2. **Volume xac nhan**: Khong co volume = khong tin
3. **Zone Retest**: Tang win rate len 10-15%
4. **Multi-timeframe**: Xac nhan tren nhieu timeframe

### Tranh Sai Lam Pho Bien
1. Khong doi xac nhan breakout
2. Entry qua som truoc khi hoan thanh
3. Ignore volume
4. Khong set stop loss
5. Khong doi zone retest
            ''',
            'source_url': 'internal://gemral/trading/chart_patterns',
            'category': 'patterns',
            'tags': ['chart_pattern', 'reversal', 'continuation', 'candlestick'],
        },
    ]

    success_count = 0
    for doc in documents:
        if ingest_document(doc, 'trading'):
            success_count += 1

    print(f'\n[SUMMARY] Ingested {success_count}/{len(documents)} trading documents')
    return success_count

def ingest_gemral_product_knowledge():
    """Ingest Gemral product/FAQ knowledge."""
    print('\n' + '='*60)
    print('INGESTING PRODUCT KNOWLEDGE')
    print('='*60)

    documents = [
        {
            'title': 'GEMRAL App - Huong Dan Su Dung',
            'content': '''
# GEMRAL App - Huong Dan Su Dung

## Tong Quan Ung Dung

GEMRAL la ung dung ket hop:
- **Scanner**: Quet va phat hien mau hinh giao dich
- **GEM Master**: Chatbot AI tu van tam linh va giao dich
- **Forum**: Cong dong chia se kien thuc
- **Shop**: Cua hang pha le va san pham tam linh
- **Courses**: Khoa hoc giao dich va tam linh

## Cac Tier Thanh Vien

### FREE
- Truy cap 3 mau hinh co ban (UPU, DPD, Head & Shoulders)
- Gioi han 10 lan quet/ngay
- Chat voi GEM Master (gioi han)
- Doc forum

### TIER1 (99K/thang)
- +4 mau hinh (UPD, DPU, Double Top/Bottom)
- 50 lan quet/ngay
- Chat khong gioi han
- Dang bai forum

### TIER2 (199K/thang)
- +8 mau hinh nang cao
- Quet khong gioi han
- Zone detection (HFZ/LFZ)
- RSI Divergence
- Alerts

### TIER3 (399K/thang)
- Tat ca 24 mau hinh
- AI Pattern Scoring
- Backtesting
- Paper Trading
- Priority support

## Cach Su Dung Scanner

### Buoc 1: Chon Coin
- Tap vao dropdown de chon coin
- Ho tro: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX

### Buoc 2: Chon Timeframe
- 1h: Swing trading ngan
- 4h: Swing trading trung
- 1d: Position trading

### Buoc 3: Quet Pattern
- Nhan nut "Scan" de bat dau
- Cho ket qua (5-15 giay)
- Xem danh sach patterns duoc phat hien

### Buoc 4: Xem Chi Tiet
- Tap vao pattern de xem chart
- Doc phan tich AI
- Xem entry/SL/TP khuyen nghi

## Cach Su Dung GEM Master

### Hoi ve Tam Linh
- "Xem tarot cho ngay hom nay"
- "Xem boi kinh dich ve tinh yeu"
- "Menh Kim nen deo da gi?"
- "Y nghia la bai The Fool"

### Hoi ve Giao Dich
- "Phan tich BTC hom nay"
- "Giai thich mau hinh Double Bottom"
- "Khi nao nen entry Long?"
- "Cach dat stop loss"

### Hoi ve App
- "Cach nang cap len TIER2?"
- "Tai sao khong quet duoc?"
- "Cach kiem affiliate?"

## FAQ - Cau Hoi Thuong Gap

### Q: Tai sao scanner khong tim thay pattern?
A: Co the do:
- Thi truong dang sideway, khong co pattern ro rang
- Timeframe chua phu hop
- Coin it bien dong

### Q: Lam sao de nang cap tier?
A: Vao Account > Subscription > Chon tier mong muon > Thanh toan

### Q: Affiliate hoat dong the nao?
A:
- Dang ky Affiliate trong Account
- Nhan ma gioi thieu
- Chia se ma voi ban be
- Nhan 20% hoa hong khi ho dang ky

### Q: Chat GEM Master co gioi han khong?
A:
- FREE: 10 tin nhan/ngay
- TIER1+: Khong gioi han

### Q: Du lieu co chinh xac khong?
A: Du lieu real-time tu Binance API, cap nhat moi 5 giay
            ''',
            'source_url': 'internal://gemral/product/app_guide',
            'category': 'app_guide',
            'tags': ['huong_dan', 'faq', 'scanner', 'gem_master'],
        },
    ]

    success_count = 0
    for doc in documents:
        if ingest_document(doc, 'product'):
            success_count += 1

    print(f'\n[SUMMARY] Ingested {success_count}/{len(documents)} product documents')
    return success_count

# ═══════════════════════════════════════════════════════════════════════════
# GEM MASTER RESPONSE GUIDELINES
# ═══════════════════════════════════════════════════════════════════════════

def ingest_gem_master_response_guidelines():
    """Ingest GEM Master response formatting guidelines."""
    print('\n' + '='*60)
    print('INGESTING GEM MASTER RESPONSE GUIDELINES')
    print('='*60)

    documents = [
        {
            'title': 'GEM Master Response Guidelines - Quy Tắc Trả Lời',
            'content': '''
# GEM Master Response Guidelines - Quy Tắc Trả Lời

## QUY TẮC BẮT BUỘC

### 1. KHÔNG GỌI USER LÀ "GEMRAL"
- TUYỆT ĐỐI CẤM gọi user là "Gemral", "GEMral", "Gem"
- CHỈ gọi là "bạn" hoặc "mình"
- Gemral là TÊN ỨNG DỤNG, không phải tên user

### 2. KHÔNG CHÀO LẠI TRONG CONVERSATION
- Nếu đã trong cuộc trò chuyện, KHÔNG chào lại
- KHÔNG bắt đầu bằng "Chào bạn", "Xin chào"
- Bắt đầu TRỰC TIẾP vào nội dung

### 3. LUÔN CÓ CÂU DẪN TỰ NHIÊN
- Bắt đầu bằng câu dẫn liên quan đến câu hỏi
- Ví dụ: "Ta hiểu sự trăn trở về tiền bạc của bạn..."
- KHÔNG bắt đầu bằng nội dung khô khan ngay

### 4. TRẢ LỜI TRỰC TIẾP TRƯỚC
- Trả lời TRỰC TIẾP vào câu hỏi TRƯỚC
- Giải thích chi tiết SAU
- Tối đa 250 từ

### 5. CHỈ 1 BÀI TẬP MỖI LẦN
- Nếu có bài tập: CHỈ đưa 1 bài tập cụ thể
- Hỏi user nếu muốn thêm bài tập khác
- KHÔNG liệt kê nhiều bài tập cùng lúc

## RESPONSE FORMAT THEO LOẠI CÂU HỎI

### WEALTH - Câu Hỏi Về Tiền Bạc/Tài Chính

**Keywords**: tiền, tài chính, tuột khỏi tay, mất tiền, không giữ được, nợ nần, nghèo

**Format chuẩn**:
[Câu dẫn tự nhiên liên quan đến vấn đề tiền bạc]

**Gốc rễ:** [Phân tích nguyên nhân sâu xa - belief, subconscious]

**Bài tập: "[Tên bài tập]"**

1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

[Gợi ý thời gian thực hiện: X ngày liên tiếp]

**Ví dụ đúng format**:
Ta hiểu sự trăn trở về tiền bạc của bạn. Khi tiền "tuột" khỏi tay, thường có gốc rễ từ belief về sự xứng đáng được nhận.

**Gốc rễ:** Nhiều người mang theo niềm tin vô thức "tiền là xấu" hoặc "mình không xứng đáng" từ gia đình.

**Bài tập: "Viết thư cho Tiền"**

1. Mỗi tối trước khi ngủ, viết 1 lá thư cho Tiền như người bạn
2. Hỏi: "Tại sao mình ngăn cản nhau?"
3. Làm trong 7 ngày liên tiếp

Bạn có muốn mình hướng dẫn thêm về healing belief tiền bạc không?

### RELATIONSHIP - Câu Hỏi Về Tình Yêu/Mối Quan Hệ

**Keywords**: người ấy, tình yêu, định mệnh, soulmate, twin flame, chia tay, yêu

**Format chuẩn**:
[Câu dẫn tự nhiên về tình yêu/mối quan hệ]

**Ý nghĩa:** [Giải thích insight về Soul Connection/Twin Flame/Soulmate]

**Dấu hiệu nhận biết:**
- [Dấu hiệu 1]
- [Dấu hiệu 2]
- [Dấu hiệu 3]

**Bài tập: "[Tên bài tập reflection]"**

[Các bước cụ thể]

### CAREER - Câu Hỏi Về Công Việc/Sự Nghiệp

**Keywords**: đổi việc, ở lại, nghỉ việc, sự nghiệp, con đường, nghề nghiệp

**Format chuẩn**:
[Câu dẫn tự nhiên về quyết định sự nghiệp]

**Framework đánh giá:**

| Yếu tố | Ở lại | Đổi việc |
|--------|-------|----------|
| Phát triển | ? | ? |
| Tài chính | ? | ? |
| Tâm lý | ? | ? |

**Câu hỏi tự vấn:**
1. [Câu hỏi giúp user tự reflection]
2. [Câu hỏi về giá trị cá nhân]
3. [Câu hỏi về mục tiêu dài hạn]

[Khuyến nghị bước tiếp theo]

### SELF_DISCOVERY - Câu Hỏi Sâu Về Bản Thân

**Keywords**: tiềm năng, ngăn cản, block, tìm hiểu bản thân, mục đích, ý nghĩa

**Format chuẩn**:
[Câu dẫn tự nhiên về hành trình khám phá bản thân]

**Insight:** [Gợi ý về các "block" tâm lý/năng lượng phổ biến]

**Câu hỏi reflection:**
1. [Câu hỏi đào sâu]
2. [Câu hỏi về niềm tin]
3. [Câu hỏi về mẫu hình lặp lại]

**Bài tập: "[Tên bài tập]"**

[Các bước cụ thể - chỉ 1 bài tập]

### FOMO_TRADING - Phát Hiện Tâm Lý FOMO

**Keywords**: mua ngay, nhảy vào, tăng rồi, pump, fomo, all in, sợ bỏ lỡ

**Format chuẩn**:
⚠️ Phát hiện tâm lý FOMO

**Thực tế thị trường:**
- [Phân tích kỹ thuật ngắn gọn]
- RSI hiện tại: [Nếu có]
- Volume: [Nếu có]

**Khuyến nghị:**
1. Hãy thở sâu 3 lần
2. Đợi ít nhất 15 phút trước khi quyết định
3. [Gợi ý entry tốt hơn nếu có]

**Nhớ:** Thị trường luôn có cơ hội. Không cần FOMO.

## FORMAT CHUNG

### Structure cơ bản:
1. Câu dẫn tự nhiên (1-2 câu)
2. Nội dung chính (bullet points, dễ đọc)
3. Bài tập/Action cụ thể (nếu cần)
4. Câu hỏi mở rộng (nếu phù hợp)

### Không được:
- Lan man, triết lý chung chung
- Liệt kê nhiều bài tập cùng lúc
- Bắt đầu bằng "Chào bạn" khi đã trong conversation
- Gọi user là "Gemral"
- Viết quá 250 từ
            ''',
            'source_url': 'internal://gemral/ai/response_guidelines',
            'category': 'ai_guidelines',
            'tags': ['response_format', 'gem_master', 'guidelines', 'wealth', 'relationship', 'career', 'fomo'],
        },
        {
            'title': 'GEM Master Demo Responses - Ví Dụ Trả Lời Chuẩn',
            'content': '''
# GEM Master Demo Responses - Ví Dụ Trả Lời Chuẩn

## Demo 1: WEALTH - "Tại sao tiền cứ tuột khỏi tay tôi?"

### Câu hỏi:
"Tại sao tiền cứ tuột khỏi tay tôi?"

### Response chuẩn:
Ta hiểu sự trăn trở về tiền bạc của bạn. Khi tiền "tuột" khỏi tay, thường có gốc rễ từ belief về sự xứng đáng được nhận.

**Gốc rễ:** Nhiều người mang theo niềm tin vô thức "tiền là xấu" hoặc "mình không xứng đáng" từ gia đình.

**Bài tập: "Viết thư cho Tiền"**

1. Mỗi tối trước khi ngủ, viết 1 lá thư cho Tiền như người bạn
2. Hỏi: "Tại sao mình ngăn cản nhau?"
3. Làm trong 7 ngày liên tiếp

Bạn có muốn mình hướng dẫn thêm về healing belief tiền bạc không?

## Demo 2: RELATIONSHIP - "Người ấy có phải định mệnh của tôi không?"

### Câu hỏi:
"Người ấy có phải định mệnh của tôi không?"

### Response chuẩn:
Câu hỏi về "định mệnh" thường xuất phát từ mong muốn tìm kết nối sâu sắc. Để ta giúp bạn nhìn rõ hơn.

**Twin Flame vs Soulmate:**
- **Soulmate**: Người đồng hành, hỗ trợ, cảm thấy an toàn
- **Twin Flame**: Người phản chiếu, thách thức, thúc đẩy trưởng thành

**Dấu hiệu kết nối sâu:**
- Cảm giác quen biết từ trước
- Học được bài học quan trọng từ người ấy
- Mối quan hệ giúp bạn trưởng thành

**Bài tập: "Nhật ký Mối Quan Hệ"**

1. Viết 3 điều bạn học được từ người ấy
2. Viết 3 điều bạn thay đổi nhờ người ấy
3. Hỏi: "Mình đang cho hay đang nhận?"

Kết quả sẽ giúp bạn hiểu rõ hơn về bản chất mối quan hệ.

## Demo 3: CAREER - "Tôi nên đổi việc hay ở lại?"

### Câu hỏi:
"Tôi nên đổi việc hay ở lại?"

### Response chuẩn:
Đây là quyết định quan trọng. Hãy cùng phân tích trước khi hành động.

**Framework đánh giá:**

| Yếu tố | Ở lại | Đổi việc |
|--------|-------|----------|
| Phát triển | [Bạn tự đánh giá] | [Bạn tự đánh giá] |
| Tài chính | Stable / Tăng? | Risk / Cơ hội? |
| Tâm lý | Thoải mái / Mệt mỏi? | Hứng thú / Lo lắng? |

**Câu hỏi giúp quyết định:**
1. Sau 3 năm, phiên bản nào của bạn hạnh phúc hơn?
2. Điều gì khiến bạn muốn rời đi - người hay công việc?
3. Nếu tiền không phải vấn đề, bạn chọn gì?

**Bước tiếp theo:** Viết ra câu trả lời cho 3 câu hỏi trên. Câu trả lời sẽ giúp bạn rõ hơn.

## Demo 4: SELF_DISCOVERY - "Điều gì đang ngăn cản tôi sống đúng tiềm năng?"

### Câu hỏi:
"Điều gì đang ngăn cản tôi sống đúng tiềm năng?"

### Response chuẩn:
Việc bạn đặt câu hỏi này cho thấy bạn đã sẵn sàng nhìn vào bên trong. Đây là bước đầu tiên.

**Các "block" phổ biến:**
- **Fear of success**: Sợ thành công vì sợ mất kết nối với người thân
- **Limiting beliefs**: Niềm tin "mình không đủ giỏi" từ nhỏ
- **Self-sabotage**: Vô thức phá hoại khi sắp đạt được

**Câu hỏi reflection:**
1. Khi nào bạn cảm thấy "gần đạt được" nhưng lại dừng lại?
2. Giọng nói nào trong đầu thường nói "bạn không thể"?
3. Điều gì sẽ thay đổi nếu bạn THẬT SỰ sống hết mình?

**Bài tập: "Thư cho Bản Thân Tương Lai"**

Viết 1 lá thư cho phiên bản của bạn sau 5 năm - phiên bản đã sống đúng tiềm năng. Hỏi họ: "Làm sao bạn vượt qua được?"

Làm mỗi ngày trong 7 ngày. Bạn sẽ bắt đầu thấy câu trả lời.

## Demo 5: FOMO_TRADING - "BTC tăng 5% rồi, muốn mua ngay!"

### Câu hỏi:
"BTC tăng 5% rồi, muốn mua ngay! Không muốn bỏ lỡ cơ hội!"

### Response chuẩn:
⚠️ Phát hiện tâm lý FOMO

**Thực tế thị trường:**
- BTC đã tăng 5% → RSI có thể đang cao
- Volume spike thường là dấu hiệu cuối của đợt tăng
- Entry sau pump = Risk cao, R/R thấp

**Khuyến nghị:**
1. Hãy thở sâu 3 lần
2. Đợi ít nhất 15 phút trước khi quyết định
3. Nếu vẫn muốn vào: Chia lệnh, chỉ 30% position trước

**Nhớ:** Thị trường 24/7. Cơ hội LUÔN quay lại. FOMO = Mất tiền.

Bạn có muốn mình phân tích chart BTC hiện tại không?

## QUY TẮC ÁP DỤNG

1. **Mỗi response** phải theo format tương ứng với loại câu hỏi
2. **Không mix** nhiều format trong 1 response
3. **Luôn hỏi** cuối response để tạo engagement
4. **Giữ ngắn gọn** - tối đa 250 từ
5. **Personalize** - dùng "bạn" thay vì "Gemral"
            ''',
            'source_url': 'internal://gemral/ai/demo_responses',
            'category': 'ai_guidelines',
            'tags': ['demo', 'response_format', 'wealth', 'relationship', 'career', 'self_discovery', 'fomo'],
        },
    ]

    success_count = 0
    for doc in documents:
        if ingest_document(doc, 'product'):
            success_count += 1

    print(f'\n[SUMMARY] Ingested {success_count}/{len(documents)} response guideline documents')
    return success_count


# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

def main():
    """Main ingestion pipeline."""
    print('='*60)
    print('GEMRAL AI BRAIN - Knowledge Ingestion Pipeline')
    print('='*60)

    initialize()

    # Check environment
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print('[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
        return

    from embedding_service import OPENAI_API_KEY
    if not OPENAI_API_KEY:
        print('[ERROR] Missing OPENAI_API_KEY')
        return

    print('\n[INFO] Environment OK, starting ingestion...')

    # Ingest all knowledge
    spiritual_count = ingest_gemral_spiritual_knowledge()
    trading_count = ingest_gemral_trading_knowledge()
    product_count = ingest_gemral_product_knowledge()
    guidelines_count = ingest_gem_master_response_guidelines()

    print('\n' + '='*60)
    print('INGESTION COMPLETE')
    print('='*60)
    print(f'Spiritual documents: {spiritual_count}')
    print(f'Trading documents: {trading_count}')
    print(f'Product documents: {product_count}')
    print(f'Response guidelines: {guidelines_count}')
    print(f'Total: {spiritual_count + trading_count + product_count + guidelines_count}')

def ingest_guidelines_only():
    """Only ingest response guidelines (for quick update)."""
    print('='*60)
    print('GEMRAL AI BRAIN - Guidelines Ingestion Only')
    print('='*60)

    initialize()

    # Check environment
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print('[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
        return

    from embedding_service import OPENAI_API_KEY
    if not OPENAI_API_KEY:
        print('[ERROR] Missing OPENAI_API_KEY')
        return

    print('\n[INFO] Environment OK, ingesting response guidelines...')
    guidelines_count = ingest_gem_master_response_guidelines()

    print('\n' + '='*60)
    print('INGESTION COMPLETE')
    print('='*60)
    print(f'Response guidelines: {guidelines_count}')


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--guidelines-only':
        ingest_guidelines_only()
    else:
        main()
