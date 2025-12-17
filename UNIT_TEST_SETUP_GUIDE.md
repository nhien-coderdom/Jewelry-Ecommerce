# 📚 Hướng dẫn Cài đặt & Viết Unit Tests

## 1️⃣ CÁC BƯỚC CÀI ĐẶT UNIT TEST

### Bước 1: Cài đặt Jest (Framework Testing)
```bash
npm install --save-dev jest
```
**Jest là gì?** Framework viết unit test cho Node.js/JavaScript, giúp test logic mà không cần database thực.

### Bước 2: Cài đặt Babel (Hỗ trợ ES6+)
```bash
npm install --save-dev @babel/core @babel/preset-env
```
**Babel là gì?** Chuyển đổi code ES6+ thành code có thể chạy trên Node.js.

### Bước 3: Cài đặt Jest Types (TypeScript support)
```bash
npm install --save-dev @types/jest
```
**@types/jest là gì?** Cung cấp type hints cho VS Code, giúp intellisense hoạt động.

### Bước 4: Cấu hình Jest (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
```

### Bước 5: Cấu hình Babel (`.babelrc`)
```json
{
  "presets": [["@babel/preset-env", { "targets": { "node": "current" } }]]
}
```

### Bước 6: Thêm script test vào `package.json`
```json
{
  "scripts": {
    "test": "jest --forceExit --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --forceExit"
  }
}
```

---

## 2️⃣ NHỮNG GÌ ĐÃ ĐƯỢC CẤU HÌNH TRONG DỰ ÁN

### ✅ Đã cài đặt:
- [x] Jest 29.7.0
- [x] Babel (preset-env)
- [x] @types/jest
- [x] jest.config.js (cấu hình Jest)
- [x] .babelrc (cấu hình Babel)
- [x] jsconfig.json (TypeScript support)

### ✅ Folder cấu trúc:
```
server/
├── tests/
│   ├── __tests__/              # Các file test
│   │   ├── order.logic.test.js
│   │   ├── product.crud.test.js
│   │   ├── cart.crud.test.js
│   │   ├── businessLogic.test.js
│   │   ├── checkout.test.js
│   │   └── README.md
│   ├── helpers.js              # Mock data helpers
│   └── jest.config.js          # Cấu hình Jest
├── src/
│   └── utils/
│       └── businessLogic.js    # Business logic functions
└── package.json                # npm scripts
```

---

## 3️⃣ CÁCH VIẾT 1 UNIT TEST

### Ví dụ 1: Test đơn giản (Logic thuần)
```javascript
// Hàm cần test
function add(a, b) {
  return a + b;
}

// Test cho hàm
describe('Math Functions', () => {
  it('✅ Nên cộng 2 + 3 = 5', () => {
    const result = add(2, 3);
    expect(result).toBe(5);  // Kiểm tra kết quả
  });

  it('❌ Nên lỗi khi input không phải số', () => {
    expect(() => add('a', 'b')).toThrow();
  });
});
```

**Giải thích:**
- `describe()` - Nhóm các test liên quan
- `it()` - Một test case
- `expect()` - Kiểm tra kết quả
- `toBe()` - Assertion (kiểm tra bằng)

### Ví dụ 2: Test với Mock Data (Như trong dự án)
```javascript
const { createMockStrapi, createMockProduct } = require('../helpers');

describe('Product - CRUD', () => {
  let mockStrapi;

  // Setup trước mỗi test
  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  // Cleanup sau mỗi test
  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  it('✅ Nên thêm product thành công', async () => {
    // Arrange: Chuẩn bị data
    const productData = {
      title: 'Diamond Ring',
      price: 5000,
      stock: 10,
    };

    // Act: Thực hiện action
    const result = await mockStrapi.entityService.create(
      'api::product.product',
      { data: productData }
    );

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.title).toBe('Diamond Ring');
    expect(result.price).toBe(5000);
  });
});
```

**Cấu trúc AAA (Arrange-Act-Assert):**
1. **Arrange**: Chuẩn bị data, mock objects
2. **Act**: Gọi function/action cần test
3. **Assert**: Kiểm tra kết quả

### Ví dụ 3: Test Validation
```javascript
describe('Validation', () => {
  it('❌ Giá không được âm', () => {
    const price = -100;
    
    const isValid = price >= 0;  // Logic validation
    expect(isValid).toBe(false);
  });

  it('✅ Email phải hợp lệ', () => {
    const validEmail = 'user@example.com';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(regex.test(validEmail)).toBe(true);
  });
});
```

### Ví dụ 4: Test Error Handling
```javascript
describe('Error Handling', () => {
  it('❌ Nên throw error khi stock không đủ', () => {
    const checkStock = () => {
      const stock = 2;
      const requested = 10;
      
      if (stock < requested) {
        throw new Error('Insufficient stock');
      }
    };

    expect(checkStock).toThrow('Insufficient stock');
  });
});
```

---

## 4️⃣ CÁC LOẠI ASSERTION (expect)

| Assertion | Mô tả | Ví dụ |
|-----------|-------|-------|
| `toBe()` | Kiểm tra giá trị chính xác (===) | `expect(2 + 2).toBe(4)` |
| `toEqual()` | Kiểm tra giá trị (objects) | `expect(obj).toEqual({a:1})` |
| `toBeDefined()` | Kiểm tra xác định | `expect(result).toBeDefined()` |
| `toBeNull()` | Kiểm tra null | `expect(value).toBeNull()` |
| `toBeTruthy()` | Kiểm tra truthy | `expect(true).toBeTruthy()` |
| `toThrow()` | Kiểm tra throw error | `expect(fn).toThrow()` |
| `toHaveBeenCalled()` | Kiểm tra mock function gọi | `expect(fn).toHaveBeenCalled()` |
| `toHaveLength()` | Kiểm tra độ dài | `expect(arr).toHaveLength(3)` |
| `toContain()` | Kiểm tra có chứa | `expect(arr).toContain(2)` |

---

## 5️⃣ MOCK DATA HELPERS

### Tạo Mock Product
```javascript
const mockProduct = createMockProduct({
  title: 'Custom Product',
  price: 2000
});
```

### Tạo Mock Order
```javascript
const mockOrder = createMockOrder({
  total: 1000,
  status: 'paid'
});
```

### Tạo Mock Strapi
```javascript
const mockStrapi = createMockStrapi();

