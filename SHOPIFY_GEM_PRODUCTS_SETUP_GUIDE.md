# Hướng Dẫn Tạo Gem Products Trên Shopify

## Mục Tiêu
Tạo 4 sản phẩm Gem packages trên Shopify store để user có thể mua gems qua checkout.

---

## PHẦN 1: TẠO SẢN PHẨM TRÊN SHOPIFY ADMIN

### Bước 1: Vào trang shopify admin tôi đang mở sẵn


### Bước 2: Vào trang Products
1. Ở sidebar bên trái, click vào **"Products"**
2. Click nút **"Add product"** ở góc trên bên phải

---

### Bước 3: Tạo Sản Phẩm 1 - Starter Pack (100 Gems)

**Điền thông tin như sau:**

| Field | Giá trị |
|-------|---------|
| **Title** | `Gem Pack - Starter (100 Gems)` |
| **Description** | `Gói khởi đầu 100 Gems. Sử dụng để gửi quà, boost bài viết và nhiều tính năng khác trong ứng dụng Gemral.` |

**Phần Media:**
- Có thể upload hình ảnh gem icon nếu có (không bắt buộc)

**Phần Pricing:**
| Field | Giá trị |
|-------|---------|
| **Price** | `22000` |
| **Compare at price** | Để trống |
| **Cost per item** | Để trống |
| **Charge tax on this product** | Bỏ tick (uncheck) |

**Phần Inventory:**
| Field | Giá trị |
|-------|---------|
| **SKU** | `gem-pack-100` |
| **Barcode** | Để trống |
| **Track quantity** | Bỏ tick (uncheck) - QUAN TRỌNG |
| **Continue selling when out of stock** | Tick (check) |

**Phần Shipping:**
| Field | Giá trị |
|-------|---------|
| **This is a physical product** | Bỏ tick (uncheck) - Đây là sản phẩm digital |

**Phần Product organization:**
| Field | Giá trị |
|-------|---------|
| **Product type** | `Digital` |
| **Vendor** | `Gemral` |
| **Collections** | Để trống hoặc tạo collection "Gems" |
| **Tags** | `gems, virtual-currency, in-app` |

**Phần Product status:**
| Field | Giá trị |
|-------|---------|
| **Status** | `Active` |

4. Click **"Save"** ở góc trên bên phải
5. **SAU KHI SAVE**: Ghi lại **Variant ID** từ URL hoặc từ trang chi tiết sản phẩm
   - URL sẽ có dạng: `https://admin.shopify.com/store/xxx/products/123456789`
   - Số `123456789` là Product ID
   - Click vào tab "Variants" để xem Variant ID

---

### Bước 4: Tạo Sản Phẩm 2 - Popular Pack (500 + 50 Bonus Gems)

1. Quay lại trang Products, click **"Add product"**

**Điền thông tin như sau:**

| Field | Giá trị |
|-------|---------|
| **Title** | `Gem Pack - Popular (500 + 50 Bonus Gems)` |
| **Description** | `Gói phổ biến nhất! 500 Gems + BONUS 50 Gems. Tổng cộng 550 Gems với giá ưu đãi. Sử dụng để gửi quà, boost bài viết và nhiều tính năng khác.` |

**Phần Pricing:**
| Field | Giá trị |
|-------|---------|
| **Price** | `99000` |
| **Charge tax on this product** | Bỏ tick (uncheck) |

**Phần Inventory:**
| Field | Giá trị |
|-------|---------|
| **SKU** | `gem-pack-500` |
| **Track quantity** | Bỏ tick (uncheck) |
| **Continue selling when out of stock** | Tick (check) |

**Phần Shipping:**
| Field | Giá trị |
|-------|---------|
| **This is a physical product** | Bỏ tick (uncheck) |

**Phần Product organization:**
| Field | Giá trị |
|-------|---------|
| **Product type** | `Digital` |
| **Vendor** | `Gemral` |
| **Tags** | `gems, virtual-currency, in-app, bestseller` |

