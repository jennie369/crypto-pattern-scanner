# BÁO CÁO ĐƠN HÀNG KHÓA HỌC - GEM PLATFORM
**Ngày báo cáo: 19/02/2026**
**Nguồn dữ liệu: Supabase (pending_payments, pending_course_access, payment_logs, course_enrollments) + Shopify**

---

## I. TỔNG QUAN

| Chỉ tiêu | Số lượng |
|----------|---------|
| Tổng đơn hàng thực (khách hàng thật) | **19 đơn** |
| Đã thanh toán - Chuyển khoản ngân hàng | 9 đơn |
| Đã thanh toán - Credit Card (THẺ TÍN DỤNG) | 4 đơn |
| **Tổng đơn đã thanh toán** | **13 đơn** |
| Hết hạn / Chưa thanh toán (EXPIRED) | 5 đơn |
| Chờ thanh toán (PENDING) | 1 đơn |
| Đang chờ unlock trong `pending_course_access` | 14 lượt (12 khách hàng) |
| Đã được enroll vào `course_enrollments` | **0 (TRỐNG!)** |

---

## II. ĐƠN ĐÃ THANH TOÁN BẰNG CHUYỂN KHOẢN NGÂN HÀNG (9 đơn)

| # | Mã ĐH | Shopify Order ID | Tên KH | Email | Số tiền (VND) | Khóa học | Ngày TT | Xác minh |
|---|-------|-----------------|--------|-------|--------------|----------|---------|---------|
| 1 | DH4763 | 6346362486961 | Hạnh | nghh0406@gmail.com | 399,000 | Kích Hoạt Tần Số Tình Yêu | 19/02/2026 | Shopify verified |
| 2 | DH4762 | 6342357713073 | Hồng | 24001612@hus.edu.vn | 300,000 | Kích Hoạt Tần Số Tình Yêu | 19/02/2026 | Shopify verified |
| 3 | DH4761 | 6338682912945 | Ty | tykul0692@yahoo.com.vn | 299,000 | GEM Trading - Gói Căn Bản | 19/02/2026 | Shopify verified |
| 4 | DH4760 | 6336057082033 | Trần | phuongtthienma@gmail.com | 345,000 | Kích Hoạt Tần Số Tình Yêu | 12/02/2026 | Auto (Casso) |
| 5 | DH4757 | 6324699529393 | Thảo | nguyenthaots11@gmail.com | 300,000 | Kích Hoạt Tần Số Tình Yêu | 12/02/2026 | Shopify verified |
| 6 | DH4756 | 6324408647857 | An | namanle68@gmail.com | 208,000 | GEM Trading - Gói Căn Bản | 05/02/2026 | Auto (Casso) |
| 7 | DH4752 | 6322166300849 | Hiệp | buiphuochiep03@gmail.com | 499,000 | Tái Tạo Tư Duy Triệu Phú | 12/02/2026 | Manual (Admin) |
| 8 | DH4750 | 6321801363633 | Hồng | thuhongbvdknamdinh@gmail.com | 438,900 | Kích Hoạt Tần Số Tình Yêu | 03/02/2026 | Auto (Casso) |
| 9 | DH4743 | 6291500466353 | Nguyên | lecaonguyen79nt@gmail.com | 399,001 | Kích Hoạt Tần Số Tình Yêu | 14/01/2026 | Auto (Casso) |

**Tổng doanh thu chuyển khoản: 3,187,901 VND**

---

## III. ĐƠN ĐÃ THANH TOÁN BẰNG CREDIT CARD (4 đơn) - ĐÃ KHÔI PHỤC

> **ĐÃ SỬA**: 4 đơn hàng credit card đã được thêm vào `pending_payments` và liên kết với `pending_course_access` (ngày 19/02/2026).

| # | Mã ĐH | Tên KH | Email | Khóa học | Số tiền (VND) | Trạng thái |
|---|-------|--------|-------|----------|--------------|-----------|
| 1 | #4759 | Phuong Guru | phuongguru@gmail.com | Kích Hoạt Tần Số Tình Yêu | 439,000 | paid (shopify_verified) |
| 2 | #4755 | Thảo Đoàn | thaodoan2806@gmail.com | 7 Ngày Khai Mở Tần Số Gốc | 399,000 | paid (shopify_verified) |
| 3 | #4751 | Tan Tien | tantien97ductri@gmail.com | GEM Trading Cơ Bản (Tier Starter) | 208,000 | paid (shopify_verified) |
| 4 | #4749 | Thảo Đoàn | thaodoan2806@gmail.com | Tái Tạo Tư Duy Triệu Phú + Kích Hoạt Tần Số Tình Yêu | 938,000 | paid (shopify_verified) |

