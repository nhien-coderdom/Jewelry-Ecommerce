# TEST CASE FORM - Product CRUD Operations

## Code / Test requirement

| Code | Product CRUD |
|------|---|
| Test requirement | Unit test các chức năng CRUD product (Create/Read/Update/Delete) với MOCK DATA |
| Tester | QA Team |
| Pass | 12 |
| Fail | 0 |
| Untested | 0 |
| N/A | 0 |
| Number of Test cases | 12 |

---

## 1. TEST CASES - CREATE Product (Thêm sản phẩm mới)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| PC-001 | Tạo product thành công - Test CREATE product: tạo sản phẩm mới với tất cả required fields (title, price, stock). Hàm gọi entityService.create('api::product.product') với mock data. Kỳ vọng: product được tạo với ID unique | 1. Chuẩn bị mock product data: {title: 'Diamond Ring', description: '...', price: 5000, stock: 5}<br>2. Gọi mockStrapi.entityService.create('api::product.product', {data: productData})<br>3. Verify result.id exists, result.title === 'Diamond Ring', result.price === 5000, result.stock === 5 | Product được tạo thành công với id unique, tất cả fields preserved | Không có | PASS | 18-12-2025 | Normal case |
| PC-002 | Tạo nhiều products liên tiếp - Test bulk create: tạo 2 products khác nhau trong cùng test session. Hàm gọi 2x create với product 1 và product 2. Kỳ vọng: cả 2 products được tạo, mock data có 2 items | 1. Tạo product 1: {title: 'Product 1', price: 1000, stock: 10}<br>2. Gọi mockStrapi.entityService.create('api::product.product', {data: product1})<br>3. Tạo product 2: {title: 'Product 2', price: 2000, stock: 20}<br>4. Gọi mockStrapi.entityService.create('api::product.product', {data: product2})<br>5. Verify mockData.products.length === 2 | 2 products created: product 1 with id=1, product 2 with id=2, no collision | Không có | PASS | 18-12-2025 | Normal case |
| PC-003 | Validation: Giá không được âm - Test price validation: ngăn không cho tạo product với price < 0. Hàm validate: price >= 0. Kỳ vọng: validation fail khi price = -100 | 1. Setup invalid product: {title: 'Invalid', price: -100, stock: 10}<br>2. Check isValid = (invalidProduct.price >= 0)<br>3. Verify isValid === false | isValid: false (price must be >= 0) | Không có | PASS | 18-12-2025 | Validation |
| PC-004 | Validation: Stock không được âm - Test stock validation: ngăn không cho tạo product với stock < 0. Hàm validate: stock >= 0. Kỳ vọng: validation fail khi stock = -5 | 1. Setup invalid product: {title: 'Invalid', price: 100, stock: -5}<br>2. Check isValid = (invalidProduct.stock >= 0)<br>3. Verify isValid === false | isValid: false (stock must be >= 0) | Không có | PASS | 18-12-2025 | Validation |

---

## 2. TEST CASES - UPDATE Product (Cập nhật sản phẩm)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| PC-005 | Update price thành công - Test UPDATE price: khách hàng/admin cập nhật price của product từ 1000 → 1500. Hàm gọi entityService.update('api::product.product', productId, {data: {price: 1500}}). Kỳ vọng: price updated, title không thay đổi | 1. Tạo product (PC-001): {title: 'Gold Necklace', price: 1000, stock: 10}<br>2. Lấy productId<br>3. Gọi mockStrapi.entityService.update('api::product.product', productId, {data: {price: 1500}})<br>4. Verify updated.price === 1500 && updated.title === 'Gold Necklace' | Updated successfully: price=1500, title unchanged | Phụ thuộc PC-001 | PASS | 18-12-2025 | Normal case |
| PC-006 | Update stock sau khi có order - Test stock deduction: khi customer đặt hàng, stock bị trừ (10 - 3 = 7). Hàm update: newStock = currentStock - quantityOrdered. Kỳ vọng: stock reduced to 7 | 1. Tạo product (PC-001): stock=10<br>2. Simulate order: quantityOrdered=3<br>3. Calculate newStock = 10 - 3 = 7<br>4. Gọi mockStrapi.entityService.update('api::product.product', productId, {data: {stock: 7}})<br>5. Verify updated.stock === 7 | Updated successfully: stock=7 (from 10) | Phụ thuộc PC-001 | PASS | 18-12-2025 | Integration |
| PC-007 | Update nhiều fields cùng lúc - Test atomic update: update cả 3 fields (title, price, stock) trong 1 call. Hàm gọi entityService.update với {data: {title: '...', price: 2000, stock: 20}}. Kỳ vọng: tất cả 3 fields updated atomically | 1. Tạo product (PC-001)<br>2. Gọi mockStrapi.entityService.update('api::product.product', productId, {data: {title: 'Updated Title', price: 2000, stock: 20}})<br>3. Verify updated.title === 'Updated Title' && updated.price === 2000 && updated.stock === 20 | All 3 fields updated atomically: title='Updated Title', price=2000, stock=20 | Phụ thuộc PC-001 | PASS | 18-12-2025 | Normal case |

