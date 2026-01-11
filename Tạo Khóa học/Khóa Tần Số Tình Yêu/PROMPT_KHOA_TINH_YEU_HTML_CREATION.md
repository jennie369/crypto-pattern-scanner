# 🎯 PROMPT: TẠO HTML BÀI HỌC KHÓA TÌNH YÊU

**Mục đích:** Tạo đầy đủ các file HTML từ Module 0 đến Bài 6.2 cho Khóa Tần Số Tình Yêu
**Tổng số bài:** 24 bài học HTML

---

## ⚠️ ENFORCEMENT RULES - BẮT BUỘC TUÂN THỦ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRITICAL RULES - KHÔNG ĐƯỢC VI PHẠM                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔴 MỖI KHI COMPACT SESSION / CHAT MỚI:                                     │
│     → PHẢI đọc lại file PROMPT_KHOA_TINH_YEU_HTML_CREATION.md               │
│     → PHẢI đọc file Master_Hinh_Anh_Khoa_Tinh_Yeu.md (nếu đã tạo)          │
│     → Để hiểu context và tiếp tục đúng vị trí                              │
│                                                                             │
│  🎨 DESIGN & CSS:                                                           │
│  ────────────────────────────────────────────────────────────────────────   │
│  🚨 PHẢI copy CHÍNH XÁC CSS từ file bai-2-4-facebook-final.html            │
│  🚨 CSS V5.4 FACEBOOK-STYLE MOBILE-FIRST                                   │
│  🚨 KHÔNG sửa đổi hay thêm bớt CSS                                         │
│  🚨 Dùng tiếng Việt có dấu đầy đủ                                          │
│                                                                             │
│  📱 RESPONSIVE RULES:                                                       │
│  ────────────────────────────────────────────────────────────────────────   │
│  │ Thiết bị │ Quy tắc                                                 │    │
│  │ Mobile   │ Container padding: 0, full-width edge-to-edge,          │    │
│  │          │ text padding: 16px, border-radius: 0,                   │    │
│  │          │ border-left: 4px, gap: 1px separator                    │    │
│  │ Desktop  │ Container padding: 1.5rem, full borders + radius 12-16px│    │
│  │          │ box-shadow, hover effects                               │    │
│                                                                             │
│  ❓ QUIZ RULES:                                                             │
│  ────────────────────────────────────────────────────────────────────────   │
│  🚨 INSTANT FEEDBACK - KHÔNG có Submit button                              │
│  🚨 Click option = immediate feedback                                      │
│  🚨 Copy chính xác JavaScript từ file mẫu                                  │
│                                                                             │
│  🖼️ HÌNH ẢNH:                                                               │
│  ────────────────────────────────────────────────────────────────────────   │
│  🚨 4-6 hình/bài (BẮT BUỘC - không được ít hơn 4 hình)                     │
│  🚨 Full-width mobile, border-radius: 0 mobile, 8px desktop                │
│  🚨 Dùng placeholder: images/ten-hinh-anh.png                              │
│  🚨 Ghi chú rõ nội dung hình cần tạo trong Master Hình Ảnh                 │
│                                                                             │
│  ❌ KHÔNG ĐƯỢC TẠO:                                                         │
│  ────────────────────────────────────────────────────────────────────────   │
│  ❌ Navigation Buttons (Bài trước / Bài sau)                               │
│  ❌ .lesson-nav class                                                       │
│  ❌ .nav-btn class                                                          │
│  ❌ Submit button trong quiz                                                │
│  ❌ Links đến bài học khác                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
/Khoa_Tinh_Yeu/
├── M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html
├── M0_Bai_0.2_Danh_Gia_Tan_So_Tinh_Yeu.html
├── M1_Bai_1.1_Ban_Do_Quan_He_Qua_Khu.html
├── M1_Bai_1.2_Inner_Child_Healing.html
├── M1_Bai_1.3_Nghe_Thuat_Tha_Thu.html
├── M1_Bai_1.4_Ritual_Dot_Bo_Qua_Khu.html
├── M2_Bai_2.1_Mirror_Work.html
├── M2_Bai_2.2_7_Hanh_Vi_Tinh_Tan.html
├── M2_Bai_2.3_Thiet_Lap_Ranh_Gioi.html
├── M2_Bai_2.4_Solo_Date.html
├── M3_Bai_3.1_Thang_Cam_Xuc_Tinh_Yeu.html
├── M3_Bai_3.2_Chuyen_Hoa_Niem_Tin.html
├── M3_Bai_3.3_Khang_Dinh_Tu_Yeu.html
├── M3_Bai_3.4_Heart_Coherence.html
├── M4_Bai_4.1_Soulmate_Twin_Flame.html
├── M4_Bai_4.2_Viet_Thu_Tri_Ky.html
├── M4_Bai_4.3_Crystals_Tinh_Yeu.html
├── M4_Bai_4.4_Visualization.html
├── M5_Bai_5.1_4_Phong_Cach_Giao_Tiep.html
├── M5_Bai_5.2_5_Ngon_Ngu_Tinh_Yeu.html
├── M5_Bai_5.3_Red_Green_Flags.html
├── M5_Bai_5.4_Lang_Nghe_Sau.html
├── M6_Bai_6.1_3_Con_Duong.html
├── M6_Bai_6.2_Co_Hoi_Lua_Chon.html
└── Master_Hinh_Anh_Khoa_Tinh_Yeu.md
```

---

## 📋 CHI TIẾT TỪNG BÀI HỌC

### MODULE 0: KHỞI ĐẦU TÌNH YÊU ĐÍCH THỰC (Ngày 1-2)

---

#### 📄 BÀI 0.1: CHÀO MỪNG - HÀNH TRÌNH VỀ VỚI TÌNH YÊU
**File:** `M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html`
**Thời lượng:** 25 phút | **Words:** 2,500-2,700

**Sections:**
1. **Lời chào từ Jennie Uyen Chu** 
   - Câu chuyện tình yêu của Jennie
   - Từ tan vỡ đến tìm thấy tri kỷ
   - "Tình yêu bắt đầu từ bên trong"

2. **Học Thuyết Chuyển Hóa Nội Tâm & Tình Yêu**
   - Tình yêu là năng lượng cao nhất (540 Hz)
   - Nguyên lý Phản Chiếu - Người yêu phản chiếu nội tâm bạn
   - "Bạn không thể cho đi thứ bạn không có"

3. **Lộ Trình 42 Ngày**
   - Tại sao 42 ngày (6 tuần x 7 ngày)
   - Overview 6 modules:
     - M0: Khởi đầu (2 ngày)
     - M1: Chữa lành (7 ngày)
     - M2: Yêu bản thân (7 ngày)
     - M3: Nâng tần số (7 ngày)
     - M4: Sẵn sàng tri kỷ (7 ngày)
     - M5: Nghệ thuật quan hệ (7 ngày)
     - M6: Sứ giả tình yêu (5 ngày)

4. **Cam Kết Với Trái Tim**
   - Form cam kết trong HTML
   - "Tôi sẵn sàng yêu và được yêu"

5. **Hướng Dẫn App GEM**
   - Các rituals cho tình yêu
   - GEM Master Tarot - chủ đề Love

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 1:** Roadmap 42 Ngày - 6 modules dạng trái tim xếp theo timeline
- **Hình 2:** Tình Yêu = 540 Hz - Visual thang tần số với 540 Hz highlight
- **Hình 3:** Nguyên Lý Phản Chiếu - Gương phản chiếu trái tim, 2 người đối diện
- **Hình 4:** Jennie Uyen Chu Quote - "Tình yêu bắt đầu từ bên trong"
- **Hình 5:** App GEM Features - Screenshot các rituals cho tình yêu

---

#### 📄 BÀI 0.2: ĐÁNH GIÁ TẦN SỐ TÌNH YÊU HIỆN TẠI
**File:** `M0_Bai_0.2_Danh_Gia_Tan_So_Tinh_Yeu.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **7 Tầng Tâm Thức về Tình Yêu** (theo Jennie)
   - Tầng 1: Phàm (50-100 Hz) - Sợ bị bỏ rơi, ghen tuông
   - Tầng 2: Quan Sát (100-200 Hz) - Nhận ra patterns
   - Tầng 3: Chuyển Hóa (200-300 Hz) - Bắt đầu healing
   - Tầng 4: Sáng Tạo (300-400 Hz) - Chủ động yêu bản thân
   - Tầng 5: Đồng Điệu (400-500 Hz) - Thu hút tự nhiên
   - Tầng 6: Từ Bi (500-540 Hz) - Yêu vô điều kiện
   - Tầng 7: Nhất Nguyên (540+ Hz) - Hợp nhất với tình yêu vũ trụ