// Sử dụng
await mockStrapi.entityService.create('api::product.product', { data: {...} });
await mockStrapi.entityService.findOne('api::product.product', 1);
```

---

## 6️⃣ CHẠY TESTS

### Chạy tất cả tests
```bash
npm test
```

### Chạy test cụ thể
```bash
npm test -- checkout.test.js
```

### Watch mode (tự chạy lại khi file thay đổi)
```bash
npm test:watch
```

### Xem coverage
```bash
npm test:coverage
```

---

## 7️⃣ CÂU TRÚC TEST FILE ĐẦY ĐỦ

```javascript
/**
 * 🧪 Unit Tests cho Feature X
 * Test logic Y với MOCK DATA
 */

const { createMockStrapi } = require('../helpers');

describe('🎯 Feature X', () => {
  let mockStrapi;

  // Setup: Chạy trước mỗi test
  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  // Cleanup: Chạy sau mỗi test
  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  describe('✅ Success Cases', () => {
    it('✅ Nên thành công case 1', () => {
      // AAA: Arrange, Act, Assert
      expect(true).toBe(true);
    });

    it('✅ Nên thành công case 2', async () => {
      // Test async
      const result = await mockStrapi.entityService.create(...);
      expect(result).toBeDefined();
    });
  });

  describe('❌ Error Cases', () => {
    it('❌ Nên xảy lỗi case 1', () => {
      expect(() => throwError()).toThrow();
    });

    it('❌ Validation case 1', () => {
      const isValid = validateData({});
      expect(isValid).toBe(false);
    });
  });
});
```

---

## 8️⃣ BEST PRACTICES

✅ **NÊN LÀM:**
- ✅ Test logic thuần (không cần database)
- ✅ Sử dụng mock data
- ✅ Cấu trúc AAA (Arrange-Act-Assert)
- ✅ Một test test một điều
- ✅ Đặt tên test rõ ràng
- ✅ Cleanup sau mỗi test
- ✅ Test cả error cases

❌ **KHÔNG NÊN:**
- ❌ Gọi database thực
- ❌ Test giao diện UI
- ❌ Test dependency khác
- ❌ Viết test quá dài
- ❌ Quên cleanup

---

## 9️⃣ THỐNG KÊ DỰ ÁN HIỆN TẠI

| File | Tests | Tình trạng |
|------|-------|-----------|
| businessLogic.test.js | 27 | ✅ Pass |
| product.crud.test.js | 11 | ✅ Pass |
| order.logic.test.js | 19 | ✅ Pass |
| cart.crud.test.js | 7 | ✅ Pass |
| checkout.test.js | 32 | ✅ Pass |
| **TỔNG** | **96** | **✅ 100% PASS** |

---

## 🔟 TỔNG HỢP

### Để cài đặt unit test:
1. `npm install --save-dev jest` (framework test)
2. `npm install --save-dev @babel/core @babel/preset-env` (transpiler)
3. `npm install --save-dev @types/jest` (TypeScript types)
4. Cấu hình `jest.config.js`, `.babelrc`, `jsconfig.json`
5. Thêm script test vào `package.json`

### Để viết 1 unit test:
1. Sử dụng `describe()` để nhóm tests
2. Dùng `it()` để viết 1 test case
3. Áp dụng cấu trúc AAA: Arrange → Act → Assert
4. Dùng `expect()` với assertions phù hợp
5. Mock data nếu cần (không dùng database thực)
6. Cleanup sau mỗi test với `afterEach()`

### Lệnh hay dùng:
```bash
npm test                    # Chạy tất cả tests
npm test:watch             # Watch mode
npm test:coverage          # Xem coverage
npm test -- checkout.test.js  # Test file cụ thể
```

---

**Đã setup xong! 96 tests ✅ 100% PASS** 🎉