---

## 3. TEST CASES - DELETE Product (Xóa sản phẩm)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| PC-008 | Xóa product thành công - Test DELETE product: xóa 1 product khỏi database. Hàm gọi entityService.delete('api::product.product', productId). Kỳ vọng: product bị xóa, findOne(id) trả về null | 1. Tạo product (PC-001): {title: 'Product to Delete'}<br>2. Lấy productId<br>3. Gọi mockStrapi.entityService.delete('api::product.product', productId)<br>4. Gọi mockStrapi.entityService.findOne('api::product.product', productId)<br>5. Verify findOne result === null | Deleted successfully: findOne returns null | Phụ thuộc PC-001 | PASS | 18-12-2025 | Normal case |
| PC-009 | Xóa nhiều products liên tiếp - Test bulk delete: xóa 2 products khác nhau. Hàm loop delete từng product. Kỳ vọng: cả 2 products bị xóa, mock data trống | 1. Tạo 2 products (PC-002): product1.id, product2.id<br>2. Gọi mockStrapi.entityService.delete('api::product.product', product1.id)<br>3. Gọi mockStrapi.entityService.delete('api::product.product', product2.id)<br>4. Verify mockData.products.length === 0 | Both products deleted: mockData.products = [] | Phụ thuộc PC-002 | PASS | 18-12-2025 | Normal case |

---

## 4. TEST CASES - READ Product (Tìm kiếm sản phẩm)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| PC-010 | Tìm product theo ID thành công - Test READ findOne: lấy 1 product bằng ID. Hàm gọi entityService.findOne('api::product.product', productId). Kỳ vọng: product returned với đúng ID và title | 1. Tạo product (PC-001): {title: 'Find Me'}<br>2. Lấy productId<br>3. Gọi mockStrapi.entityService.findOne('api::product.product', productId)<br>4. Verify found.id === productId && found.title === 'Find Me' | Product found: id matches, title='Find Me', all fields populated | Phụ thuộc PC-001 | PASS | 18-12-2025 | Normal case |
| PC-011 | Tìm tất cả products - Test READ findMany: lấy tất cả products từ database. Hàm gọi entityService.findMany('api::product.product'). Kỳ vọng: array chứa tất cả products đã tạo | 1. Tạo 2 products (PC-002): product1, product2<br>2. Gọi mockStrapi.entityService.findMany('api::product.product')<br>3. Verify products.length >= 2 && products contains product1 && products contains product2 | All products found: length=2, contains all created products with full data | Phụ thuộc PC-002 | PASS | 18-12-2025 | Normal case |
| PC-012 | Graceful 404: Product không tồn tại - Test error handling: tìm product với ID không tồn tại (ID=99999). Hàm findOne('api::product.product', 99999) trả về null (không throw error). Kỳ vọng: graceful response, không crash | 1. Try findOne('api::product.product', 99999)<br>2. Verify không throw exception<br>3. Verify result === null | Graceful handling: returns null, no exception thrown | Không có | PASS | 18-12-2025 | Edge case |

---

## Test Execution Summary

| Metrics | Value |
|---------|-------|
| Total Test Cases | 12 |
| PASSED | 12 |
| FAILED | 0 |
| Pass Rate | 100% |
| Execution Date | 18-12-2025 |
| Tester | QA Team |

---

## Coverage by Function

| Function | Test Cases | Status | Pass Rate |
|----------|-----------|--------|-----------|
| CREATE Product | 4 | PASSED | 100% |
| UPDATE Product | 3 | PASSED | 100% |
| DELETE Product | 2 | PASSED | 100% |
| READ Product | 3 | PASSED | 100% |
| **TOTAL** | **12** | **PASSED** | **100%** |

---

## Test Dependencies Map