2. **Bài Test Tần Số Tình Yêu** (15 câu trong HTML)
   - Về quan hệ với bản thân
   - Về quan hệ với người khác
   - Về quan hệ với quá khứ

3. **Phân Tích Kết Quả**
   - Điểm mạnh và thách thức
   - Areas cần focus

4. **Love Language Assessment**
   - 5 ngôn ngữ tình yêu (Gary Chapman)
   - Test nhanh trong HTML
   - Biết ngôn ngữ của mình

5. **Tích Hợp GEM Master Tarot**
   - Bốc 1 lá về tình yêu hiện tại
   - Ghi chú insights

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 6:** 7 Tầng Tình Yêu - Trái tim với 7 layers màu gradient từ thấp lên cao
- **Hình 7:** 5 Love Languages - 5 icons đại diện cho mỗi ngôn ngữ tình yêu
- **Hình 8:** Test Tần Số Tình Yêu - Infographic về 15 câu hỏi đánh giá
- **Hình 9:** Bảng Kết Quả Tần Số - Chart shows các mức tần số và ý nghĩa
- **Hình 10:** GEM Master Tarot Love - Screenshot bốc bài tình yêu trong app

**Quiz M0 (2 câu) - ĐẶT Ở CUỐI BÀI 0.2:**
```
Câu 1: Theo Jennie, tình yêu rung động ở tần số bao nhiêu Hz?
A. 200 Hz
B. 400 Hz
C. 540 Hz ← ĐÚNG
D. 700 Hz
Giải thích đúng: "Chính xác! Tình yêu vô điều kiện rung động ở tần số 540 Hz - cao nhất trong thang cảm xúc."
Giải thích sai: "Sai rồi! Tình yêu vô điều kiện rung động ở 540 Hz theo thang đo của Jennie."

Câu 2: Nguyên lý nào nói rằng "Người yêu phản chiếu nội tâm bạn"?
A. Nguyên lý Kham Nhẫn
B. Nguyên lý Phản Chiếu ← ĐÚNG
C. Nguyên lý Buông Bỏ
D. Nguyên lý Hiện Diện
Giải thích đúng: "Chính xác! Nguyên lý Phản Chiếu - người yêu là tấm gương phản chiếu thế giới nội tâm của bạn."
Giải thích sai: "Sai rồi! Đây là Nguyên lý Phản Chiếu - người bạn thu hút phản chiếu những gì bên trong bạn."
```

---

### MODULE 1: CHỮA LÀNH VẾT XƯỚc QUÁ KHỨ (Ngày 3-9)

---

#### 📄 BÀI 1.1: BẢN ĐỒ CÁC MỐI QUAN HỆ QUÁ KHỨ
**File:** `M1_Bai_1.1_Ban_Do_Quan_He_Qua_Khu.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Tại Sao Cần Nhìn Lại Quá Khứ?**
   - Vết thương chưa lành sẽ thu hút người gây thương tổn
   - Nguyên lý: "What you don't heal, you repeat"
   - Không phải để trách móc - mà để HIỂU và BUÔNG

2. **Vẽ Bản Đồ Quan Hệ**
   - Template trong HTML
   - Liệt kê các mối quan hệ quan trọng:
     - Bố mẹ
     - Các mối tình
     - Bạn bè thân
   - Ghi chú: Điều tốt đẹp / Điều đau đớn / Bài học

3. **Nhận Diện Patterns**
   - Patterns lặp lại qua các mối quan hệ
   - Ví dụ: Luôn chọn người không available
   - Ví dụ: Luôn là người cho đi nhiều hơn

4. **Attachment Styles**
   - 4 kiểu gắn bó:
     - Secure (An toàn)
     - Anxious (Lo lắng)
     - Avoidant (Né tránh)
     - Disorganized (Hỗn loạn)
   - Test trong HTML
   - Hiểu kiểu của mình

5. **Tích Hợp GEM Master Tarot**
   - Bốc bài về patterns quá khứ

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 11:** Relationship Map Template - Bản đồ quan hệ với các vòng tròn kết nối
- **Hình 12:** 4 Attachment Styles - 4 quadrants với mô tả từng kiểu gắn bó
- **Hình 13:** Patterns Recognition - Infographic nhận diện patterns lặp lại
- **Hình 14:** What You Don't Heal Quote - "What you don't heal, you repeat"
- **Hình 15:** Journaling Template - Mẫu ghi chép quan hệ: Tốt đẹp/Đau đớn/Bài học

---

#### 📄 BÀI 1.2: INNER CHILD HEALING - CHỮA LÀNH ĐỨA TRẺ BÊN TRONG
**File:** `M1_Bai_1.2_Inner_Child_Healing.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Inner Child Là Gì?**
   - Đứa trẻ bên trong mang vết thương từ nhỏ
   - Ảnh hưởng đến cách yêu khi trưởng thành
   - Các nhu cầu chưa được đáp ứng

2. **5 Vết Thương Cốt Lõi** (Lise Bourbeau)
   - Vết thương Bị Bỏ Rơi
   - Vết thương Bị Từ Chối
   - Vết thương Bị Sỉ Nhục
   - Vết thương Bị Phản Bội
   - Vết thương Bất Công
   - Test trong HTML: Vết thương chính của bạn?

3. **Kết Nối Với Inner Child**
   - Script meditation (15 phút)
   - Visualize gặp đứa trẻ bên trong
   - Đối thoại và ôm ấp

4. **Ritual Letter to Universe**
   - Viết thư cho đứa trẻ bên trong
   - Hứa bảo vệ và yêu thương
   - Tích hợp app GEM

5. **Bài Tập: Viết Thư**
   - Template thư trong HTML
   - Cam kết chữa lành

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 16:** 5 Vết Thương Cốt Lõi - 5 icons với tên: Bỏ Rơi, Từ Chối, Sỉ Nhục, Phản Bội, Bất Công
- **Hình 17:** Inner Child Concept - Hình ảnh người lớn ôm đứa trẻ bên trong
- **Hình 18:** Meditation Visualization - Hình gặp đứa trẻ trong tâm tưởng
- **Hình 19:** Letter to Inner Child - Template thư gửi đứa trẻ bên trong
- **Hình 20:** Lise Bourbeau Quote - Trích dẫn về 5 vết thương

---

#### 📄 BÀI 1.3: NGHỆ THUẬT THA THỨ
**File:** `M1_Bai_1.3_Nghe_Thuat_Tha_Thu.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Tha Thứ Là Gì? Không Phải Gì?**
   - Tha thứ KHÔNG PHẢI chấp nhận hành vi sai
   - Tha thứ LÀ giải phóng bản thân khỏi độc tố
   - "Giữ oán giận như uống thuốc độc, mong người khác chết"

2. **Ho'oponopono - Phương Pháp Hawaii**
   - 4 câu thần chú:
     - "Tôi xin lỗi"
     - "Xin hãy tha thứ cho tôi"
     - "Cảm ơn bạn"
     - "Tôi yêu bạn"
   - Cách thực hành hàng ngày
   - Tại sao hiệu quả

3. **Danh Sách Tha Thứ**
   - Template trong HTML
   - Liệt kê người cần tha thứ
   - Bao gồm cả BẢN THÂN

4. **Ritual Tha Thứ**
   - Guided meditation script
   - Visualization cắt dây nghiệp
   - Tích hợp app: Letter to Universe

5. **Bài Tập: Ho'oponopono 7 Ngày**
   - Tracking sheet trong HTML
   - Chọn 1 người/ngày
   - Ghi lại cảm xúc sau

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 21:** Ho'oponopono 4 Câu - 4 câu thần chú trong vòng tròn
- **Hình 22:** Forgiveness Concept - Giải phóng độc tố khỏi trái tim
- **Hình 23:** Forgiveness List Template - Mẫu danh sách tha thứ
- **Hình 24:** Cutting Cord Visualization - Cắt dây nghiệp với người khác
- **Hình 25:** Quote Tha Thứ - "Giữ oán giận như uống thuốc độc..."

---

#### 📄 BÀI 1.4: RITUAL - ĐỐT BỎ QUÁ KHỨ
**File:** `M1_Bai_1.4_Ritual_Dot_Bo_Qua_Khu.html`
**Thời lượng:** 40 phút | **Words:** 2,500-2,700

**Sections:**
1. **Sức Mạnh Của Ritual Đốt Bỏ**
   - Fire = transformation trong nhiều văn hóa
   - Symbolic release vs. real release
   - Chuẩn bị tâm lý

2. **Chuẩn Bị Ritual**
   - Vật dụng cần thiết
   - Không gian an toàn
   - Thời điểm phù hợp (trăng tàn)
   - Âm nhạc gợi ý

3. **Script Ritual Đốt Bỏ**
   - Bước 1: Thiền định mở đầu (5 phút)
   - Bước 2: Viết những gì cần release
   - Bước 3: Đọc to với cảm xúc
   - Bước 4: Đốt an toàn
   - Bước 5: Affirmation kết thúc

4. **Tích Hợp App: Burn & Release**
   - Cách sử dụng ritual trong app
   - Digital vs. physical ritual

5. **Sau Ritual**
   - Cảm xúc bình thường sau ritual
   - Self-care sau ritual
   - Journaling

**Hình ảnh (4 hình - BẮT BUỘC):**
- **Hình 26:** Fire Transformation - Ngọn lửa với năng lượng chuyển hóa
- **Hình 27:** Ritual Preparation - Checklist chuẩn bị: nến, giấy, không gian
- **Hình 28:** 5 Bước Ritual Đốt Bỏ - Infographic 5 steps của ritual
- **Hình 29:** Moon Phases - Trăng tàn là thời điểm tốt để release

**Quiz M1 (3 câu) - ĐẶT Ở CUỐI BÀI 1.4:**
```
Câu 1: Kiểu gắn bó nào thường lo lắng khi partner không reply tin nhắn ngay?
A. Secure ← SAI
B. Anxious ← ĐÚNG
C. Avoidant ← SAI
D. Disorganized ← SAI
Giải thích đúng: "Chính xác! Anxious attachment lo lắng về sự sẵn có của partner."
Giải thích sai: "Sai! Kiểu Anxious thường lo lắng khi không nhận được phản hồi ngay."

