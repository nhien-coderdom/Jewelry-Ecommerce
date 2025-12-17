# TEST CASE FORM - Cart CRUD Operations

## Code / Test requirement

| Code | Cart CRUD |
|------|---|
| Test requirement | Unit test các chức năng CRUD cart items (Create/Read/Update/Delete) với MOCK DATA |
| Tester | QA Team |
| Pass | 12 |
| Fail | 0 |
| Untested | 0 |
| N/A | 0 |
| Number of Test cases | 12 |

---

## 1. TEST CASES - CREATE/ADD to Cart (Thêm sản phẩm vào giỏ hàng)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| CC-001 | Tạo cart thành công - Test CREATE cart flow: khách hàng thêm giỏ hàng lần đầu. Hàm gọi entityService.create('api::cart.cart') với mock data. Kỳ vọng: cart được tạo với ID unique | 1. Chuẩn bị mock cart data từ createMockCart()<br>2. Gọi mockStrapi.entityService.create('api::cart.cart', {data: mockCart})<br>3. Verify cart.id exists, cart defined | Cart được tạo thành công với id unique | Không có | PASS | 17-12-2025 | Normal case |
| CC-002 | Thêm product vào cart thành công - Test ADD to cart: tạo cart_item link giữa cart và product. Hàm tạo cart_item với product ID, quantity, link về cart.id. Kỳ vọng: cart_item được tạo với đúng product và quantity | 1. Tạo cart trước (CC-001): cart.id<br>2. Tạo cart_item: product=1, quantity=2, cart=cart.id<br>3. Gọi mockStrapi.entityService.create('api::cart-item.cart-item')<br>4. Verify cartItem.quantity=2, cartItem.product=1 | CartItem được tạo: product=1, quantity=2, cart linked | Phụ thuộc CC-001 | PASS | 17-12-2025 | Normal case |
| CC-003 | Tạo nhiều cart items - Test multiple items: khách hàng thêm nhiều sản phẩm khác nhau vào cart. Hàm tạo loop cart_items, mỗi item có product ID, quantity riêng. Kỳ vọng: tất cả items được tạo | 1. Tạo cart: cart.id<br>2. Tạo 3 cart_items: product=1/qty=2, product=2/qty=1, product=3/qty=3<br>3. Gọi create cho mỗi item<br>4. Verify 3 items created với đúng product/qty | 3 CartItems created with correct products | Phụ thuộc CC-001 | PASS | 17-12-2025 | Normal case |
| CC-004 | Validation: Không cho thêm quá stock - Test stock validation: khi khách muốn thêm quantity > product.stock, hàm phải reject. Test: stock=5, quantity=10 = invalid. Điều này prevent overselling | 1. Setup: productStock=5, requestedQuantity=10<br>2. Check canAdd = productStock >= requestedQuantity<br>3. Verify canAdd = false | canAdd: false (stock không đủ) | Không có | PASS | 17-12-2025 | Validation |
| CC-005 | Validation: Quantity phải > 0 - Test quantity validation: khách không thể add 0 hoặc negative quantity. Test: quantity=0 = invalid. Điều này prevent nonsensical cart items | 1. Setup: requestedQuantity=0<br>2. Check isValid = requestedQuantity > 0<br>3. Verify isValid = false | isValid: false (invalid quantity) | Không có | PASS | 17-12-2025 | Validation |
| CC-006 | Validation: Product must exist - Test product validation: trước khi tạo cart_item, verify product tồn tại. Nếu product ID không valid, reject. Điều này prevent linking to ghost products | 1. Setup: invalid productId=99999<br>2. Try create cart_item dengan product=99999<br>3. Verify error thrown: 'Product not found' | Error: 'Product not found' | Không có | PASS | 17-12-2025 | Validation |

---

## 2. TEST CASES - UPDATE Cart Item (Cập nhật số lượng trong giỏ)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| CC-007 | Update quantity thành công - Test UPDATE: khách thay đổi số lượng sản phẩm trong giỏ từ 1 → 5. Hàm gọi entityService.update('api::cart-item.cart-item', id, {data: {quantity: 5}}). Kỳ vọng: updated.quantity = 5 | 1. Tạo cart_item (CC-002): quantity=1<br>2. Gọi mockStrapi.entityService.update('api::cart-item.cart-item', cartItem.id, {data: {quantity: 5}})<br>3. Verify updated.quantity = 5 | Updated cartItem: quantity=5 | Phụ thuộc CC-002 | PASS | 17-12-2025 | Normal case |
| CC-008 | Validation: Không update quá stock - Test stock validation on update: khi update quantity quá stock còn lại, hàm phải reject. Test: stock=5, new quantity=10 = invalid | 1. Tạo cart_item: quantity=1<br>2. Try update quantity=10, nhưng product.stock=5<br>3. Verify update rejected, error: 'Not enough stock' | Error: 'Not enough stock' | Phụ thuộc CC-002 | PASS | 17-12-2025 | Validation |
| CC-009 | Validation: Quantity phải > 0 khi update - Test quantity validation: không thể update thành 0 hoặc negative. Test: quantity=-5 hoặc 0 = invalid | 1. Tạo cart_item: quantity=1<br>2. Try update quantity=0<br>3. Verify update rejected: 'Quantity must be > 0' | Error: 'Quantity must be > 0' | Phụ thuộc CC-002 | PASS | 17-12-2025 | Validation |