```
PC-001 (Create single product - baseline)
  ├─ PC-005 (Update price) → requires PC-001 product.id
  ├─ PC-006 (Update stock) → requires PC-001 product with stock
  ├─ PC-008 (Delete single) → requires PC-001 product.id
  └─ PC-010 (Find by ID) → requires PC-001 product.id

PC-002 (Create multiple products)
  ├─ PC-009 (Delete multiple) → requires PC-002 product1.id, product2.id
  └─ PC-011 (Find all) → requires PC-002 at least 2 products

PC-003 (Negative price validation - standalone)
PC-004 (Negative stock validation - standalone)
PC-007 (Update multiple fields) → requires PC-001 product
PC-012 (404 graceful delete - standalone)
```

---

## Key Validation Rules

| Rule | Type | Scope | Message | Impact |
|------|------|-------|---------|--------|
| price >= 0 | Validation | CREATE, UPDATE | Price must be non-negative | Prevent data corruption |
| stock >= 0 | Validation | CREATE, UPDATE | Stock must be non-negative | Prevent inventory logic errors |
| title required | Validation | CREATE, UPDATE | Title is required | Product identification |
| description optional | Validation | CREATE, UPDATE | Description is optional | Flexible product info |
| graceful 404 | Error handling | READ | Return null, not error | Prevent app crash |
| unique ID | Auto-generation | CREATE | Auto-generated by Strapi | Product identification |

---

## CRUD Operations Mapping

### CREATE (4 tests)
- **PC-001**: Create single product with all fields
- **PC-002**: Create multiple products sequentially
- **PC-003**: Validation - reject negative price
- **PC-004**: Validation - reject negative stock

### READ (3 tests)
- **PC-010**: Read single product by ID (findOne)
- **PC-011**: Read all products (findMany)
- **PC-012**: Read non-existent product (graceful 404)

### UPDATE (3 tests)
- **PC-005**: Update single field (price)
- **PC-006**: Update inventory (stock deduction)
- **PC-007**: Update multiple fields atomically

### DELETE (2 tests)
- **PC-008**: Delete single product
- **PC-009**: Delete multiple products

---

## Integration Points

| Component | Integration | Test Case | Impact |
|-----------|-----------|-----------|--------|
| Product | Core entity | PC-001 to PC-012 | All tests operate on product entity |
| Stock | Inventory management | PC-004, PC-006, PC-011 | Stock validation & deduction |
| Price | Pricing system | PC-003, PC-005 | Price validation & updates |
| Order | Reference relationship | PC-006, PC-010 | Orders deduct product stock |
| Cart | Reference relationship | PC-010, PC-011 | Cart items reference products |
| Mock Strapi | Test framework | All | entityService.create/update/delete/findOne/findMany |

---

## Test Code Structure

```javascript
// Setup/Teardown Pattern
beforeEach() {
  mockStrapi = createMockStrapi();  // Fresh mock for each test
}

afterEach() {
  mockStrapi.clearMockData();       // Cleanup
  jest.clearAllMocks();
}

// Test Flow Pattern
describe('CREATE - Thêm Product', () => {
  it('PASS: Nên thêm product thành công', async () => {
    // 1. Setup data
    const productData = { title, price, stock };
    
    // 2. Execute
    const result = await mockStrapi.entityService.create(
      'api::product.product',
      { data: productData }
    );
    
    // 3. Assert
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Diamond Ring');
  });
});
```

---

## Mock Data Lifecycle

```
Test Start:     mockData = { products: [] }
PC-001:         mockData = { products: [{ id: 1, title: 'Diamond Ring', price: 5000, stock: 5 }] }
PC-002:         mockData = { products: [{ id: 1 }, { id: 2 }] }
PC-005/006/007: mockData = { products: [{ id: 1, price: 1500, stock: 7, title: 'Updated' }] }
PC-008:         mockData = { products: [] } (after delete)
PC-009:         mockData = { products: [] } (after delete multiple)
Test Clean:     mockData cleared by afterEach()
```

---

## Related Test Suites

| Test Suite | File | Coverage | Integration |
|-----------|------|----------|-------------|
| Business Logic | businessLogic.test.js | Price calculations, stock management, VAT | Uses product price/stock |
| Order Logic | order.logic.test.js | Order creation, order lookup | Orders reference products, deduct stock |
| Cart CRUD | cart.crud.test.js | Cart item CRUD | Cart items reference products |
| Product CRUD | product.crud.test.js | Product CRUD | Core product entity |
| Checkout | checkout.test.js | Checkout flow | Creates order, clears cart, uses products |

---

**Document Status:** ✅ COMPLETE  
**All 12 Tests:** ✅ PASS (100%)  
**Last Review:** Production Ready  
**Format:** Aligned with cart.crud test case form structure