Câu 2: Ho'oponopono có bao nhiêu câu thần chú?
A. 3 câu ← SAI
B. 4 câu ← ĐÚNG
C. 5 câu ← SAI
D. 7 câu ← SAI
Giải thích đúng: "Chính xác! 4 câu: Tôi xin lỗi, Xin tha thứ, Cảm ơn, Tôi yêu bạn."
Giải thích sai: "Sai! Ho'oponopono có 4 câu thần chú cốt lõi."

Câu 3: Tha thứ KHÔNG PHẢI là gì?
A. Giải phóng bản thân ← SAI
B. Chấp nhận hành vi sai ← ĐÚNG (đây là điều tha thứ KHÔNG phải)
C. Tự do khỏi oán giận ← SAI
D. Cho mình bình yên ← SAI
Giải thích đúng: "Chính xác! Tha thứ KHÔNG PHẢI chấp nhận hành vi sai - mà là giải phóng bản thân."
Giải thích sai: "Sai! Tha thứ không đồng nghĩa với việc chấp nhận hành vi sai của người khác."
```

---

### MODULE 2: YÊU BẢN THÂN TRỌN VẸN (Ngày 10-16)

---

#### 📄 BÀI 2.1: MIRROR WORK - NHÌN VÀO GƯƠNG
**File:** `M2_Bai_2.1_Mirror_Work.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Mirror Work Là Gì?** (Louise Hay)
   - Nhìn vào mắt mình trong gương
   - Nói những lời yêu thương
   - Tại sao khó nhưng hiệu quả

2. **7 Ngày Mirror Work Challenge**
   - Ngày 1: "Tôi sẵn sàng yêu bạn"
   - Ngày 2: "Tôi tha thứ cho bạn"
   - Ngày 3: "Bạn xứng đáng được yêu"
   - Ngày 4: "Tôi chấp nhận bạn hoàn toàn"
   - Ngày 5: "Bạn đủ tốt rồi"
   - Ngày 6: "Tôi tin tưởng bạn"
   - Ngày 7: "Tôi yêu bạn vô điều kiện"
   - Tracking sheet trong HTML

3. **Vượt Qua Sự Khó Chịu Ban Đầu**
   - Phản ứng thường gặp
   - Cách xử lý khi khóc
   - Kiên nhẫn với bản thân

4. **Mirror Work Nâng Cao**
   - Nói về vẻ ngoài
   - Nói về thành tựu
   - Nói về khả năng yêu

5. **Tích Hợp App GEM: Daily Affirmations**
   - Reminder hàng ngày
   - Track mood sau mirror work

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 30:** Mirror Work Steps - 7 bước nhìn gương nói yêu thương
- **Hình 31:** Louise Hay Portrait - Ảnh Louise Hay với quote về mirror work
- **Hình 32:** 7 Day Challenge - Calendar 7 ngày với affirmations
- **Hình 33:** Emotional Reactions - Các phản ứng thường gặp khi mirror work
- **Hình 34:** Before/After Mirror Work - Transformation sau 7 ngày

---

#### 📄 BÀI 2.2: 7 HÀNH VI TINH TẤN YÊU BẢN THÂN
**File:** `M2_Bai_2.2_7_Hanh_Vi_Tinh_Tan.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Tinh Tấn Là Gì?**
   - Hành động nhỏ đều đặn
   - Tích lũy = Chuyển hóa lớn
   - Không cần perfect, cần consistent

2. **7 Hành Vi Tinh Tấn**
   - 🌅 Sáng: Thiền 5 phút
   - 💧 Nước: 8 ly/ngày
   - 🚶 Vận động: 30 phút/ngày
   - 📖 Học: 1 trang sách/ngày
   - 🙏 Biết ơn: 3 điều/tối
   - 😴 Ngủ: 7-8 tiếng
   - 🎨 Sáng tạo: 15 phút/ngày

3. **Tại Sao 7 Hành Vi Này?**
   - Body (nước, vận động, ngủ)
   - Mind (thiền, học)
   - Spirit (biết ơn, sáng tạo)
   - Holistic self-love

4. **Habit Tracking**
   - Template 7 ngày trong HTML
   - Đánh dấu completion
   - Reward system

5. **Tích Hợp Vision Board: Habits**
   - Track trong app
   - Xây dựng streak

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 35:** 7 Hành Vi Tinh Tấn - 7 icons: Thiền, Nước, Vận động, Học, Biết ơn, Ngủ, Sáng tạo
- **Hình 36:** Body-Mind-Spirit - Tam giác 3 nhóm habits
- **Hình 37:** Habit Tracker Template - Bảng tracking 7 ngày x 7 habits
- **Hình 38:** Consistency Quote - "Không cần perfect, cần consistent"
- **Hình 39:** Small Steps Big Change - Infographic tích lũy = chuyển hóa

---

#### 📄 BÀI 2.3: THIẾT LẬP RANH GIỚI LÀNH MẠNH
**File:** `M2_Bai_2.3_Thiet_Lap_Ranh_Gioi.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Ranh Giới Là Gì?**
   - Đường giới hạn giữa OK và không OK
   - Tại sao ranh giới = yêu bản thân
   - Không có ranh giới = mất năng lượng

2. **5 Loại Ranh Giới**
   - Ranh giới Thể chất
   - Ranh giới Cảm xúc
   - Ranh giới Thời gian
   - Ranh giới Tiền bạc
   - Ranh giới Tình dục

3. **Cách Thiết Lập Ranh Giới**
   - Nhận diện cảm xúc khó chịu
   - Xác định nhu cầu
   - Giao tiếp rõ ràng
   - Giữ vững ranh giới

4. **Câu Nói Thiết Lập Ranh Giới**
   - "Tôi cần thời gian suy nghĩ"
   - "Điều này không phù hợp với tôi"
   - "Tôi không thoải mái với..."
   - Script trong HTML

5. **Bài Tập: Định Nghĩa Ranh Giới**
   - Template cho 5 loại ranh giới
   - Ví dụ cụ thể cho từng loại

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 40:** 5 Loại Ranh Giới - 5 icons: Thể chất, Cảm xúc, Thời gian, Tiền bạc, Tình dục
- **Hình 41:** Healthy vs Unhealthy Boundaries - So sánh 2 cột
- **Hình 42:** Scripts Ranh Giới - 5 câu nói thiết lập ranh giới
- **Hình 43:** Energy Drain - Hình mất năng lượng khi không có ranh giới
- **Hình 44:** Boundary Setting Steps - 4 bước thiết lập ranh giới

---

#### 📄 BÀI 2.4: SOLO DATE - HẸN HÒ VỚI BẢN THÂN
**File:** `M2_Bai_2.4_Solo_Date.html`
**Thời lượng:** 25 phút | **Words:** 2,500-2,700

**Sections:**
1. **Tại Sao Solo Date?**
   - Học cách enjoy solitude
   - Không cần người khác để vui
   - Tự thưởng cho bản thân

