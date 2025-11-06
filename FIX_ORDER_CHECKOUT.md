# 🔧 FIX: Lỗi Order Checkout - 400 Bad Request

## ❌ Vấn đề
Khi bấm thanh toán (Payment), server trả về lỗi **400 Bad Request**:
```
jewelry-ecommerce-l2ju.onrender.com/api/orders:1  Failed to load resource: the server responded with a status of 400 ()
Error creating order: {data: {data: null, error: {...}}, status: 400}
```

## 🔍 Nguyên nhân
1. **Controller yêu cầu `clerkUserId`** (bắt buộc):
   ```javascript
   // server/src/api/order/controllers/order.js
   if (!clerkUserId) {
     return ctx.badRequest('clerkUserId is required');
   }
   ```

2. **Schema KHÔNG CÓ field `clerkUserId`**:
   ```json
   // server/src/api/order/content-types/order/schema.json
   "attributes": {
     "email": {...},
     "Username": {...},
     // ❌ THIẾU: "clerkUserId"
   }
   ```

3. **Client gửi `clerkUserId` nhưng Strapi từ chối vì field không tồn tại trong schema**

## ✅ Giải pháp đã áp dụng

### 1. ✅ Thêm `clerkUserId` vào Order Schema
```json
// server/src/api/order/content-types/order/schema.json
"attributes": {
  "clerkUserId": {
    "type": "string",
    "required": true
  },
  "email": {
    "type": "email"
  },
  // ... các fields khác
}
```

### 2. ✅ Client đã gửi `clerkUserId`
```javascript
// client/app/checkout/_components/CheckoutForm.js
await createOrder({
  data: {
    clerkUserId: user.id, // ✅ Đã có
    email: user.primaryEmailAddress?.emailAddress,
    Username: user.fullName,
    amount: Number(amount),
    products: orderItems.map(item => item.productId).filter(Boolean), 
    order_items: orderItems.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price_at_time: item.price,
    })),
  }
})
```

## 🚀 Các bước để FIX (QUAN TRỌNG!)

### Bước 1: Restart Strapi Server (BẮT BUỘC!)
Schema đã được cập nhật, cần restart để Strapi load schema mới:

#### Nếu chạy local:
```powershell
# Trong terminal đang chạy Strapi server, nhấn Ctrl+C để dừng
# Sau đó chạy lại:
cd server
npm run develop
```

#### Nếu deploy trên Render:
1. Vào dashboard Render: https://dashboard.render.com/
2. Chọn service `jewelry-ecommerce-l2ju`
3. Bấm **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Hoặc đơn giản push code lên Git, Render sẽ tự động deploy

### Bước 2: Kiểm tra Strapi Admin Panel
1. Vào Strapi Admin: http://localhost:1337/admin (hoặc URL Render của bạn)
2. Settings → Content-Types Builder → Order
3. Kiểm tra xem field `clerkUserId` đã xuất hiện chưa
4. Nếu chưa có, click "Add another field" → Text → Đặt tên `clerkUserId` → Save → Restart server

### Bước 3: Test Checkout Flow
1. Làm mới trang Next.js client (F5)
2. Thêm sản phẩm vào giỏ hàng
3. Checkout và nhập thông tin thẻ test:
   - **Card number**: `4242 4242 4242 4242`
   - **MM/YY**: Bất kỳ (tương lai), ví dụ: `12/25`
   - **CVC**: Bất kỳ 3 số, ví dụ: `123`
   - **ZIP**: Bất kỳ, ví dụ: `12345`
4. Bấm **"Pay $XXX Securely"**
5. ✅ Đơn hàng sẽ được tạo thành công!

## 📊 Debug Logs
Đã thêm console.log để debug:
```javascript
console.log('📦 Creating order with data:', orderData);
console.log('👤 User info:', { id: user.id, email, fullName });
console.log('🛒 Order items:', orderItems);
```

Kiểm tra Console trong Browser (F12) để xem dữ liệu đang được gửi.

## 🎯 Expected Result
Sau khi restart Strapi server và test lại:
- ✅ Không còn lỗi 400
- ✅ Order được tạo thành công trong database
- ✅ Cart được xóa
- ✅ Email xác nhận được gửi
- ✅ Redirect đến `/payment-confirm`

## ⚠️ Lưu ý
- **PHẢI RESTART Strapi server** sau khi thay đổi schema
- Nếu vẫn lỗi, xóa cache: `rm -rf server/.cache` (hoặc xóa thư mục `.cache` trong `server/`)
- Kiểm tra Strapi logs để xem lỗi chi tiết
- Đảm bảo user đã đăng nhập (có `user.id`)

## 🎉 Kết quả
Flow hoàn chỉnh:
```
Cart → Checkout → Fill Card Info → Pay → 
  ↓
Create Order (with clerkUserId) → 
  ↓
Clear Cart → Send Email → Payment Confirm Page
```
