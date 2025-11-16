# 📝 Hướng dẫn Update Thông tin Người dùng (Contact Info)

## 🎯 Tổng quan
Tính năng cho phép người dùng cập nhật **số điện thoại** và **địa chỉ giao hàng** qua custom tab trong Clerk UserProfile.

---

## 🔄 Upgrade Clerk v4 → v6

### ❓ Lý do nâng cấp
- **Clerk v4** không hỗ trợ API `<UserProfile.Page>` để tạo custom tabs
- **Clerk v6** cung cấp `UserProfile.Page` component cho phép thêm tab tùy chỉnh
- Cần custom tabs để quản lý thông tin liên hệ riêng biệt với Account/Security

### 📦 Các bước nâng cấp
1. **Cài đặt phiên bản mới:**
   ```bash
   cd client
   npm install @clerk/nextjs@6.35.1
   ```

2. **Breaking changes - Cập nhật Middleware:**
   - **Cũ (v4):** Dùng `authMiddleware` 
   - **Mới (v6):** Dùng `clerkMiddleware` + `createRouteMatcher`
   
   **File:** `client/middleware.ts`
   ```typescript
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

   const isPublicRoute = createRouteMatcher([
     "/", "/products(.*)", "/cart", "/sign-in(.*)", "/sign-up(.*)"
   ]);

   export default clerkMiddleware(async (auth, request) => {
     if (!isPublicRoute(request)) {
       await auth.protect(); // Bắt buộc đăng nhập nếu không phải public route
     }
   });
   ```

---

## 🗂️ Database Schema Update

### 📊 Thêm cột mới vào bảng `up_users`
**File:** `server/src/extensions/users-permissions/content-types/user/schema.json`

```json
{
  "attributes": {
    "clerk_user_id": { "type": "string" },
    "phone": { "type": "string", "maxLength": 20 },
    "address": { "type": "text" }
  }
}
```

### 🔧 Chạy migration trực tiếp:
```bash
docker exec -i jewelry-postgres psql -U strapi -d strapi <<EOF
ALTER TABLE up_users 
  ADD COLUMN clerk_user_id TEXT,
  ADD COLUMN phone VARCHAR(20),
  ADD COLUMN address TEXT;
EOF
```

---

## 🌐 Backend API (Strapi)

### 🎯 Sync-Clerk Controller
**File:** `server/src/api/sync-clerk/controllers/sync-clerk.js`

**Chức năng:**
- Đồng bộ user từ Clerk vào Strapi database
- Load thông tin phone/address hiện có
- Cập nhật chỉ khi có dữ liệu mới (không ghi đè null)

**Key Logic:**
```javascript
// Tìm user theo clerk_user_id hoặc email
let existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
  where: { clerk_user_id: data.clerkUserID }
});

// ✅ Chỉ update phone/address khi có data mới
if (data.phone !== undefined && data.phone !== null) {
  userData.phone = data.phone;
}
if (data.address !== undefined && data.address !== null) {
  userData.address = data.address;
}
```

**Endpoint:** `POST /api/sync-clerk`  
**Body:**
```json
{
  "clerkUserID": "user_xxx",
  "email": "user@example.com",
  "username": "john_doe",
  "phone": "0912345678",     // Optional
  "address": "123 Main St"   // Optional
}
```

---

## 🎨 Frontend Implementation

### 📂 Custom Tab Page
**File:** `client/app/manager-info/[[...userProfile]]/page.jsx`

### 🔑 Key Components:

#### 1️⃣ **ContactForm Component (Memoized)**
```javascript
const ContactForm = memo(function ContactForm({ user }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const hasLoadedRef = useRef(false); // ✅ Ngăn load data nhiều lần
  
  // Auto-load data khi mount (chỉ 1 lần)
  useEffect(() => {
    if (!user || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchData(); // Gọi API sync-clerk để lấy phone/address
  }, [user]);
});
```

**Giải thích:**
- `memo()`: Tránh re-render không cần thiết
- `useRef`: Đảm bảo chỉ load data 1 lần khi component mount
- `hasLoadedRef.current`: Guard flag để ngăn duplicate API calls

#### 2️⃣ **Validation Logic**
```javascript
// Phone: Chỉ cho phép 10 số, tự động xóa ký tự không phải số
onChange={(e) => {
  const val = e.target.value.replace(/[^0-9]/g, "");
  if (val.length <= 10) setPhone(val);
}}

// Submit validation
if (!/^[0-9]{10}$/.test(phone)) return alert("❌ Phone must be 10 digits!");
if (!address.trim()) return alert("❌ Address required!");
```

#### 3️⃣ **UserProfile.Page Setup**
```javascript
<UserProfile path="/manager-info" routing="path">
  <UserProfile.Page 
    label="Contact" 
    url="contact" 
    labelIcon="📞"  // ✅ Dùng emoji string (không dùng JSX icon)
  >
    <ContactForm user={user} />
  </UserProfile.Page>
  
  <UserProfile.Page label="Order History" url="orders" labelIcon="🛒">
    {/* Nội dung sẽ implement sau */}
  </UserProfile.Page>
</UserProfile>
```