2. **30 Ý Tưởng Solo Date**
   - Cafe một mình
   - Xem phim rạp
   - Picnic công viên
   - Shopping therapy
   - Spa day
   - Museum visit
   - ... (list đầy đủ 30)

3. **Cách Thực Hiện Solo Date Hoàn Hảo**
   - Lên kế hoạch như hẹn hò thật
   - Ăn mặc đẹp
   - Không dùng điện thoại (trừ chụp ảnh)
   - Fully present

4. **Solo Date Challenge**
   - 1 solo date/tuần trong 4 tuần
   - Tracking trong HTML
   - Journaling sau mỗi date

5. **Tích Hợp App: Daily Score**
   - Rate mood sau solo date
   - Track energy level

**Hình ảnh (4 hình - BẮT BUỘC):**
- **Hình 45:** Solo Date Ideas - Grid 30 ý tưởng solo date
- **Hình 46:** Perfect Solo Date Checklist - 5 bước solo date hoàn hảo
- **Hình 47:** Solo Date Challenge - Calendar 4 tuần tracking
- **Hình 48:** Self-Love Quote - "Học cách vui một mình"

**Quiz M2 (3 câu) - ĐẶT Ở CUỐI BÀI 2.4:**
```
Câu 1: Mirror Work của ai?
A. Brené Brown ← SAI
B. Louise Hay ← ĐÚNG
C. Gary Chapman ← SAI
D. Lise Bourbeau ← SAI
Giải thích đúng: "Chính xác! Louise Hay là người phát triển phương pháp Mirror Work."
Giải thích sai: "Sai! Mirror Work được phát triển bởi Louise Hay."

Câu 2: Có bao nhiêu loại ranh giới chính?
A. 3 loại ← SAI
B. 4 loại ← SAI
C. 5 loại ← ĐÚNG
D. 7 loại ← SAI
Giải thích đúng: "Chính xác! 5 loại: Thể chất, Cảm xúc, Thời gian, Tiền bạc, Tình dục."
Giải thích sai: "Sai! Có 5 loại ranh giới chính trong bài học."

Câu 3: Hành vi Tinh Tấn nào thuộc nhóm Spirit?
A. Uống nước ← SAI
B. Vận động ← SAI
C. Biết ơn ← ĐÚNG
D. Ngủ đủ giấc ← SAI
Giải thích đúng: "Chính xác! Biết ơn thuộc nhóm Spirit cùng với Sáng tạo."
Giải thích sai: "Sai! Biết ơn và Sáng tạo thuộc nhóm Spirit."
```

---

### MODULE 3: NÂNG TẦN SỐ TÌNH YÊU (Ngày 17-23)

---

#### 📄 BÀI 3.1: THANG CẢM XÚC TÌNH YÊU
**File:** `M3_Bai_3.1_Thang_Cam_Xuc_Tinh_Yeu.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Thang Cảm Xúc Hawkins Áp Dụng Cho Tình Yêu**
   - Shame/Guilt về tình yêu (20-30 Hz)
   - Fear of rejection (100 Hz)
   - Anger từ past relationships (150 Hz)
   - Courage để yêu lại (200 Hz)
   - Acceptance bản thân (350 Hz)
   - Love vô điều kiện (500 Hz)
   - Peace trong quan hệ (600 Hz)

2. **Xác Định Tần Số Hiện Tại**
   - Checklist symptoms mỗi tần số
   - Tự đánh giá trong HTML

3. **Cách Nâng Tần Số**
   - Từ Fear → Courage: Đối mặt
   - Từ Anger → Acceptance: Tha thứ
   - Từ Acceptance → Love: Cho đi

4. **Daily Frequency Check**
   - Buổi sáng: Đo tần số
   - Buổi tối: Ghi nhận thay đổi
   - Template trong HTML

5. **Tích Hợp Vision Board: Daily Score**
   - Track tần số hàng ngày trong app

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 49:** Thang Cảm Xúc Tình Yêu - Hawkins scale với 7 levels cho love
- **Hình 50:** Fear to Love Journey - Arrow từ 100Hz lên 500Hz
- **Hình 51:** Daily Frequency Check - Template đo tần số sáng/tối
- **Hình 52:** Symptoms Each Level - Bảng triệu chứng từng tần số
- **Hình 53:** Frequency Transformation - Cách nâng từ mức này lên mức kia

---

#### 📄 BÀI 3.2: CHUYỂN HÓA NIỀM TIN GIỚI HẠN
**File:** `M3_Bai_3.2_Chuyen_Hoa_Niem_Tin.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Niềm Tin Giới Hạn Về Tình Yêu**
   - "Tôi không xứng đáng được yêu"
   - "Đàn ông/Phụ nữ đều như nhau"
   - "Tình yêu luôn kết thúc đau đớn"
   - "Tôi sẽ bị bỏ rơi"

2. **Nguồn Gốc Niềm Tin**
   - Từ gia đình
   - Từ trải nghiệm
   - Từ xã hội/media
   - Từ bạn bè

3. **Kỹ Thuật Reframe**
   - Nhận diện niềm tin cũ
   - Hỏi: "Có thật không?"
   - Tìm bằng chứng ngược lại
   - Viết niềm tin mới

4. **Bảng Chuyển Đổi Niềm Tin**
   - Template: OLD → NEW
   - 10 ví dụ chuyển đổi
   - Bài tập viết 5 niềm tin của bạn

5. **Affirmations Cho Niềm Tin Mới**
   - List 20 affirmations
   - Cách repeat hiệu quả
   - Tích hợp app: Daily Affirmations

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 54:** Reframe Love Beliefs - Bảng OLD → NEW beliefs
- **Hình 55:** Sources of Limiting Beliefs - 4 nguồn gốc: Gia đình, Trải nghiệm, Xã hội, Bạn bè
- **Hình 56:** Reframe Technique - 4 bước kỹ thuật reframe
- **Hình 57:** 10 Common Love Beliefs - 10 niềm tin giới hạn phổ biến
- **Hình 58:** New Beliefs Examples - Ví dụ niềm tin mới tích cực

---

#### 📄 BÀI 3.3: KHẲNG ĐỊNH TỰ YÊU THƯƠNG
**File:** `M3_Bai_3.3_Khang_Dinh_Tu_Yeu.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Sức Mạnh Của Affirmations**
   - Lặp lại → Tin tưởng → Hành động
   - Neuroscience behind affirmations
   - Tại sao cần consistent

2. **50 Affirmations Tình Yêu**
   - 10 về yêu bản thân
   - 10 về xứng đáng được yêu
   - 10 về sẵn sàng đón nhận
   - 10 về quan hệ lành mạnh
   - 10 về thu hút tri kỷ

3. **Cách Thực Hành Hiệu Quả**
   - Thời điểm: Sáng + Tối
   - Cách nói: Nhìn gương, nói to
   - Cách viết: 15 lần/affirmation
   - Cách nghe: Record giọng mình

4. **7 Ngày Affirmation Challenge**
   - Chọn 7 affirmations
   - 1 affirmation/ngày
   - Repeat 100 lần/ngày
   - Tracking trong HTML

5. **Tích Hợp GEM Master: Affirmations**
   - Personalized affirmations từ AI
   - Daily reminders

**Hình ảnh (4 hình - BẮT BUỘC):**
- **Hình 59:** Affirmations Power - Vòng tròn: Lặp lại → Tin tưởng → Hành động
- **Hình 60:** 50 Love Affirmations - 5 nhóm x 10 affirmations
- **Hình 61:** How to Practice - 4 cách: Nói, Viết, Nghe, Nhìn gương
- **Hình 62:** 7 Day Affirmation Challenge - Calendar tracking

---

#### 📄 BÀI 3.4: HEART COHERENCE - ĐỒNG BỘ TRÁI TIM
**File:** `M3_Bai_3.4_Heart_Coherence.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Heart Coherence Là Gì?** (HeartMath Institute)
   - Tim có "não" riêng (40,000 neurons)
   - Heart Rate Variability
   - Coherence state = optimal

2. **Lợi Ích Heart Coherence**
   - Giảm stress
   - Tăng intuition
   - Cải thiện quyết định
   - Thu hút relationships tốt hơn

3. **Quick Coherence Technique**
   - Bước 1: Focus on heart
   - Bước 2: Breathe through heart
   - Bước 3: Activate positive feeling
   - 3-5 phút mỗi lần

4. **Heart Lock-In Technique**
   - Phiên bản 15 phút
   - Đi sâu hơn
   - Guided script trong HTML

