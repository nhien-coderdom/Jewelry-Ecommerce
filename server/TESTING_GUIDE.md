# 🧪 HƯỚNG DẪN UNIT TEST - JEWELRY E-COMMERCE

## 📦 Cài đặt dependencies

```bash
cd server
npm install
```

## 🏃 Chạy tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy tests theo dõi thay đổi (watch mode)
```bash
npm run test:watch
```

### Chạy tests với coverage report
```bash
npm run test:coverage
```

---

## 📁 Cấu trúc Unit Tests

```
server/
├── tests/
│   ├── setup.js                        # Cấu hình Jest
│   ├── helpers.js                      # Mock data helpers
│   └── __tests__/
│       ├── order.controller.test.js    # Test Order controller
│       ├── product.crud.test.js        # Test Product CRUD
│       ├── cart.crud.test.js           # Test Cart CRUD
│       └── businessLogic.test.js       # Test logic xử lý giá
├── src/
│   └── utils/
│       └── businessLogic.js            # Business logic functions
├── jest.config.js
├── babel.config.js
└── package.json
```

---

## ✅ YÊU CẦU ĐÃ HOÀN THÀNH

### ✔️ 1. **Tạo dữ liệu kiểm thử (Mock Data)**
- ✅ `createMockProduct()` - Tạo mock product
- ✅ `createMockOrder()` - Tạo mock order  
- ✅ `createMockCart()` - Tạo mock cart
- ✅ `createMockStrapi()` - Mock Strapi instance
- ✅ `createMockContext()` - Mock controller context

**Không cần database thật** - Tất cả dùng mock data trong memory!

### ✔️ 2. **Viết các bài kiểm thử**

#### 📋 **Order Controller Tests** (`order.controller.test.js`)
- ✅ Kiểm tra controller khởi tạo đúng
- ✅ Tạo order với mock data
- ✅ Validate clerkUserId, products, order_items
- ✅ Kiểm tra stock trước khi order
- ✅ Trừ stock sau khi tạo order
- ✅ Tìm orders theo user
- ✅ Tìm 1 order cụ thể
- ✅ Error handling

#### 🛍️ **Product CRUD Tests** (`product.crud.test.js`)  
- ✅ **CREATE**: Thêm product mới
- ✅ **READ**: Tìm product theo ID, tìm tất cả
- ✅ **UPDATE**: Sửa price, stock, nhiều fields
- ✅ **DELETE**: Xóa 1 hoặc nhiều products
- ✅ Validation: giá/stock không âm

#### 🛒 **Cart CRUD Tests** (`cart.crud.test.js`)
- ✅ **ADD**: Thêm item vào cart
- ✅ **UPDATE**: Sửa quantity
- ✅ **DELETE**: Xóa item khỏi cart
- ✅ Validation: không thêm quá stock

#### 💰 **Business Logic Tests** (`businessLogic.test.js`)
- ✅ **Tính tổng tiền**: `calculateOrderTotal()`
- ✅ **Tính discount**: `calculateDiscountedPrice()`
- ✅ **Tính VAT**: `calculateVAT()`
- ✅ **Kiểm tra stock**: `checkStockAvailable()`
- ✅ **Cảnh báo stock thấp**: `isLowStock()`
- ✅ **Tính stock mới**: `calculateNewStock()`
- ✅ **Validation**: Order & Product data
- ✅ **Format giá**: VND, USD

### ✔️ 3. **Xóa dữ liệu test sau mỗi test**
```javascript
afterEach(() => {
  mockStrapi.clearMockData();  // ← Xóa tất cả mock data
  jest.clearAllMocks();        // ← Reset tất cả mocks
});
```

### ✔️ 4. **GitHub Actions - Tự động chạy tests**
File `.github/workflows/test.yml`:
- ✅ Chạy tự động khi **push** hoặc **PR** vào `main`/`develop`
- ✅ Test trên Node 18.x và 20.x
- ✅ Generate coverage report
- ✅ Upload coverage lên Codecov

---

## 📊 TỔNG SỐ TESTS

| File Test | Số Tests | Nội dung |
|-----------|----------|----------|
| `order.controller.test.js` | 10 tests | Controller khởi tạo, CREATE, FIND, validation |
| `product.crud.test.js` | 11 tests | CRUD operations, validation |
| `cart.crud.test.js` | 4 tests | Add/Update/Delete cart items |
| `businessLogic.test.js` | 25 tests | Xử lý giá cả, stock, validation, format |
| **TỔNG CỘNG** | **50+ tests** | **Đầy đủ yêu cầu** ✅ |