**Phần Product status:**
| Field | Giá trị |
|-------|---------|
| **Status** | `Active` |

2. Click **"Save"**
3. Ghi lại **Product ID** và **Variant ID**

---

### Bước 5: Tạo Sản Phẩm 3 - Pro Pack (1000 + 150 Bonus Gems)

1. Quay lại trang Products, click **"Add product"**

**Điền thông tin như sau:**

| Field | Giá trị |
|-------|---------|
| **Title** | `Gem Pack - Pro (1000 + 150 Bonus Gems)` |
| **Description** | `Gói Pro cho người dùng thường xuyên! 1000 Gems + BONUS 150 Gems. Tổng cộng 1150 Gems. Tiết kiệm hơn khi mua gói lớn!` |

**Phần Pricing:**
| Field | Giá trị |
|-------|---------|
| **Price** | `189000` |
| **Charge tax on this product** | Bỏ tick (uncheck) |

**Phần Inventory:**
| Field | Giá trị |
|-------|---------|
| **SKU** | `gem-pack-1000` |
| **Track quantity** | Bỏ tick (uncheck) |
| **Continue selling when out of stock** | Tick (check) |

**Phần Shipping:**
| Field | Giá trị |
|-------|---------|
| **This is a physical product** | Bỏ tick (uncheck) |

**Phần Product organization:**
| Field | Giá trị |
|-------|---------|
| **Product type** | `Digital` |
| **Vendor** | `Gemral` |
| **Tags** | `gems, virtual-currency, in-app` |

**Phần Product status:**
| Field | Giá trị |
|-------|---------|
| **Status** | `Active` |

2. Click **"Save"**
3. Ghi lại **Product ID** và **Variant ID**

---

### Bước 6: Tạo Sản Phẩm 4 - VIP Pack (5000 + 1000 Bonus Gems)

1. Quay lại trang Products, click **"Add product"**

**Điền thông tin như sau:**

| Field | Giá trị |
|-------|---------|
| **Title** | `Gem Pack - VIP (5000 + 1000 Bonus Gems)` |
| **Description** | `Gói VIP cao cấp nhất! 5000 Gems + BONUS 1000 Gems. Tổng cộng 6000 Gems. Giá trị tốt nhất cho người dùng VIP!` |

**Phần Pricing:**
| Field | Giá trị |
|-------|---------|
| **Price** | `890000` |
| **Charge tax on this product** | Bỏ tick (uncheck) |

**Phần Inventory:**
| Field | Giá trị |
|-------|---------|
| **SKU** | `gem-pack-5000` |
| **Track quantity** | Bỏ tick (uncheck) |
| **Continue selling when out of stock** | Tick (check) |

**Phần Shipping:**
| Field | Giá trị |
|-------|---------|
| **This is a physical product** | Bỏ tick (uncheck) |

**Phần Product organization:**
| Field | Giá trị |
|-------|---------|
| **Product type** | `Digital` |
| **Vendor** | `Gemral` |
| **Tags** | `gems, virtual-currency, in-app, premium` |

**Phần Product status:**
| Field | Giá trị |
|-------|---------|
| **Status** | `Active` |

2. Click **"Save"**
3. Ghi lại **Product ID** và **Variant ID**

---

### Bước 7: Lấy Variant IDs

Sau khi tạo xong 4 sản phẩm, cần lấy Variant ID của mỗi sản phẩm:

**Cách 1: Qua GraphQL Admin API** (Khuyến nghị)
1. Vào Shopify Admin > Settings > Apps and sales channels
2. Click "Develop apps" > Tạo app hoặc dùng app có sẵn
3. Dùng GraphQL để query:
```graphql
{
  products(first: 10, query: "tag:gems") {
    edges {
      node {
        id
        title
        variants(first: 1) {
          edges {
            node {
              id
              sku
            }
          }
        }
      }
    }
  }
}
```