5. **Tích Hợp App: Heart Expansion Ritual**
   - Daily practice trong app
   - Track coherence feelings

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 63:** Heart Coherence Steps - 3 bước Quick Coherence
- **Hình 64:** HeartMath Institute - Logo và giải thích 40,000 neurons trong tim
- **Hình 65:** Heart Rate Variability - Graph HRV coherent vs incoherent
- **Hình 66:** Benefits Heart Coherence - 4 lợi ích chính
- **Hình 67:** Heart Lock-In Technique - Script 15 phút deep practice

**Quiz M3 (3 câu) - ĐẶT Ở CUỐI BÀI 3.4:**
```
Câu 1: Theo thang Hawkins, Love vô điều kiện rung động ở khoảng?
A. 200 Hz ← SAI
B. 350 Hz ← SAI
C. 500 Hz ← ĐÚNG
D. 700 Hz ← SAI
Giải thích đúng: "Chính xác! Love vô điều kiện ở mức 500 Hz trên thang Hawkins."
Giải thích sai: "Sai! Love vô điều kiện rung động ở khoảng 500 Hz."

Câu 2: Heart Coherence được nghiên cứu bởi tổ chức nào?
A. Harvard ← SAI
B. HeartMath Institute ← ĐÚNG
C. MIT ← SAI
D. Stanford ← SAI
Giải thích đúng: "Chính xác! HeartMath Institute là tổ chức nghiên cứu Heart Coherence."
Giải thích sai: "Sai! HeartMath Institute là nơi nghiên cứu về Heart Coherence."

Câu 3: Kỹ thuật Quick Coherence có mấy bước?
A. 2 bước ← SAI
B. 3 bước ← ĐÚNG
C. 4 bước ← SAI
D. 5 bước ← SAI
Giải thích đúng: "Chính xác! 3 bước: Focus heart, Breathe through heart, Activate positive feeling."
Giải thích sai: "Sai! Quick Coherence có 3 bước cơ bản."
```

---

### MODULE 4: SẴN SÀNG ĐÓN TRI KỶ (Ngày 24-30)

---

#### 📄 BÀI 4.1: SOULMATE VS TWIN FLAME VS KARMIC
**File:** `M4_Bai_4.1_Soulmate_Twin_Flame.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **3 Loại Quan Hệ Tâm Linh**
   - **Karmic Relationships**
     - Đến để dạy bài học
     - Thường intense và painful
     - Kết thúc khi bài học xong
   - **Soulmate**
     - Linh hồn cùng nhóm
     - Cảm giác "quen biết từ kiếp trước"
     - Hỗ trợ growth
   - **Twin Flame**
     - "Nửa kia" của linh hồn
     - Mirror hoàn hảo
     - Rare và transformative

2. **Dấu Hiệu Nhận Biết**
   - Bảng so sánh 3 loại
   - Checklist cho từng loại

3. **Bạn Đang Tìm Gì?**
   - Self-reflection: Bạn muốn gì?
   - Mỗi loại phù hợp với ai?
   - Không có loại nào "tốt hơn"

4. **Chuẩn Bị Cho Soulmate/Twin Flame**
   - Chữa lành trước
   - Nâng tần số
   - Sẵn sàng về mặt energetic

5. **Tích Hợp GEM Master Tarot**
   - Bốc bài về mối quan hệ tâm linh

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 68:** 3 Loại Quan Hệ Tâm Linh - Karmic/Soulmate/Twin Flame comparison
- **Hình 69:** Karmic Relationship - Đặc điểm và dấu hiệu
- **Hình 70:** Soulmate Connection - Đặc điểm linh hồn cùng nhóm
- **Hình 71:** Twin Flame Mirror - "Nửa kia" của linh hồn
- **Hình 72:** Checklist Nhận Biết - Bảng checklist cho từng loại

---

#### 📄 BÀI 4.2: VIẾT THƯ CHO TRI KỶ
**File:** `M4_Bai_4.2_Viet_Thu_Tri_Ky.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Sức Mạnh Của Intention Setting**
   - Viết ra = Làm rõ ràng
   - Universe cần biết bạn muốn gì
   - Law of Attraction và specificity

2. **Soulmate List**
   - 50 qualities bạn muốn ở partner
   - Non-negotiables vs. Nice-to-haves
   - Template trong HTML

3. **Viết Thư Cho Tri Kỷ**
   - Viết như đã gặp rồi
   - Cảm ơn họ đã đến
   - Mô tả cuộc sống cùng nhau
   - Template thư trong HTML

4. **Ritual Star Wish**
   - Thực hiện dưới ánh sao
   - Gửi thư lên vũ trụ
   - Tích hợp app GEM

5. **Bài Tập: 30 Ngày Visualization**
   - 5 phút/ngày visualize tri kỷ
   - Feel as if already happened
   - Tracking sheet

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 73:** Soulmate List Template - 50 qualities template
- **Hình 74:** Law of Attraction - Infographic về intention setting
- **Hình 75:** Letter to Soulmate Template - Mẫu thư gửi tri kỷ
- **Hình 76:** Star Wish Ritual - Ritual gửi nguyện ước dưới sao
- **Hình 77:** 30 Day Visualization - Calendar tracking visualization

---

#### 📄 BÀI 4.3: CRYSTALS CHO TÌNH YÊU
**File:** `M4_Bai_4.3_Crystals_Tinh_Yeu.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Crystals Hoạt Động Như Thế Nào?**
   - Rung động và frequency
   - Amplify intentions
   - Không magic, cần action kèm

2. **Top 5 Crystals Cho Tình Yêu**
   - 💗 **Rose Quartz**: Yêu bản thân, yêu vô điều kiện
   - 💚 **Green Aventurine**: Chữa lành trái tim
   - 💜 **Amethyst**: Intuition về relationships
   - 🤍 **Moonstone**: Năng lượng feminine, thu hút
   - 🩷 **Rhodonite**: Chữa lành từ heartbreak

3. **Cách Sử Dụng Crystals**
   - Đeo trang sức
   - Thiền với crystal
   - Đặt dưới gối
   - Grid tình yêu

4. **Ritual Water Manifest Với Crystal**
   - Lập trình nước với crystal
   - Uống nước có năng lượng tình yêu
   - Script ritual

5. **Mua Crystals: YinYangMasters.com**
   - Giới thiệu shop
   - Ưu đãi cho học viên
   - Link đến shop

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 78:** 5 Crystals for Love - Rose Quartz, Green Aventurine, Amethyst, Moonstone, Rhodonite
- **Hình 79:** How Crystals Work - Rung động và frequency amplification
- **Hình 80:** 4 Ways to Use Crystals - Đeo, Thiền, Gối, Grid
- **Hình 81:** Water Manifest Ritual - Lập trình nước với crystal
- **Hình 82:** YinYangMasters Shop - Preview sản phẩm crystals tình yêu

---

#### 📄 BÀI 4.4: VISUALIZATION - HÌNH DUNG TRI KỶ
**File:** `M4_Bai_4.4_Visualization.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **Visualization Là Gì?**
   - Hình dung = Tạo reality trong tâm trí
   - Brain không phân biệt real vs imagined
   - Athletes và visualization

2. **5 Bước Visualization Tri Kỷ**
   - Bước 1: Relax hoàn toàn
   - Bước 2: Hình dung chi tiết
   - Bước 3: Engage all senses
   - Bước 4: Feel emotions strongly
   - Bước 5: Release và trust

3. **Script Guided Visualization** (15 phút)
   - Gặp tri kỷ lần đầu
   - First date
   - Building life together
   - Growing old together

4. **Vision Board Tình Yêu**
   - Cách tạo vision board
   - Hình ảnh nên có
   - Đặt ở đâu

5. **Tích Hợp Vision Board: Goals**
   - Tạo love goals trong app
   - Daily reminder visualization

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 83:** Visualization Love Board - Ví dụ vision board tình yêu
- **Hình 84:** 5 Steps Visualization - 5 bước visualization hiệu quả
- **Hình 85:** Brain Real vs Imagined - Não không phân biệt thật/tưởng tượng
- **Hình 86:** Guided Visualization Script - 4 scenes: Gặp, Date, Xây dựng, Già cùng
- **Hình 87:** Athletes Visualization - Ví dụ athletes dùng visualization