**Tổng doanh thu credit card: 1,984,000 VND**

### Nguyên nhân gốc rễ (ĐÃ SỬA)

**Bug 1: Webhook skip credit card** - `shopify-order-webhook/index.ts`
- Webhook cũ chỉ xử lý bank transfer, credit card bị skip với `{ success: true }` (vi phạm Rule 10: fallback mask failure)
- **FIX**: Webhook mới xử lý TẤT CẢ payment types. Credit card orders tạo record với `payment_status = 'paid'` ngay lập tức.

**Bug 2: get-order-number trả về đơn sai** - `get-order-number/index.ts`
- Khi credit card order không có trong DB, fallback Strategy 3 trả về đơn pending GẦN NHẤT (bất kỳ!) → QR code DH4754 hiển thị cho khách DH4757
- **FIX**: Xóa Strategy 2+3 nguy hiểm. Chỉ giữ Strategy 1 (query by shopify_order_id). Không tìm thấy → trả 404.

**Ngày 19/02/2026**:
- Thêm cột `payment_method` vào `pending_payments` (migration applied)
- Insert 4 đơn credit card vào `pending_payments` (status = paid)
- Liên kết `pending_course_access` records với đúng shopify_order_id

**3 khách hàng credit card (thaodoan2806, phuongguru, tantien97) đã được thêm thủ công** vào `pending_course_access` ngày 12/02/2026 lúc 17:45 → nay đã được liên kết đúng order.

---

## IV. ĐƠN HẾT HẠN - CHƯA THANH TOÁN (5 đơn - EXPIRED)

| # | Mã ĐH | Tên KH | Email | Số tiền (VND) | Ngày đặt | Ngày hết hạn |
|---|-------|--------|-------|--------------|---------|-------------|
| 1 | DH4758 | Hồng Phượng | hongphuong4012@gmail.com | 330,000 | 07/02/2026 | 08/02/2026 |
| 2 | DH4754 | Thúy | thuycuonguyennhu@gmail.com | 1,990,000 | 03/02/2026 | 04/02/2026 |
| 3 | DH4753 | ửqt | maow390@gmail.com | 399,000 | 03/02/2026 | 04/02/2026 |
| 4 | DH4748 | ửqt | maow390@gmail.com | 39,000 | 31/01/2026 | 01/02/2026 |
| 5 | DH4744 | Jennie 2 | jenniechu68@gmail.com | 399,000 | 14/01/2026 | 15/01/2026 |

---

## V. ĐƠN ĐANG CHỜ THANH TOÁN (1 đơn - PENDING)

| # | Mã ĐH | Tên KH | Email | Số tiền (VND) | Ngày đặt |
|---|-------|--------|-------|--------------|---------|
| 1 | DH4745 | Nguyễn Hạnh | nguyenquochanh12061966@gmai.com | 3,550,000 | 24/01/2026 |

> **Lưu ý**: Đơn đã quá hạn (25/01/2026) nhưng vẫn ở trạng thái "pending" (chưa bị chuyển sang expired).
> Email có thể sai (.gmai.com thay vì .gmail.com).

---

## VI. PHÂN TÍCH LỖI QR CODE: DH4754 vs DH4757

### Diễn biến sự việc (theo thứ tự thời gian):

| Thời gian | Sự kiện |
|-----------|---------|
| 03/02 15:55 | **DH4754** được tạo cho thuycuonguyennhu@gmail.com - Mua crystal 1,990,000 VND - Mã QR: "DH4754" |
| 04/02 15:55 | **DH4754 HẾT HẠN** - Khách Thúy KHÔNG chuyển khoản |
| 05/02 03:51 | Hệ thống đánh dấu DH4754 = expired |
| 05/02 03:51 | **DH4757** được tạo cho nguyenthaots11@gmail.com - Mua khóa học 300,000 VND - Mã QR: "DH4757" |
| 05/02 03:55 | Casso nhận được **300,000 VND** với nội dung **"DH4754"** (SAI!) |
| 05/02 03:55 | Hệ thống ghi **"unknown_transaction"** vì DH4754 đã expired, không tìm thấy pending payment |
| 06/02 03:51 | DH4757 cũng HẾT HẠN (vì tiền vào với mã sai) |
| 12/02 17:08 | Admin xác nhận thủ công DH4757 = paid trên Shopify → access_unlocked |