**Cách 2: Qua URL**
1. Vào từng sản phẩm đã tạo
2. Xem URL, sẽ có dạng: `https://admin.shopify.com/store/xxx/products/PRODUCT_ID`
3. Click vào phần Variants (nếu có) để xem Variant ID
4. Hoặc dùng Shopify API endpoint: `GET /admin/api/2024-01/products/{product_id}/variants.json`

**Cách 3: Export Products**
1. Vào Products > Export
2. Chọn "Selected products" > chọn 4 gem products
3. Export CSV
4. Mở CSV, cột "Variant ID" sẽ có ID cần lấy

---

## PHẦN 2: CẬP NHẬT DATABASE SUPABASE


### Bước 1: Cập nhật Variant IDs
Sau khi có Variant IDs từ Shopify, chạy SQL sau (thay XXX bằng ID thực):

```sql
-- Cập nhật Variant IDs cho các gem packages
-- THAY THẾ các giá trị gid://shopify/ProductVariant/XXX bằng ID thực từ Shopify

UPDATE currency_packages
SET
  shopify_variant_id = 'gid://shopify/ProductVariant/VARIANT_ID_100',
  shopify_product_id = 'gid://shopify/Product/PRODUCT_ID_100'
WHERE gem_amount = 100;

UPDATE currency_packages
SET
  shopify_variant_id = 'gid://shopify/ProductVariant/VARIANT_ID_500',
  shopify_product_id = 'gid://shopify/Product/PRODUCT_ID_500'
WHERE gem_amount = 500;

UPDATE currency_packages
SET
  shopify_variant_id = 'gid://shopify/ProductVariant/VARIANT_ID_1000',
  shopify_product_id = 'gid://shopify/Product/PRODUCT_ID_1000'
WHERE gem_amount = 1000;

UPDATE currency_packages
SET
  shopify_variant_id = 'gid://shopify/ProductVariant/VARIANT_ID_5000',
  shopify_product_id = 'gid://shopify/Product/PRODUCT_ID_5000'
WHERE gem_amount = 5000;
```

### Bước 2: Verify Data
Chạy query để kiểm tra:
```sql
SELECT id, name, gem_amount, bonus_gems, price_vnd, sku, shopify_variant_id, shopify_product_id
FROM currency_packages
ORDER BY gem_amount;
```

---

## PHẦN 3: DEPLOY WEBHOOK LÊN SUPABASE

**Bước 1: Mở Edge Functions**
1. Vào Supabase Dashboard: `https://supabase.com/dashboard`
2. Chọn project `pgfkbcnzqozzkohwbgbk`
3. Ở sidebar, click **"Edge Functions"**

**Bước 2: Update Function**
1. Tìm function **"shopify-webhook"**
2. Click vào function đó
3. Click **"Edit"** hoặc **"Deploy new version"**
4. Copy nội dung file đính kèm tên `index.ts`
5. Paste vào editor
6. Click **"Deploy"**

---

## PHẦN 4: VERIFY TOÀN BỘ

### Checklist Final

- [ ] 4 Gem products đã được tạo trên Shopify với đúng SKU
- [ ] Migration SQL đã chạy thành công trên Supabase
- [ ] currency_packages table đã có shopify_variant_id
- [ ] shopify-webhook function đã deploy thành công


---

## Thông Tin Quan Trọng

### SKU Format
- `gem-pack-100` → 100 gems
- `gem-pack-500` → 500 gems + 50 bonus
- `gem-pack-1000` → 1000 gems + 150 bonus
- `gem-pack-5000` → 5000 gems + 1000 bonus

### Variant ID Format
Shopify GraphQL format: `gid://shopify/ProductVariant/123456789`

### Webhook URL
`https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`

### Tables Affected
- `profiles` - cột `gems`
- `currency_packages` - cột `shopify_variant_id`, `shopify_product_id`, `sku`
- `gems_transactions` - log các giao dịch
- `pending_gem_purchases` - lưu gems cho user chưa signup