**⚠️ Lưu ý quan trọng:**
- `labelIcon` phải là **string** (emoji/text), không dùng React component
- Props bắt buộc: `label`, `url`, `labelIcon`
- `url` phải unique cho mỗi tab

---

## 🚀 Testing Checklist

### ✅ Test Cases:
1. **Load Data:**
   - Mở tab Contact → Kiểm tra phone/address hiện đúng từ DB
   - Console log: `✅ Loaded user data`

2. **Input Focus:**
   - Nhập liên tục 10 số vào phone field
   - Không bị mất focus giữa chừng ✅

3. **Phone Validation:**
   - Nhập chữ → Tự động xóa
   - Nhập > 10 số → Chặn không cho nhập thêm
   - Submit với 9 số → Báo lỗi "must be 10 digits"

4. **Address Validation:**
   - Để trống → Báo lỗi khi submit

5. **Save Data:**
   - Click "💾 Save Changes"
   - Alert thành công
   - Refresh page → Data vẫn còn

6. **Database Verify:**
   ```bash
   docker exec -i jewelry-postgres psql -U strapi -d strapi -c \
     "SELECT phone, address FROM up_users WHERE clerk_user_id='user_xxx';"
   ```

---

## 🐛 Common Issues & Solutions

### ❌ Issue: "Clerk: Missing props"
**Nguyên nhân:** `UserProfile.Page` thiếu props hoặc labelIcon dùng JSX component  
**Giải pháp:** Dùng emoji string `labelIcon="📞"` thay vì `<Icon />`

### ❌ Issue: Input mất focus khi gõ
**Nguyên nhân:** Component re-render mỗi lần state thay đổi  
**Giải pháp:** Dùng `memo()` + `useRef` để ngăn re-render

### ❌ Issue: Data không load từ Strapi
**Nguyên nhân:** useEffect gọi nhiều lần  
**Giải pháp:** Dùng `hasLoadedRef.current` flag

### ❌ Issue: Phone/address bị ghi đè null
**Nguyên nhân:** Controller update field ngay cả khi không có data  
**Giải pháp:** Check `!== undefined && !== null` trước khi update

---

## 📁 Files Changed Summary

| File | Thay đổi |
|------|---------|
| `client/middleware.ts` | Upgrade từ `authMiddleware` → `clerkMiddleware` (Clerk v6 API) |
| `client/package.json` | Upgrade `@clerk/nextjs` từ 4.29.9 → 6.35.1 |
| `client/app/manager-info/[[...userProfile]]/page.jsx` | **NEW** - Custom Contact Info tab với validation |
| `server/src/extensions/.../user/schema.json` | Thêm fields: `clerk_user_id`, `phone`, `address` |
| `server/src/api/sync-clerk/controllers/sync-clerk.js` | Enhanced logic để preserve existing phone/address |
| Database `up_users` | Thêm 3 cột mới: `clerk_user_id`, `phone`, `address` |

---

## 📞 URLs & Routes

- **UserProfile Page:** `http://localhost:3000/manager-info`
- **Contact Tab:** `http://localhost:3000/manager-info/contact`
- **Order History Tab:** `http://localhost:3000/manager-info/orders` *(chưa implement)*
- **Strapi API:** `http://localhost:1337/api/sync-clerk`

---

## 🎓 Kiến thức cần biết để maintain

1. **Clerk v6 API patterns:**
   - `useUser()` hook để lấy thông tin user
   - `UserProfile.Page` để tạo custom tabs
   - `clerkMiddleware` + `createRouteMatcher` để bảo vệ routes

2. **React Performance:**
   - `memo()` để tránh re-render
   - `useRef` để lưu giá trị không trigger re-render
   - Guard flags (`hasLoadedRef`) để chặn duplicate API calls

3. **Strapi Database:**
   - Schema JSON để định nghĩa fields
   - Query API: `strapi.db.query('plugin::users-permissions.user')`
   - Update logic: Check existing values trước khi ghi đè

---

## 🔮 Next Steps (Cho đồng đội)

1. ⏳ **Configure Strapi Admin UI:**
   - Vào `http://localhost:1337/admin`
   - Content Manager → User → Settings → View
   - Thêm `phone` và `address` vào "Fields to display"

2. 🛒 **Implement Order History Tab:**
   - File: `client/app/manager-info/[[...userProfile]]/page.jsx`
   - Vị trí: Bên trong `<UserProfile.Page label="Order History" url="orders">`
   - Logic: Fetch orders từ Strapi theo `clerk_user_id`

---

**📅 Last Updated:** Nov 14, 2025  
**👨‍💻 Implemented by:** Tham  
**✅ Status:** Production Ready