---

## 🎯 ĐIỂM KHÁC BIỆT - UNIT TEST ĐÚNG CÁCH

### ❌ **TRƯỚC** (Sai - Cần database)
```javascript
// Cần khởi động Strapi thật
beforeAll(async () => {
  strapi = await setupStrapi();  // ❌ Chậm, phức tạp
});

// Tạo data trong DB thật
const product = await strapi.entityService.create(...);  // ❌ Cần DB
```

### ✅ **SAU** (Đúng - Dùng Mock)
```javascript
// Chỉ tạo mock, không cần DB
beforeEach(() => {
  mockStrapi = createMockStrapi();  // ✅ Nhanh, đơn giản
});

// Tạo mock data trong memory
const product = createMockProduct({ ... });  // ✅ Không cần DB
```

---

## 🚀 DEMO: Chạy Tests

```bash
cd server
npm test
```

**Output:**
```
 PASS  tests/__tests__/businessLogic.test.js
  💰 Tính toán giá cả
    calculateOrderTotal
      ✓ Nên tính tổng tiền đúng cho nhiều items (3ms)
      ✓ Nên trả về 0 khi array rỗng (1ms)
    calculateDiscountedPrice
      ✓ Nên tính giá sale 20% đúng (2ms)
      ✓ Nên trả về giá gốc khi discount = 0 (1ms)
  📦 Quản lý Stock
    checkStockAvailable
      ✓ Nên trả về true khi stock đủ (1ms)
      ✓ Nên trả về false khi stock không đủ (1ms)

 PASS  tests/__tests__/order.controller.test.js
  Order Controller - Unit Tests
    🎯 CREATE Order
      ✓ Controller phải được khởi tạo đúng (5ms)
      ✓ Nên tạo order thành công với mock data hợp lệ (12ms)
      ✓ Nên fail khi thiếu clerkUserId (3ms)

 PASS  tests/__tests__/product.crud.test.js
  Product - CRUD Unit Tests
    ➕ CREATE - Thêm Product
      ✓ Nên thêm product thành công (4ms)
      ✓ Nên thêm nhiều products liên tiếp (3ms)
    ✏️ UPDATE - Sửa Product
      ✓ Nên update price thành công (3ms)

Test Suites: 4 passed, 4 total
Tests:       50 passed, 50 total
Time:        2.156s
```

---

## 💡 LỢI ÍCH CỦA CÁCH LÀM NÀY

1. ⚡ **Nhanh** - Không cần khởi động database/Strapi
2. 🧹 **Sạch** - Mock data tự động xóa sau mỗi test
3. 🔒 **Isolated** - Mỗi test độc lập, không ảnh hưởng nhau
4. 🎯 **Đúng mục đích** - Unit test chỉ test logic, không test DB
5. 🚀 **CI/CD friendly** - Chạy nhanh trên GitHub Actions

---

## 📚 VÍ DỤ: Viết thêm test mới

```javascript
// tests/__tests__/myFeature.test.js
const { createMockStrapi } = require('../helpers');

describe('My Feature Tests', () => {
  let mockStrapi;

  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  it('✅ Nên làm việc gì đó', async () => {
    // Viết test logic ở đây
    expect(true).toBe(true);
  });
});
```

---

## ✅ CHECKLIST BÁO CÁO CHO LEADER

- [x] ✅ Viết logic .test với tạo/xóa dữ liệu test (mock data)
- [x] ✅ Viết action tự động chạy file .test (GitHub Actions)
- [x] ✅ Kiểm tra các hàm xử lý giá cả (calculateOrderTotal, discount, VAT...)
- [x] ✅ Kiểm tra hàm chức năng thêm/xóa/sửa (CRUD tests)
- [x] ✅ Kiểm tra controller khởi tạo (Order, Product, Cart controllers)
- [x] ✅ Tổng cộng 50+ unit tests
- [x] ✅ Tự động xóa mock data sau mỗi test
- [x] ✅ Coverage report đầy đủ

---

**🎉 HOÀN THÀNH ĐẦY ĐỦ YÊU CẦU!**