### Phân tích lỗi (ĐÃ XÁC ĐỊNH ROOT CAUSE):

**Root cause: `get-order-number/index.ts` Strategy 3 trả về đơn SAI**

Chuỗi sự kiện:
1. DH4757 không có trong `pending_payments` (vì webhook skip hoặc payment type không tạo record)
2. Thank You page gọi `get-order-number` với Shopify OrderIdentity GID
3. Strategy 1 (by shopify_order_id) → KHÔNG TÌM THẤY
4. Strategy 2 (by total_amount) → KHÔNG KHỚP
5. Strategy 3 (most recent pending) → TRẢ VỀ DH4754! (đơn crystal 1,990,000 đang pending gần nhất)
6. Thank You page hiển thị QR code "DH4754" → khách chuyển khoản sai mã

**Đây KHÔNG phải lỗi cache frontend hay khách nhập sai** - đây là lỗi logic backend trả về sai order number.

**FIX ĐÃ ÁP DỤNG:**
- `get-order-number/index.ts`: Xóa Strategy 2+3 (Rule 10: fallback values that mask failures)
- `shopify-order-webhook/index.ts`: Tạo record cho TẤT CẢ orders → Strategy 1 sẽ luôn tìm thấy đúng order

**Hậu quả của bug:**
- Tiền 300,000 VND bị ghi "unknown_transaction" → Admin xác nhận thủ công 7 ngày sau

---

## VII. PENDING COURSE ACCESS - DANH SÁCH CHỜ UNLOCK

**Trạng thái: TẤT CẢ `applied = false` - Chưa ai được unlock**

### Chi tiết theo khách hàng:

#### 1. Thaodoan2806@gmail.com (3 khóa học - 2 đơn hàng riêng biệt)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| 7 Ngày Khai Mở Tần Số Gốc | #4755 (Credit Card) | 399,000 | Thêm thủ công |
| Tái Tạo Tư Duy Triệu Phú | #4749 (Credit Card) | 499,000 | Thêm thủ công |
| Kích Hoạt Tần Số Tình Yêu | #4749 (Credit Card) | 439,000 | Thêm thủ công |

#### 2. phuongguru@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | #4759 (Credit Card) | 439,000 | Thêm thủ công |

#### 3. tantien97ductri@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| GEM Trading - Gói Căn Bản | #4751 (Credit Card) | 208,000 | Thêm thủ công |

#### 4. tykul0692@yahoo.com.vn (1 khóa học - 2 bản ghi trùng lặp)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| GEM Trading - Gói Căn Bản | DH4761 (Chuyển khoản) | 299,000 | Webhook tự động |

#### 5. 24001612@hus.edu.vn (1 khóa học - 2 bản ghi trùng lặp)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4762 (Chuyển khoản) | 399,000 | Webhook tự động |

#### 6. nghh0406@gmail.com (1 khóa học - 3 bản ghi trùng lặp)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4763 (Chuyển khoản) | 399,000 | Webhook tự động |

#### 7. phuongtthienma@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4760 (Chuyển khoản) | 399,000 | Webhook tự động |

#### 8. nguyenthaots11@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4757 (Chuyển khoản) | 399,000 | Webhook tự động |

#### 9. namanle68@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| GEM Trading - Gói Căn Bản | DH4756 (Chuyển khoản) | 208,000 | Webhook tự động |

#### 10. lecaonguyen79nt@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4743 (Chuyển khoản) | 399,001 | Webhook tự động |

#### 11. thuhongbvdknamdinh@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Kích Hoạt Tần Số Tình Yêu | DH4750 (Chuyển khoản) | 438,900 | Webhook tự động |

#### 12. buiphuochiep03@gmail.com (1 khóa học)
| Khóa học | Đơn hàng gốc | Số tiền | Nguồn |
|----------|-------------|---------|-------|
| Tái Tạo Tư Duy Triệu Phú | DH4752 (Chuyển khoản) | 499,000 | Webhook tự động |

### Thống kê theo khóa học:
| Khóa học | Số lượt chờ unlock |
|----------|-------------------|
| Kích Hoạt Tần Số Tình Yêu | 8 lượt (8 khách) |
| GEM Trading - Gói Căn Bản | 3 lượt (3 khách) |
| Tái Tạo Tư Duy Triệu Phú | 2 lượt (2 khách) |
| 7 Ngày Khai Mở Tần Số Gốc | 1 lượt (1 khách) |