---

## 3. TEST CASES - DELETE from Cart (Xóa sản phẩm khỏi giỏ)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| CC-010 | Xóa cart item thành công - Test DELETE: khách hàng xóa sản phẩm khỏi giỏ. Hàm gọi entityService.delete('api::cart-item.cart-item', itemId). Kỳ vọng: item bị xóa, findOne(id) trả về null | 1. Tạo cart_item (CC-002): itemId<br>2. Gọi mockStrapi.entityService.delete('api::cart-item.cart-item', itemId)<br>3. Gọi findOne(itemId)<br>4. Verify findOne = null (item deleted) | Deleted successfully: findOne returns null | Phụ thuộc CC-002 | PASS | 17-12-2025 | Normal case |
| CC-011 | Xóa tất cả cart items - Test delete multiple: khách xóa tất cả sản phẩm khỏi giỏ. Hàm loop qua cart_items và delete từng cái. Kỳ vọng: tất cả items bị xóa, cart trống | 1. Tạo 3 cart_items (CC-003)<br>2. Loop delete mỗi item<br>3. Verify findMany(cart.id) returns empty array | All items deleted: findMany returns [] | Phụ thuộc CC-003 | PASS | 17-12-2025 | Normal case |
| CC-012 | Graceful 404: Xóa item không tồn tại - Test error handling: khi delete item ID không tồn tại, hàm phải graceful (không crash). Trả về null hoặc error, không throw exception | 1. Try delete cart_item với ID=99999 (không tồn tại)<br>2. Verify không throw error<br>3. Verify graceful response (null or 404) | Graceful handling: no exception, returns null/404 | Không có | PASS | 17-12-2025 | Edge case |

---

## Test Execution Summary

| Metrics | Value |
|---------|-------|
| Total Test Cases | 12 |
| PASSED | 12 |
| FAILED | 0 |
| Pass Rate | 100% |
| Execution Date | 17-12-2025 |
| Tester | QA Team |

---

## Coverage by Function

| Function | Test Cases | Status | Pass Rate |
|----------|-----------|--------|-----------|
| CREATE Cart | 1 | PASSED | 100% |
| ADD to Cart | 5 | PASSED | 100% |
| UPDATE Cart Item | 3 | PASSED | 100% |
| DELETE from Cart | 3 | PASSED | 100% |
| **TOTAL** | **12** | **PASSED** | **100%** |

---

## Test Dependencies Map

```
CC-001 (Create cart - baseline)
  ├─ CC-002 (Add to cart) → requires CC-001 cart.id
  ├─ CC-003 (Multiple items) → requires CC-001 cart.id
  │   └─ CC-011 (Delete all items) → requires CC-003 items
  └─ CC-010 (Delete single item) → requires CC-002 item.id

CC-004 (Stock validation - no add)
CC-005 (Quantity > 0 - no add)
CC-006 (Product exists - validation)

CC-007 (Update quantity) → requires CC-002 cart_item
  ├─ CC-008 (Update > stock - validation)
  └─ CC-009 (Update qty <= 0 - validation)

CC-012 (404 graceful delete)
```

---

## Key Validation Rules

| Rule | Type | Scope | Message | Impact |
|------|------|-------|---------|--------|
| stock >= quantity | Validation | ADD, UPDATE | Cannot exceed stock | Prevent overselling |
| quantity > 0 | Validation | ADD, UPDATE | Quantity must be positive | Prevent invalid cart items |
| product exists | Validation | ADD | Product must exist | Prevent ghost products |
| cart exists | Validation | ADD | Cart must exist | Link integrity |
| graceful 404 | Error handling | DELETE | Return null, not error | Prevent app crash |

---

## CRUD Operations Mapping

### CREATE
- **CC-001**: Create cart entity
- **CC-002**: Create cart_item (link product to cart)
- **CC-003**: Create multiple items in one cart

### READ (implied in tests via findOne/findMany)
- Implicit in delete verification (CC-010, CC-011, CC-012)

### UPDATE
- **CC-007**: Update cart_item quantity
- **CC-008**: Update validation (stock check)
- **CC-009**: Update validation (qty > 0)

### DELETE
- **CC-010**: Delete single cart_item
- **CC-011**: Delete multiple cart_items
- **CC-012**: Delete non-existent item (graceful)

---

## Integration Points

| Component | Integration | Test Case |
|-----------|-----------|-----------|
| Cart | Parent entity | CC-001, CC-002, CC-003 |
| CartItem | Child entity | CC-002, CC-003, CC-007, CC-010, CC-011 |
| Product | Referenced entity | CC-006, CC-004, CC-008 (stock check) |
| Stock | Product inventory | CC-004, CC-005, CC-008 |

