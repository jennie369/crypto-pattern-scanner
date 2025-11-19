# 🔧 Fix: Edge Function Đang Require JWT Authentication

## ❌ Vấn Đề:

Khi test endpoint:
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

Bạn thấy:
```json
{"code":401,"message":"Missing authorization header"}
```

Thay vì:
```json
{"error":"Unauthorized"}
```

**Nguyên nhân:** Edge Function đang require JWT authentication → Shopify webhooks bị block → Không có logs!

---

## ✅ GIẢI PHÁP NHANH (2 PHÚT)

### Cách 1: Disable JWT Qua Dashboard (KHUYÊN DÙNG)

1. Bạn đang ở Supabase Dashboard, function `shopify-webhook`

2. Click tab **"Settings"** hoặc **"Details"** (bên cạnh Logs/Code)

3. Tìm section **"JWT Verification"** hoặc **"Authentication"**

4. Tìm toggle/checkbox:
   - **"Verify JWT"**
   - **"Require authentication"**
   - **"Enable JWT verification"**

5. **DISABLE/TẮT** option này

6. Click **"Save"** hoặc **"Update"**

7. Function sẽ tự restart (đợi 10-30 giây)

---

### Cách 2: Nếu Không Tìm Thấy Settings Tab

**Trong function editor:**

1. Vào tab **"Code"**

2. Tìm phần **function configuration** (thường ở đầu page hoặc sidebar)

3. Tìm **"Authorization"** setting

4. Chọn: **"None"** hoặc **"Disable"**

5. Click **"Save"**

---

### Cách 3: Re-deploy Với Config File

File `config.yaml` đã được tạo tại:
```
supabase/functions/shopify-webhook/config.yaml
```

**Nội dung:**
```yaml
verify_jwt: false
```

**Nếu bạn có Supabase CLI:**
```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
supabase functions deploy shopify-webhook --no-verify-jwt
```

**Nếu deploy qua Dashboard:**
- Khi paste code vào editor, đảm bảo folder structure:
  ```
  shopify-webhook/
    ├── index.ts    (code của function)
    └── config.yaml (config file)
  ```

---

## 🧪 VERIFY FIX ĐÃ HOẠT ĐỘNG:

### Test 1: Check Endpoint
Mở browser, vào:
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

**PHẢI thấy:**
```json
{"error":"Unauthorized"}
```

✅ **ĐÚNG RỒI!** Webhook đang chờ HMAC signature từ Shopify.

**KHÔNG còn:**
```json
{"code":401,"message":"Missing authorization header"}
```

---

### Test 2: Tạo Order Trên Shopify

1. Vào store: https://yinyangmasters.com
2. Thêm product vào cart
3. Checkout (chọn Bank Transfer - không cần thanh toán)
4. Complete order

---

### Test 3: Check Logs

**Đường dẫn:**
- **URL trực tiếp:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs
- Hoặc: Supabase Dashboard → Edge Functions → shopify-webhook → Tab "Logs"

**Click "Refresh"** để xem logs mới nhất

**Bây giờ PHẢI thấy logs:**
```
✅ HMAC verified successfully
📧 Order from: customer@email.com
💰 Financial status: pending
⏳ Order not paid yet (status: pending)
⏳ Skipping tier update. Will process when marked as paid.
```

**Nếu order đã thanh toán:**
```
✅ HMAC verified successfully
📧 Order from: customer@email.com
💰 Financial status: paid
✅ Order is paid. Processing tier upgrade...
💎 Product: scanner, Tier: pro
✅ User scanner_tier updated: pro
```

---

## 🔍 Debugging

### Vẫn không có logs?

**Check 1: Webhook URL đúng chưa?**
- Shopify Admin → Settings → Notifications → Webhooks
- URL phải là: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`

**Check 2: Webhook secret đúng chưa?**
- Secret phải là: `c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd`

**Check 3: Function đã deploy code mới chưa?**
- Tab "Code" → Xem có đoạn check `financial_status` không (lines 68-103)

**Check 4: Thử gửi test từ Shopify**
- Shopify Webhooks → Click "Send test notification"
- Check logs ngay sau khi gửi

---

## 📝 Tóm Tắt

**Trước khi fix:**
```
Shopify webhook → Supabase auth middleware → ❌ Blocked (No JWT)
```

**Sau khi fix:**
```
Shopify webhook → Function code → ✅ HMAC verification → Process order
```

---

## ✅ Checklist

- [ ] Disable JWT verification trong function settings
- [ ] Test endpoint thấy: `{"error":"Unauthorized"}`
- [ ] Tạo test order trên Shopify
- [ ] Thấy logs xuất hiện trong Supabase
- [ ] Verify payment flow: pending → skip, paid → update tier

---

**Nếu vẫn gặp vấn đề, chụp screenshot phần Settings của function và gửi lại!** 📸