**Quiz M4 (3 câu) - ĐẶT Ở CUỐI BÀI 4.4:**
```
Câu 1: Karmic relationship thường có đặc điểm gì?
A. Nhẹ nhàng và bình yên ← SAI
B. Intense và painful ← ĐÚNG
C. Boring và nhàm chán ← SAI
D. Perfect và không conflicts ← SAI
Giải thích đúng: "Chính xác! Karmic relationships thường intense vì đến để dạy bài học."
Giải thích sai: "Sai! Karmic relationships thường intense và painful vì mang theo bài học."

Câu 2: Rose Quartz có công dụng chính là gì?
A. Bảo vệ năng lượng ← SAI
B. Tăng intuition ← SAI
C. Yêu bản thân và yêu vô điều kiện ← ĐÚNG
D. Thịnh vượng tài chính ← SAI
Giải thích đúng: "Chính xác! Rose Quartz là đá của tình yêu vô điều kiện và self-love."
Giải thích sai: "Sai! Rose Quartz chuyên về tình yêu vô điều kiện và yêu bản thân."

Câu 3: Visualization hiệu quả vì?
A. Brain phân biệt được real vs imagined ← SAI
B. Brain KHÔNG phân biệt real vs imagined ← ĐÚNG
C. Chỉ là placebo effect ← SAI
D. Không có cơ sở khoa học ← SAI
Giải thích đúng: "Chính xác! Não bộ phản ứng tương tự với trải nghiệm thật và tưởng tượng."
Giải thích sai: "Sai! Não bộ không phân biệt rõ ràng giữa real và imagined experiences."
```

---

### MODULE 5: NGHỆ THUẬT QUAN HỆ (Ngày 31-37)

---

#### 📄 BÀI 5.1: 4 PHONG CÁCH GIAO TIẾP
**File:** `M5_Bai_5.1_4_Phong_Cach_Giao_Tiep.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **4 Phong Cách Giao Tiếp**
   - **Passive**: Im lặng, né tránh conflict
   - **Aggressive**: Áp đặt, không tôn trọng người khác
   - **Passive-Aggressive**: Gián tiếp, mỉa mai
   - **Assertive**: Rõ ràng, tôn trọng cả hai

2. **Test: Phong Cách Của Bạn**
   - 10 câu test trong HTML
   - Scoring và interpretation

3. **Assertive Communication**
   - "I statements" vs "You statements"
   - Ví dụ: "Tôi cảm thấy..." vs "Bạn làm tôi..."
   - Practice scenarios

4. **Áp Dụng Trong Quan Hệ Yêu Đương**
   - Conflicts thường gặp
   - Scripts để assertive
   - Role-play exercises

5. **Bài Tập: Chuyển Đổi Câu Nói**
   - 10 câu aggressive → assertive
   - Template trong HTML

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 88:** 4 Communication Styles - 4 quadrants comparison
- **Hình 89:** Passive vs Aggressive - So sánh 2 phong cách cực đoan
- **Hình 90:** Assertive Communication - Phong cách tốt nhất
- **Hình 91:** I Statements vs You Statements - Ví dụ chuyển đổi
- **Hình 92:** Conflict Resolution Scripts - Các scripts assertive

---

#### 📄 BÀI 5.2: 5 NGÔN NGỮ TÌNH YÊU
**File:** `M5_Bai_5.2_5_Ngon_Ngu_Tinh_Yeu.html`
**Thời lượng:** 35 phút | **Words:** 2,500-2,700

**Sections:**
1. **5 Love Languages** (Gary Chapman)
   - 💬 Words of Affirmation
   - 🎁 Receiving Gifts
   - 🤝 Acts of Service
   - ⏰ Quality Time
   - 🤗 Physical Touch

2. **Test Chi Tiết**
   - 30 câu test trong HTML
   - Xác định ngôn ngữ chính và phụ

3. **Hiểu Ngôn Ngữ Của Partner**
   - Quan sát cách họ cho
   - Quan sát cách họ phàn nàn
   - Hỏi trực tiếp

4. **Speak Their Language**
   - Cách thể hiện mỗi ngôn ngữ
   - Ví dụ cụ thể
   - Tránh hiểu lầm

5. **Love Language Date Ideas**
   - 5 date ideas cho mỗi ngôn ngữ
   - Total: 25 ideas

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 93:** 5 Love Languages Detail - 5 icons với mô tả chi tiết
- **Hình 94:** Gary Chapman - Tác giả và quote
- **Hình 95:** How to Identify Partner's Language - 3 cách: Quan sát, Phàn nàn, Hỏi
- **Hình 96:** Speak Their Language - Cách thể hiện mỗi ngôn ngữ
- **Hình 97:** 25 Date Ideas - 5 ideas cho mỗi love language

---

#### 📄 BÀI 5.3: RED FLAGS & GREEN FLAGS
**File:** `M5_Bai_5.3_Red_Green_Flags.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Red Flags Trong Quan Hệ**
   - 🚩 Love bombing
   - 🚩 Gaslighting
   - 🚩 Controlling behavior
   - 🚩 Disrespecting boundaries
   - 🚩 Hot and cold
   - ... (20 red flags)

2. **Green Flags Trong Quan Hệ**
   - 💚 Consistent communication
   - 💚 Respects boundaries
   - 💚 Takes responsibility
   - 💚 Supports your goals
   - 💚 Healthy conflict resolution
   - ... (20 green flags)

3. **Toxic Relationship Patterns**
   - Narcissistic abuse
   - Codependency
   - Trauma bonding
   - How to recognize và exit

4. **Trust Your Gut**
   - Intuition là gì
   - Khi nào body cảnh báo
   - Đừng bỏ qua red flags vì lonely

5. **Bài Tập: Checklist Relationship Health**
   - Self-assessment trong HTML
   - Áp dụng cho current hoặc past relationship

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 98:** Red vs Green Flags - So sánh 2 cột side-by-side
- **Hình 99:** 20 Red Flags - List 20 red flags phổ biến
- **Hình 100:** 20 Green Flags - List 20 green flags lành mạnh
- **Hình 101:** Toxic Relationship Patterns - Narcissism, Codependency, Trauma bonding
- **Hình 102:** Trust Your Gut - Khi nào body cảnh báo danger

---

#### 📄 BÀI 5.4: LẮNG NGHE SÂU
**File:** `M5_Bai_5.4_Lang_Nghe_Sau.html`
**Thời lượng:** 30 phút | **Words:** 2,500-2,700

**Sections:**
1. **Deep Listening Là Gì?**
   - Nghe để HIỂU, không phải để REPLY
   - Full presence
   - Without judgment

2. **5 Bước Lắng Nghe Sâu**
   - Bước 1: Stop everything
   - Bước 2: Eye contact
   - Bước 3: Reflect back
   - Bước 4: Ask clarifying questions
   - Bước 5: Validate emotions

3. **Barriers Ngăn Cản Deep Listening**
   - Thiên kiến
   - Chuẩn bị phản hồi
   - Distraction
   - Judgment

4. **Practice Exercises**
   - 2 người: Speaker và Listener
   - 5 phút mỗi turn
   - Feedback sau

5. **Tích Hợp Ritual: Gratitude Flow**
   - Biết ơn khi được lắng nghe
   - Biết ơn người lắng nghe bạn

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 103:** 5 Steps Deep Listening - 5 bước lắng nghe sâu
- **Hình 104:** Deep Listening vs Regular Listening - So sánh
- **Hình 105:** Barriers to Listening - 4 rào cản: Thiên kiến, Chuẩn bị reply, Distraction, Judge
- **Hình 106:** Practice Exercise - 2 người Speaker/Listener
- **Hình 107:** Gratitude for Listening - Biết ơn được lắng nghe

**Quiz M5 (3 câu) - ĐẶT Ở CUỐI BÀI 5.4:**
```
Câu 1: Phong cách giao tiếp nào tốt nhất trong relationships?
A. Passive ← SAI
B. Aggressive ← SAI
C. Assertive ← ĐÚNG
D. Passive-Aggressive ← SAI
Giải thích đúng: "Chính xác! Assertive communication tôn trọng cả bản thân và người khác."
Giải thích sai: "Sai! Assertive communication là phong cách lành mạnh nhất."

Câu 2: Love bombing là gì?
A. Green flag ← SAI
B. Red flag - yêu thương quá mức ban đầu để manipulate ← ĐÚNG
C. Cách thể hiện tình yêu lành mạnh ← SAI
D. Phong cách giao tiếp ← SAI
Giải thích đúng: "Chính xác! Love bombing là red flag - dùng tình cảm intense để manipulate."
Giải thích sai: "Sai! Love bombing là red flag - tình cảm quá mức ban đầu thường là manipulation."

Câu 3: Deep listening là nghe để?
A. Reply ← SAI
B. Judge ← SAI
C. Hiểu ← ĐÚNG
D. Tranh luận ← SAI
Giải thích đúng: "Chính xác! Deep listening là nghe để HIỂU, không phải để reply."
Giải thích sai: "Sai! Deep listening là nghe với mục đích hiểu, không phải để phản hồi."
```