**Tất cả 12 khách hàng đều CHƯA tạo tài khoản trên app** (không có profile nào trong bảng `profiles`).
Khi họ tạo tài khoản với đúng email → hệ thống sẽ tự động unlock khóa học tương ứng.

---

## VIII. COURSE ENROLLMENTS

**BẢNG TRỐNG - 0 bản ghi**

Chưa có bất kỳ user nào được enroll vào khóa học, vì chưa ai tạo tài khoản trên app.

---

## IX. VẤN ĐỀ VÀ TRẠNG THÁI SỬA LỖI

### 1. ~~LỖI NGHIÊM TRỌNG: Đơn Credit Card không được xử lý~~ ✅ ĐÃ SỬA
- **Trạng thái**: ĐÃ SỬA (19/02/2026)
- **File sửa**: `supabase/functions/shopify-order-webhook/index.ts`
- **Thay đổi**: Bỏ filter `isBankTransfer`, xử lý TẤT CẢ payment types. Credit card orders tạo record `payment_status = 'paid'` ngay.
- **Database**: Thêm cột `payment_method`, insert 4 đơn credit card, liên kết `pending_course_access`
- **Cần deploy**: Edge function `shopify-order-webhook` cần được deploy lại trên Supabase

### 2. ~~LỖI QR CODE: DH4754 hiển thị cho khách DH4757~~ ✅ ĐÃ SỬA
- **Trạng thái**: ĐÃ SỬA (19/02/2026)
- **File sửa**: `supabase/functions/get-order-number/index.ts`
- **Thay đổi**: Xóa Strategy 2 (match by amount) + Strategy 3 (most recent pending). Chỉ giữ Strategy 1 (exact match by shopify_order_id).
- **Cần deploy**: Edge function `get-order-number` cần được deploy lại trên Supabase

### 3. Bản ghi trùng lặp trong pending_course_access ⚠️ CHƯA SỬA
- **Mức độ**: Thấp
- nghh0406@gmail.com: 3 bản ghi giống nhau (nên chỉ có 1)
- tykul0692@yahoo.com.vn: 2 bản ghi giống nhau
- 24001612@hus.edu.vn: 2 bản ghi giống nhau
- **Khuyến nghị**: Xóa bản ghi trùng, giữ 1 bản ghi duy nhất cho mỗi cặp email + course_id

### 4. Đơn DH4745 bị kẹt ở trạng thái "pending" ⚠️ CHƯA SỬA
- **Mức độ**: Thấp
- nguyenquochanh12061966@gmai.com (email có thể sai) - 3,550,000 VND
- Đã quá hạn từ 25/01/2026 nhưng chưa bị chuyển sang "expired"

---

## X. TỔNG KẾT

| Chỉ số | Giá trị |
|--------|---------|
| Tổng đơn thật | 19 |
| Đơn đã thanh toán (tổng) | **13 (68%)** |
| - Chuyển khoản ngân hàng | 9 đơn |
| - Credit Card (thẻ tín dụng) | 4 đơn |
| Doanh thu chuyển khoản (đã thu) | 3,187,901 VND |
| Doanh thu credit card (đã khôi phục trong DB) | 1,984,000 VND |
| **Tổng doanh thu thực tế** | **5,171,901 VND** |
| Đơn hết hạn/chưa TT | 6 (32%) |
| Khách đang chờ unlock | 12 người (14 lượt khóa học) |
| Khách đã được unlock | 0 người |
| Khóa học bán chạy nhất | Kích Hoạt Tần Số Tình Yêu (8 lượt) |

### Phương thức thanh toán:
- **Chuyển khoản ngân hàng**: 9/13 đơn (69%) - qua Vietcombank 1074286868 CT TNHH GEM CAPITAL HOLDING
- **Credit Card (thẻ tín dụng)**: 4/13 đơn (31%) - qua Shopify Payments

> **Lưu ý DH4746** (yinyangmasterscrystal@gmail.com - "Khánh Khánh" - 2,949,000 VND - PAID):
> Đơn này từ email nội bộ nhưng số tiền lớn. Nếu là đơn thật thì tổng doanh thu = ~7,681,901 VND.

---
*Báo cáo được tạo từ dữ liệu Supabase + thông tin bổ sung từ Shopify Admin ngày 19/02/2026*
