# 🛠️ Hướng Dẫn Cài Đặt Supabase CLI (Windows)

## Phương Pháp 1: Sử Dụng Scoop (Khuyên Dùng)

### Bước 1: Cài Đặt Scoop
Mở **PowerShell** (chạy với quyền thường, KHÔNG cần Admin) và chạy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Bước 2: Thêm Supabase Bucket
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
```

### Bước 3: Cài Supabase CLI
```powershell
scoop install supabase
```

### Bước 4: Verify
```powershell
supabase --version
```

Nếu thấy version (ví dụ: `1.123.4`), bạn đã cài thành công! ✅

---

## Phương Pháp 2: Download Binary Trực Tiếp

### Bước 1: Download
Vào: https://github.com/supabase/cli/releases/latest

Tìm và download file:
- `supabase_windows_amd64.zip` (cho Windows 64-bit)

### Bước 2: Giải Nén
- Giải nén file ZIP
- Rename file `supabase_windows_amd64.exe` thành `supabase.exe`

### Bước 3: Thêm Vào PATH
1. Copy file `supabase.exe` vào: `C:\Program Files\Supabase\`
2. Thêm `C:\Program Files\Supabase\` vào PATH environment variable:
   - Windows + R → `sysdm.cpl` → Advanced → Environment Variables
   - Tìm `Path` trong System variables → Edit
   - Click New → Thêm `C:\Program Files\Supabase\`
   - OK → OK

### Bước 4: Restart Terminal & Verify
```bash
supabase --version
```

---

## Sau Khi Cài Xong

### 1. Login Supabase
```bash
supabase login
```
Browser sẽ mở và bạn đăng nhập vào Supabase.

### 2. Chạy Deploy Script
Double-click file:
```
deploy-shopify-webhook.bat
```

Script sẽ tự động:
- ✅ Link project
- ✅ Set secrets
- ✅ Deploy Edge Function
- ✅ Test endpoint

---

## Troubleshooting

### Lỗi: "scoop: command not found"
→ Restart PowerShell và thử lại

### Lỗi: "supabase: command not found" (sau khi cài)
→ Restart terminal (hoặc restart máy)

### Lỗi: "Access token expired"
→ Chạy `supabase login` lại

---

## Next Steps

Sau khi deploy Edge Function thành công:
1. ✅ Webhook URL sẽ là: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`
2. ✅ Webhook đã được configure trong Shopify
3. ✅ Sửa SKU của 3 products (Chatbot PRO, Scanner VIP, Scanner PREMIUM)
4. ✅ Test bằng cách mua hàng thử!

---

**Có câu hỏi?** Hỏi trong group support! 💬