---

### MODULE 6: SỨ GIẢ TÌNH YÊU (Ngày 38-42)

---

#### 📄 BÀI 6.1: 3 CON ĐƯỜNG TÌNH YÊU
**File:** `M6_Bai_6.1_3_Con_Duong.html`
**Thời lượng:** 35 phút | **Words:** 2,800-3,200

**Sections:**
1. **Tổng Kết 42 Ngày**
   - Bạn đã đi qua những gì
   - Transformation highlights
   - "Bạn không còn là người cũ"

2. **3 Con Đường Tiếp Theo**
   - **Con Đường 1: Tự Thực Hành**
     - Tiếp tục dùng app GEM free
     - Review bài học định kỳ
     - Join community forum
     - Kết quả dự kiến: 50-60% transformation
     - Phù hợp: Tự motivated, có thời gian, muốn tiết kiệm
   
   - **Con Đường 2: Sản Phẩm Hỗ Trợ**
     - Khóa học tiếp theo
     - Crystals tình yêu
     - Premium app features
     - Kết quả dự kiến: 80-90% transformation
     - Phù hợp: Muốn results nhanh, sẵn sàng đầu tư
   
   - **Con Đường 3: Partnership**
     - Affiliate / CTV / Instructor
     - Vừa transform vừa kiếm tiền
     - Lan tỏa yêu thương
     - Kết quả dự kiến: 100%+ transformation + thu nhập passive
     - Phù hợp: Yêu thích chia sẻ, muốn giúp người khác

3. **Khung Quyết Định**
   - 4 câu hỏi tự hỏi:
     1. "Tình yêu và các mối quan hệ của tôi trong 12 tháng tới sẽ như thế nào?"
     2. "Hoàn cảnh hiện tại của tôi (độc thân/có người yêu/đã cưới)?"
     3. "Điều gì khiến trái tim tôi háo hức nhất?"
     4. "Tôi sẵn sàng đầu tư ở mức nào cho tình yêu?"
   - "Lựa chọn SAI duy nhất là lựa chọn bạn HỐI HẬN sau này"

4. **Luật Cho Đi Trong Tình Yêu**
   - Nguyên lý: "Tình yêu nhân lên khi chia sẻ"
   - Giới thiệu nhẹ về Partnership
   - "Không phải ai cũng phù hợp - và điều đó OK"
   - Ritual Heart Expansion - lan tỏa yêu thương

**Hình ảnh (5 hình - BẮT BUỘC):**
- **Hình 108:** 3 Con Đường Tình Yêu - 3 paths với icons
- **Hình 109:** 42 Day Transformation - Before/After journey
- **Hình 110:** Path 1 Self Practice - Free app features
- **Hình 111:** Path 2 Products - Courses, Crystals, Premium
- **Hình 112:** Path 3 Partnership - Affiliate/CTV/Instructor

**BÀI TẬP TRONG HTML:**
- 4 câu hỏi decision framework (self-reflection textarea)

---

#### 📄 BÀI 6.2: CƠ HỘI & LỰA CHỌN (BÀI CUỐI)
**File:** `M6_Bai_6.2_Co_Hoi_Lua_Chon.html`
**Thời lượng:** 40 phút | **Words:** 3,000-3,500

**Sections:**

1. **Con Đường 2 Chi Tiết - Products**

   **KHÓA HỌC TIẾP THEO 📚**
   - Khóa "Tái Tạo Tư Duy Triệu Phú" - ₫499,000
     - "Tình yêu tốt đẹp cần nền tảng tài chính vững"
   - Khóa "GEM Trading Academy" - ₫X
     - "Tự do tài chính = Tự do chọn người yêu vì YÊU"

   **CRYSTALS TÌNH YÊU 💎**
   - Rose Quartz Set - ₫X
   - Rhodonite Bracelet - ₫X
   - Love Crystal Bundle - ₫X
   - Link: YinYangMasters.com

   **GÓI TRỌN BỘ "LOVE & WEALTH" 🎁** ⭐ TIẾT KIỆM NHẤT
   - Khóa Triệu Phú + Love Crystals + Premium App
   - Giá gốc: ₫X
   - Giá combo: ₫Y (tiết kiệm Z%)
   - "Thịnh vượng + Tình yêu = Cuộc sống trọn vẹn"

2. **Con Đường 3 Chi Tiết - Partnership**

   **TIER 1: AFFILIATE 🌱**
   - Commission: 10% mỗi sale
   - Ví dụ: Giới thiệu khóa ₫399,000 = ₫39,900/sale
   - 10 sales/tháng = ₫399,000 passive income
   - Yêu cầu: Đã hoàn thành khóa này
   - Thời gian: 2-3 giờ/tháng
   - CTA: "Lấy Link Affiliate Ngay"

   **TIER 2: CTV (Cộng Tác Viên) 🌟** ⭐ ĐỀ XUẤT
   - Commission: 15-30% (4 levels)
     - Level 1: 15% (0-5 sales)
     - Level 2: 20% (6-15 sales)
     - Level 3: 25% (16-30 sales)
     - Level 4: 30% (31+ sales)
   - Ví dụ Level 4: 30 sales x ₫120,000 = ₫3,600,000/tháng
   - Bao gồm: Training + Support + Dashboard
   - CTA: "Đăng Ký CTV"

   **TIER 3: INSTRUCTOR 🎓**
   - Multiple income streams
   - Yêu cầu: Đã là CTV Level 3+
   - CTA: "Ứng Tuyển Instructor"

3. **Tại Sao Bây Giờ?**

   **🎁 BONUS ĐẶC BIỆT**
   - Bonus 1: Mini Rose Quartz (giá trị ₫X) - khi đăng ký trong 7 ngày
   - Bonus 2: 1-on-1 Love Coaching Call 30 phút
   - Bonus 3: Exclusive community "Love Tribe"
   - "MIỄN PHÍ khi đăng ký trong 7 ngày"

   **🆕 ĐỘC QUYỀN**
   - Chỉ 30 CTV slots trong Q1 cho khóa Love
   - Đã filled: 18/30
   - "Còn 12 slots"

4. **Next Steps - 3 CTAs**

   **CARD 1: CON ĐƯỜNG 2 - PRODUCTS**
   - Bước 1: Xem danh sách sản phẩm
   - Bước 2: Chọn phù hợp với nhu cầu
   - Bước 3: Checkout
   - CTA Primary: "Xem Sản Phẩm" → Shop
   - CTA Secondary: "Hỏi GEM Master" → App

   **CARD 2: CON ĐƯỜNG 3 - PARTNERSHIP** ⭐ FEATURED
   - Badge: "ƯU ĐÃI ĐẶC BIỆT - CÒN 7 NGÀY"
   - CTA Premium: "Đăng Ký Partnership Ngay" → App
   - Styling: Dark gradient, gold border, scale 1.05

   **CARD 3: CHƯA SẴN SÀNG**
   - Hoàn toàn OK nếu chưa sẵn sàng!
   - Options:
     - Tiếp tục dùng app GEM free
     - Tham gia community forum
   - CTA Soft: "Tham Gia Community" → App

5. **Lời Kết**
   - Cảm ơn đã hoàn thành 42 ngày
   - "Bạn đã là người yêu thương - cả với bản thân và người khác"
   - "Tình yêu đích thực bắt đầu từ bên trong - và bạn đã tìm thấy nó"
   - Blessing từ Jennie
   - "Tình yêu là QUYỀN của bạn. Bạn XỨNG ĐÁNG được yêu thương."

**CONTACT SUPPORT BOX:**
- Email: support@gemral.com
- Chat: Trong app GEM
- "Có thắc mắc về tình yêu hay khóa học? Chúng tôi sẵn sàng lắng nghe"

**Hình ảnh (6 hình - BẮT BUỘC):**
- **Hình 113:** Partnership Tiers Love - 3 tiers: Affiliate 10%, CTV 15-30%, Instructor
- **Hình 114:** Bonus Package Love - Rose Quartz + Coaching + Love Tribe
- **Hình 115:** Product Showcase - Khóa Triệu Phú, GEM Trading, Crystals
- **Hình 116:** Income Examples - Ví dụ thu nhập từng tier
- **Hình 117:** Urgency - "Còn 12 slots CTV"
- **Hình 118:** Jennie Blessing - Quote kết thúc từ Jennie

**BÀI TẬP TRONG HTML:**
- Final decision (3 radio buttons)
- Contact form nếu có câu hỏi

