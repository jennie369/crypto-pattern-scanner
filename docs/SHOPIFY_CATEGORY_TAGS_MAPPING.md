# SHOPIFY CATEGORY TAGS MAPPING

> File này liệt kê các tags cần gắn cho sản phẩm trên Shopify để hiển thị đúng theo danh mục trong app.
> **QUAN TRỌNG**: Tags phải khớp CHÍNH XÁC (case-sensitive)

---

## DANH MỤC CHÍNH (AllCategoriesScreen)

### 1. Đá Quý Phong Thủy (crystals)
Sản phẩm đá quý, tinh thể cần có **MỘT TRONG CÁC** tags sau:

```
Thạch Anh Tím
Thạch Anh Hồng
Thạch Anh Trắng
Thạch Anh Vàng
Thạch Anh Xanh
Khói Xám
Hematite
Aura
Aquamarine
Huyền Kim Trụ
Cụm
Trụ
viên
Vòng Tay
Set
Special set
Cây Tài Lộc
crystals
```

---

### 2. Khóa Học (courses)
Các khóa học và ebook cần có **MỘT TRONG CÁC** tags sau:

```
Khóa học Trading
Khóa học
khoa-hoc
trading-course
tan-so-goc
tier-starter
Tier 1
Tier 2
Tier 3
khai-mo
gem-academy
Gem Trading
Ebook
digital
course
7-ngay
```

---

### 3. Gói VIP & Premium (subscriptions)
Các gói subscription/premium cần có **MỘT TRONG CÁC** tags sau:

```
GEM Chatbot
Scanner
subscription
premium
vip
GemMaster Pro
Scanner VIP
```

---

### 4. Phụ Kiện (merchandise)
Phụ kiện phong thủy cần có **MỘT TRONG CÁC** tags sau:

```
Vòng Tay
Dây Chuyền
Nhẫn
Phụ Kiện
merchandise
accessory
jewelry
```

---

### 5. Gems Token (gems)
Gói Gems token cần có **MỘT TRONG CÁC** tags sau:

```
Gem Pack
virtual-currency
in-app
gems
token
```

---

### 6. Thiền & Yoga (meditation)
Sản phẩm thiền, yoga cần có **MỘT TRONG CÁC** tags sau:

```
Thiền
Yoga
Meditation
Nến Thơm
Tinh Dầu
Đệm Thiền
Tinh dầu nước hoa Jérie
wellness
```

---

### 7. Trading Tools (trading-tools)
Công cụ trading cần có **MỘT TRONG CÁC** tags sau:

```
Scanner
Trading
Trading Tool
GEM Scanner
Khóa học Trading
```

---

## SHOP TABS (ShopScreen - Horizontal Tabs)

### Tab: Crystals & Spiritual
```
Thạch Anh Tím, Thạch Anh Hồng, Thạch Anh Trắng, Thạch Anh Vàng, Thạch Anh Xanh, Khói Xám, Hematite, Aura, Aquamarine, Huyền Kim Trụ, Cụm, Trụ, viên, Vòng Tay, Set, Special set, Cây Tài Lộc, Hot Product, Bestseller, Tinh dầu nước hoa Jérie, crystals
```

### Tab: Khóa học
```
Khóa học Trading, Khóa học, khoa-hoc, trading-course, tan-so-goc, tier-starter, Tier 1, Tier 2, Tier 3, khai-mo, gem-academy, Gem Trading, Ebook, digital, course, 7-ngay
```

### Tab: GemMaster
```
GEM Chatbot
```

### Tab: Scanner
```
Scanner
```

### Tab: Gem Pack
```
Gem Pack, virtual-currency, in-app, gems
```

---

## SECTIONS (Các phần trên trang "Tất cả")

### Section: Đang Thịnh Hành
```
Bestseller, Hot Product, Trụ, Thạch Anh Vàng, Thạch Anh Tím, Special set, Set, Huyền Kim Trụ, Cụm, Cây Tài Lộc, Thạch Anh Trắng, Thạch Anh Hồng
```

### Section: Manifest Tiền Bạc
```
Thạch Anh Vàng, Cây Tài Lộc
```

### Section: Manifest Tình Yêu
```
Thạch Anh Hồng, Aura
```

### Section: Manifest Thịnh Vượng
```
Cây Tài Lộc, Thạch Anh Tím, Thạch Anh Trắng, Special set, Bestseller
```

### Section: Trang Sức Phong Thủy
```
Vòng Tay
```

---

## TRẠNG THÁI: ĐÃ FIX

### Vấn đề ban đầu:
- **AllCategoriesScreen** navigate với `collection: 'crystals'`
- **CategoryGrid** navigate với `collection: 'crystals'`
- **ProductListScreen** expect `tags: ['Thạch Anh Tím', ...]`
- Không có mapping giữa `collection` handle và `tags`

### Đã sửa (25/12/2024):
1. **AllCategoriesScreen.js** - Thay `collection` bằng `tags` array cho mỗi category
2. **CategoryGrid.js** - Thay `collection` bằng `tags` array cho mỗi category

Cả 2 component giờ đều navigate với:
```javascript
navigation.navigate('ProductList', {
  tags: category.tags,  // Mảng tags khớp với Shopify
  title: category.name,
});
```

---

## DANH SÁCH SẢN PHẨM CẦN GẮN TAG

| Loại sản phẩm | Tags bắt buộc | Tags bổ sung (nếu phù hợp) |
|---------------|---------------|----------------------------|
| Đá thạch anh tím | `Thạch Anh Tím`, `crystals` | `Bestseller`, `Hot Product` |
| Đá thạch anh hồng | `Thạch Anh Hồng`, `crystals` | `Bestseller`, `Hot Product` |
| Cụm đá | `Cụm`, `crystals` | Tên loại đá (VD: `Thạch Anh Tím`) |
| Trụ đá | `Trụ`, `crystals` | Tên loại đá |
| Vòng tay | `Vòng Tay`, `merchandise` | Tên loại đá, `Phụ Kiện` |
| Cây tài lộc | `Cây Tài Lộc`, `crystals` | `Bestseller` |
| Khóa học trading | `Khóa học Trading`, `course` | `Tier 1/2/3`, `digital` |
| Ebook | `Ebook`, `digital`, `course` | `Khóa học` |
| GEM Chatbot subscription | `GEM Chatbot`, `subscription` | `premium`, `digital` |
| Scanner subscription | `Scanner`, `subscription` | `premium`, `digital` |
| Bộ bài Tarot | `Tarot`, `Tarot Cards` | `merchandise` |
| Tinh dầu | `Tinh dầu nước hoa Jérie`, `Thiền` | `wellness` |
| Gift set | `Special set`, `Quà Tặng` | `Gift` |

---

## LƯU Ý QUAN TRỌNG

1. **Case-sensitive**: `Thạch Anh Tím` ≠ `thạch anh tím`
2. **Dấu cách**: `Hot Product` ≠ `HotProduct`
3. **Tiếng Việt**: Giữ nguyên dấu tiếng Việt
4. **Multiple tags**: Một sản phẩm có thể có nhiều tags (VD: một trụ thạch anh tím có thể có cả `Trụ`, `Thạch Anh Tím`, `crystals`, `Bestseller`)