**KHÔNG CÓ QUIZ - Bài cuối cùng**

---

## 📊 TỔNG KẾT FILES CẦN TẠO

| # | Module | File Name | Quiz |
|---|--------|-----------|------|
| 1 | M0 | M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html | ❌ |
| 2 | M0 | M0_Bai_0.2_Danh_Gia_Tan_So_Tinh_Yeu.html | ✅ 2 câu |
| 3 | M1 | M1_Bai_1.1_Ban_Do_Quan_He_Qua_Khu.html | ❌ |
| 4 | M1 | M1_Bai_1.2_Inner_Child_Healing.html | ❌ |
| 5 | M1 | M1_Bai_1.3_Nghe_Thuat_Tha_Thu.html | ❌ |
| 6 | M1 | M1_Bai_1.4_Ritual_Dot_Bo_Qua_Khu.html | ✅ 3 câu |
| 7 | M2 | M2_Bai_2.1_Mirror_Work.html | ❌ |
| 8 | M2 | M2_Bai_2.2_7_Hanh_Vi_Tinh_Tan.html | ❌ |
| 9 | M2 | M2_Bai_2.3_Thiet_Lap_Ranh_Gioi.html | ❌ |
| 10 | M2 | M2_Bai_2.4_Solo_Date.html | ✅ 3 câu |
| 11 | M3 | M3_Bai_3.1_Thang_Cam_Xuc_Tinh_Yeu.html | ❌ |
| 12 | M3 | M3_Bai_3.2_Chuyen_Hoa_Niem_Tin.html | ❌ |
| 13 | M3 | M3_Bai_3.3_Khang_Dinh_Tu_Yeu.html | ❌ |
| 14 | M3 | M3_Bai_3.4_Heart_Coherence.html | ✅ 3 câu |
| 15 | M4 | M4_Bai_4.1_Soulmate_Twin_Flame.html | ❌ |
| 16 | M4 | M4_Bai_4.2_Viet_Thu_Tri_Ky.html | ❌ |
| 17 | M4 | M4_Bai_4.3_Crystals_Tinh_Yeu.html | ❌ |
| 18 | M4 | M4_Bai_4.4_Visualization.html | ✅ 3 câu |
| 19 | M5 | M5_Bai_5.1_4_Phong_Cach_Giao_Tiep.html | ❌ |
| 20 | M5 | M5_Bai_5.2_5_Ngon_Ngu_Tinh_Yeu.html | ❌ |
| 21 | M5 | M5_Bai_5.3_Red_Green_Flags.html | ❌ |
| 22 | M5 | M5_Bai_5.4_Lang_Nghe_Sau.html | ✅ 3 câu |
| 23 | M6 | M6_Bai_6.1_3_Con_Duong.html | ❌ |
| 24 | M6 | M6_Bai_6.2_Co_Hoi_Lua_Chon.html | ❌ |

**Tổng:** 24 files HTML + 1 file Master_Hinh_Anh_Khoa_Tinh_Yeu.md
**Tổng số hình:** 118 hình (4-6 hình/bài)

---

## 🖼️ TỔNG KẾT HÌNH ẢNH

**Tổng số hình:** 118 hình (4-6 hình/bài x 24 bài)

Hình ảnh được đánh số liên tục từ 1-118, chi tiết trong từng bài học ở trên.
Format trong Master_Hinh_Anh_Khoa_Tinh_Yeu.md sẽ liệt kê:
- Số thứ tự hình
- Tên hình
- Bài sử dụng
- Mô tả nội dung cần tạo trên Canva

---

## 📝 YÊU CẦU FILE MASTER HÌNH ẢNH

**File:** `Master_Hinh_Anh_Khoa_Tinh_Yeu.md`

**Format (dạng text dễ copy, KHÔNG dùng bảng):**
```markdown
# 🖼️ MASTER HÌNH ẢNH - KHÓA TẦN SỐ TÌNH YÊU

Tổng số: 118 hình

---

## MODULE 0

### Hình 1: Roadmap 42 Ngày
Bài: M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html
Placeholder: images/roadmap-42-ngay.png
Nội dung cần tạo:
- Tiêu đề: "HÀNH TRÌNH 42 NGÀY"
- 6 modules dạng trái tim nối tiếp
- M0: Khởi đầu (Ngày 1-2)
- M1: Chữa lành (Ngày 3-9)
- M2: Yêu bản thân (Ngày 10-16)
- M3: Nâng tần số (Ngày 17-23)
- M4: Sẵn sàng tri kỷ (Ngày 24-30)
- M5: Nghệ thuật quan hệ (Ngày 31-37)
- M6: Sứ giả tình yêu (Ngày 38-42)
- Màu sắc: Navy background, Gold text, Pink hearts
- Style: Glassmorphism, gradient

---

### Hình 2: Tình Yêu = 540 Hz
Bài: M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html
Placeholder: images/tinh-yeu-540-hz.png
Nội dung cần tạo:
- Thang tần số từ thấp đến cao
- 540 Hz được highlight vàng
- Text: "TÌNH YÊU VÔ ĐIỀU KIỆN = 540 Hz"
- Các mức thấp hơn mờ đi
- Style: Glassmorphism

---

### Hình 3: Nguyên Lý Phản Chiếu
...
```

---

## 🔄 QUY TRÌNH LÀM VIỆC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUY TRÌNH CLAUDE CODE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📖 BƯỚC 0 - MỖI KHI BẮT ĐẦU SESSION MỚI:                                   │
│  ────────────────────────────────────────────────────────────────────────   │
│  1. Đọc file /mnt/project/GEM_COURSE_TEMPLATE_V5_4_COMPLETE.md              │
│  2. Đọc file /mnt/project/OUTLINE_KHOA_TINH_YEU_COMPLETE.md                 │
│  3. Đọc file /mnt/project/bai-2-4-facebook-final.html (CSS mẫu)            │
│  4. Đọc file PROMPT_KHOA_TINH_YEU_HTML_CREATION.md (file này)               │
│  5. Đọc file Master_Hinh_Anh_Khoa_Tinh_Yeu.md (nếu đã tạo)                 │
│                                                                             │
│  📁 BƯỚC 1 - TẠO FOLDER:                                                    │
│  ────────────────────────────────────────────────────────────────────────   │
│  mkdir -p /home/claude/Khoa_Tinh_Yeu                                       │
│                                                                             │
│  📄 BƯỚC 2 - TẠO TỪNG FILE HTML:                                            │
│  ────────────────────────────────────────────────────────────────────────   │
│  Theo thứ tự từ M0_Bai_0.1 đến M6_Bai_6.2                                   │
│  Mỗi file PHẢI:                                                             │
│  - Copy CHÍNH XÁC CSS từ bai-2-4-facebook-final.html                       │
│  - Follow nội dung từ outline                                              │
│  - Có đầy đủ sections như spec                                             │
│  - Có quiz (nếu có) với instant feedback                                   │
│  - Có placeholder images với naming convention                             │
│                                                                             │
│  📋 BƯỚC 3 - UPDATE MASTER HÌNH ẢNH:                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│  Sau mỗi bài, update file Master_Hinh_Anh_Khoa_Tinh_Yeu.md                 │
│  Format: Text dạng dòng, dễ copy                                           │
│                                                                             │
│  🔄 BƯỚC 4 - UPDATE VÀO WEB/APP:                                            │
│  ────────────────────────────────────────────────────────────────────────   │
│  - Xác định vị trí khóa học trong codebase                                 │
│  - Copy HTML files vào đúng folder                                         │
│  - Update index/routing nếu cần                                            │
│                                                                             │
│  ✅ BƯỚC 5 - VERIFY:                                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│  - Test responsive (mobile + desktop)                                      │
│  - Test quiz functionality                                                 │
│  - Verify encoding tiếng Việt                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST MỖI FILE HTML

```
□ CSS copy chính xác từ bai-2-4-facebook-final.html
□ Tiếng Việt có dấu đầy đủ, encoding UTF-8
□ Mobile-first responsive design
□ Tất cả sections theo outline
□ 4-6 hình ảnh (BẮT BUỘC - không được ít hơn 4 hình)
□ Images có placeholder với naming convention
□ Quiz instant feedback (nếu có)
□ KHÔNG có navigation buttons
□ KHÔNG có Submit button trong quiz
□ Dark theme consistent
□ Font Montserrat
□ Update Master_Hinh_Anh sau khi tạo mỗi bài
```

---

**Document Version:** 1.0
**Created:** 03/01/2025
**Purpose:** Prompt chi tiết để Claude Code tạo HTML Khóa Tình Yêu
