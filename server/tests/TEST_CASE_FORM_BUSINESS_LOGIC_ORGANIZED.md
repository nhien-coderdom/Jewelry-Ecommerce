# TEST CASE FORM - Business Logic Functions

## Code / Test requirement

| Code | Business Logic |
|------|---|
| Test requirement | Unit test các hàm tính toán giá cả, discount, VAT, stock, validation |
| Tester | QA Team |
| Pass | 33 |
| Fail | 0 |
| Untested | 0 |
| N/A | 0 |
| Number of Test cases | 33 |

---

## 1. TEST CASES - calculateOrderTotal (Tính tổng tiền đơn hàng)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-001 | Tính tổng tiền đúng cho nhiều items - Verify logic tính toán cơ bản: nhân từng item price với quantity rồi cộng lại. Test này đảm bảo hàm xử lý đúng với đơn hàng có nhiều sản phẩm khác nhau. Kỳ vọng: tổng = (100×2) + (200×1) + (50×3) = 550 đ | 1. Khởi tạo array items: [{ price: 100, quantity: 2 }, { price: 200, quantity: 1 }, { price: 50, quantity: 3 }]<br>2. Gọi calculateOrderTotal(items)<br>3. Verify tổng = (100*2) + (200*1) + (50*3) = 550 | Trả về 550 | Không có | PASS | 17-12-2025 | Normal case |
| BL-002 | Trả về 0 khi array items rỗng - Test edge case khi khách hàng có đơn hàng không chứa sản phẩm nào. Đây là tình huống hiếm nhưng cần được xử lý đúng để tránh error. Kỳ vọng: hàm trả về 0 thay vì error hoặc undefined | 1. Truyền array rỗng []<br>2. Gọi calculateOrderTotal([])<br>3. Verify kết quả | Trả về 0 | Không có | PASS | 17-12-2025 | Edge case |
| BL-003 | Throw error khi input không phải array - Test error handling: kiểm tra hàm có validate input type đúng không. Nếu input không phải array, hàm phải throw error với message rõ ràng. Điều này tránh bug khi dữ liệu bị corrupt hoặc gửi sai format | 1. Truyền input = string 'not array'<br>2. Gọi calculateOrderTotal('not array')<br>3. Verify error được throw | Throw Error: 'Items must be an array' | Không có | PASS | 17-12-2025 | Error handling |

---

## 2. TEST CASES - calculateDiscountedPrice (Tính giá sau discount)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-004 | Tính giá sau discount 20% đúng - Verify logic discount: giá gốc - (giá gốc × discount%). Test tính toán cơ bản với discount 20% trên giá 1000. Là case bình thường nhất khi khách hàng áp dụng coupon giảm giá. Kỳ vọng: 1000 × 80% = 800 | 1. Gọi calculateDiscountedPrice(1000, 20)<br>2. Verify: 1000 * (1 - 20/100) = 800 | Trả về 800 | Không có | PASS | 17-12-2025 | Normal case |
| BL-005 | Trả về giá gốc khi discount = 0 - Test edge case: khi không có discount nào (discount = 0%), hàm phải trả về đúng giá gốc. Đây là boundary condition quan trọng để kiểm tra logic không bị lỗi khi discount = 0 | 1. Gọi calculateDiscountedPrice(500, 0)<br>2. Verify giá không thay đổi | Trả về 500 | Không có | PASS | 17-12-2025 | Edge case |
| BL-006 | Trả về 0 khi discount = 100% - Test boundary case: discount tối đa là 100% (miễn phí hoàn toàn). Kiểm tra logic không bị lỗi tính toán ở giới hạn cao nhất. Kỳ vọng: giá sau discount = 0 | 1. Gọi calculateDiscountedPrice(1000, 100)<br>2. Verify kết quả | Trả về 0 | Không có | PASS | 17-12-2025 | Edge case |
| BL-007 | Throw error khi giá âm - Test error handling: giá sản phẩm không bao giờ được âm trong business logic. Hàm phải validate và throw error nếu nhận giá âm, tránh tính toán sai lệch | 1. Gọi calculateDiscountedPrice(-100, 10)<br>2. Verify error được throw | Throw Error: 'Price cannot be negative' | Không có | PASS | 17-12-2025 | Error handling |
| BL-008 | Throw error khi discount > 100 - Test validation: discount phần trăm phải nằm trong khoảng 0-100. Nếu > 100%, đó là invalid data. Hàm phải reject và báo lỗi để bảo vệ data integrity | 1. Gọi calculateDiscountedPrice(1000, 150)<br>2. Verify error được throw | Throw Error: 'Discount must be between 0 and 100' | Không có | PASS | 17-12-2025 | Error handling |

---

## 3. TEST CASES - calculateVAT (Tính VAT)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-009 | Tính VAT 10% và tổng giá đúng - Verify logic tính thuế VAT: hàm tính VAT amount và tổng giá (subtotal + VAT). Test case bình thường với VAT 10% trên giá 1000. Kỳ vọng: VAT = 100, total = 1100 | 1. Gọi calculateVAT(1000, 10)<br>2. Verify VAT = 1000 * 10% = 100<br>3. Verify total = 1100 | { vat: 100, total: 1100 } | Không có | PASS | 17-12-2025 | Normal case |
| BL-010 | Dùng VAT mặc định 10% - Test default parameter: khi không truyền VAT rate, hàm phải dùng giá trị mặc định 10%. Điều này đảm bảo không throw error khi parameter thiếu. Phụ thuộc BL-009 để verify default giống explicit value | 1. Gọi calculateVAT(1000) không truyền rate<br>2. Verify default = 10%<br>3. Verify tính toán đúng | { vat: 100, total: 1100 } | Phụ thuộc BL-009 | PASS | 17-12-2025 | Default parameter |
| BL-011 | Throw error khi subtotal âm - Test input validation: subtotal (tổng tiền trước thuế) không bao giờ âm. Hàm phải check input và throw error nếu subtotal < 0 để prevent invalid calculations | 1. Gọi calculateVAT(-1000)<br>2. Verify error được throw | Throw Error: 'Subtotal cannot be negative' | Không có | PASS | 17-12-2025 | Error handling |

---

## 4. TEST CASES - checkStockAvailable (Kiểm tra stock có đủ)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-012 | Trả về true khi stock đủ - Verify logic kiểm tra stock: hàm trả về true khi kho có đủ sản phẩm cho đơn hàng. Test case bình thường: stock hiện tại 10, khách mua 5, sufficient. Kỳ vọng: true (có đủ) | 1. Gọi checkStockAvailable(10, 5)<br>2. Verify: stock (10) >= quantity (5) | Trả về true | Không có | PASS | 17-12-2025 | Normal case |
| BL-013 | Trả về true khi stock bằng đúng số lượng - Test boundary condition: khi stock = quantity (bằng nhau hoàn toàn), đơn hàng vẫn có thể được xử lý (stock không thiếu). Kiểm tra logic >= operator đúng | 1. Gọi checkStockAvailable(5, 5)<br>2. Verify: stock == quantity | Trả về true | Không có | PASS | 17-12-2025 | Edge case |
| BL-014 | Trả về false khi stock không đủ - Test failure case: khi stock < quantity, đơn hàng không thể fulfill, hàm trả về false. Điều này trigger để hiển thị error message cho khách hoặc reject order | 1. Gọi checkStockAvailable(3, 10)<br>2. Verify: stock (3) < quantity (10) | Trả về false | Không có | PASS | 17-12-2025 | Edge case |
| BL-015 | Throw error khi stock âm - Test validation: stock quantity không thể âm (không tồn tại sản phẩm âm). Hàm phải validate input và throw error. Điều này bảo vệ database integrity | 1. Gọi checkStockAvailable(-5, 10)<br>2. Verify error được throw | Throw Error: 'Stock cannot be negative' | Không có | PASS | 17-12-2025 | Error handling |

---

## 5. TEST CASES - isLowStock (Cảnh báo stock thấp)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-016 | Cảnh báo khi stock < threshold - Verify low stock warning: hàm trả về true khi stock thấp hơn ngưỡng (threshold). Dùng để cảnh báo manager reorder sản phẩm trước khi hết. Test: stock 3 < threshold 5, kỳ vọng true | 1. Gọi isLowStock(3, 5)<br>2. Verify: stock (3) < threshold (5) | Trả về true | Không có | PASS | 17-12-2025 | Normal case |
| BL-017 | Dùng threshold mặc định = 5 - Test default parameter: khi không truyền threshold, hàm dùng default 5. Tức là cảnh báo khi stock <= 5 units. Phụ thuộc BL-016 để verify default threshold đúng | 1. Gọi isLowStock(3) không truyền threshold<br>2. Verify default = 5<br>3. Verify: 3 < 5 = true | Trả về true | Phụ thuộc BL-016 | PASS | 17-12-2025 | Default parameter |
| BL-018 | Không cảnh báo khi stock >= threshold - Test normal stock level: khi stock >= threshold, không cần cảnh báo reorder. Hàm trả về false, business as usual. Test: stock 10 >= threshold 5, kỳ vọng false | 1. Gọi isLowStock(10, 5)<br>2. Verify: stock (10) >= threshold (5) | Trả về false | Không có | PASS | 17-12-2025 | Normal case |

---

## 6. TEST CASES - calculateNewStock (Tính stock mới)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-019 | Tính stock mới đúng - Verify stock deduction logic: khi order confirm, stock hiện tại bị trừ đi số lượng order. Test: stock 10 - quantity 3 = 7. Đây là update inventory sau khi bán hàng | 1. Gọi calculateNewStock(10, 3)<br>2. Verify: newStock = 10 - 3 = 7 | Trả về 7 | Không có | PASS | 17-12-2025 | Normal case |
| BL-020 | Cho phép stock về 0 - Test boundary: khi stock = quantity (bán hết), kết quả là 0 (stock empty, allowed). Hàm không throw error khi stock = 0 (khác với negative). Kiểm tra >= 0 logic đúng | 1. Gọi calculateNewStock(5, 5)<br>2. Verify: newStock = 5 - 5 = 0 | Trả về 0 | Không có | PASS | 17-12-2025 | Edge case |
| BL-021 | Throw error khi stock không đủ - Test safety check: hàm không cho phép stock âm. Nếu quantity > current stock, throw error immediately. Ngăn data corruption nếu update logic có bug | 1. Gọi calculateNewStock(3, 10)<br>2. Verify: current stock < quantity<br>3. Verify error được throw | Throw Error: 'Not enough stock' | Không có | PASS | 17-12-2025 | Error handling |

---

## 7. TEST CASES - validateOrderData (Kiểm tra dữ liệu đơn hàng)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-022 | Validate thành công với order data hợp lệ - Test full order validation: kiểm tra tất cả fields của order (user ID, products, items, total). Đây là success case - data đầy đủ, correct format, ready to save. Kỳ vọng: isValid=true, errors=[] | 1. Chuẩn bị data: clerkUserId, products[], order_items[], total<br>2. Gọi validateOrderData(validData)<br>3. Verify isValid = true, errors = [] | isValid: true, errors: [] | Không có | PASS | 17-12-2025 | Normal case |
| BL-023 | Fail khi thiếu clerkUserId - Test required field validation: clerkUserId (khách hàng ID từ Clerk auth) bắt buộc. Nếu thiếu, không biết ai đặt hàng. Phụ thuộc BL-022 baseline, kỳ vọng: error message = 'clerkUserId is required' | 1. Chuẩn bị data không có clerkUserId<br>2. Gọi validateOrderData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'clerkUserId is required' | Phụ thuộc BL-022 | PASS | 17-12-2025 | Validation |
| BL-024 | Fail khi products rỗng - Test required array validation: products array không thể trống (order phải có ít nhất 1 sản phẩm). Nếu [], là invalid order. Phụ thuộc BL-022, kỳ vọng: error = 'products array is required and must not be empty' | 1. Chuẩn bị data với products: []<br>2. Gọi validateOrderData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'products array is required and must not be empty' | Phụ thuộc BL-022 | PASS | 17-12-2025 | Validation |
| BL-025 | Fail khi total âm - Test amount validation: total (tổng tiền đơn hàng) không thể âm. Nếu âm, là invalid data hoặc sign error trong calculation. Phụ thuộc BL-022, kỳ vọng: error = 'total cannot be negative' | 1. Chuẩn bị data với total: -100<br>2. Gọi validateOrderData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'total cannot be negative' | Phụ thuộc BL-022 | PASS | 17-12-2025 | Validation |

---

## 8. TEST CASES - validateProductData (Kiểm tra dữ liệu sản phẩm)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-026 | Validate thành công với product data hợp lệ - Test product validation success: kiểm tra tất cả product fields (title/name, price, stock). Đây là baseline - all required fields present, proper values. Kỳ vọng: isValid=true, errors=[] | 1. Chuẩn bị data: title, price, stock<br>2. Gọi validateProductData(validData)<br>3. Verify isValid = true, errors = [] | isValid: true, errors: [] | Không có | PASS | 17-12-2025 | Normal case |
| BL-027 | Fail khi thiếu title - Test required field: title (tên sản phẩm) bắt buộc. Không có tên thì không thể hiển thị sản phẩm cho khách. Phụ thuộc BL-026, kỳ vọng: error = 'title is required' | 1. Chuẩn bị data không có title<br>2. Gọi validateProductData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'title is required' | Phụ thuộc BL-026 | PASS | 17-12-2025 | Validation |
| BL-028 | Fail khi price âm - Test price validation: price phải >= 0 (không thể là giá âm). Âm = business logic error hoặc data corruption. Phụ thuộc BL-026, kỳ vọng: error = 'price must be >= 0' | 1. Chuẩn bị data với price: -100<br>2. Gọi validateProductData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'price must be >= 0' | Phụ thuộc BL-026 | PASS | 17-12-2025 | Validation |
| BL-029 | Fail khi stock âm - Test stock quantity validation: stock phải >= 0 (không tồn tại quantity âm). Âm = inventory data corruption. Phụ thuộc BL-026, kỳ vọng: error = 'stock must be >= 0' | 1. Chuẩn bị data với stock: -5<br>2. Gọi validateProductData(invalidData)<br>3. Verify error message đúng | isValid: false, errors contain 'stock must be >= 0' | Phụ thuộc BL-026 | PASS | 17-12-2025 | Validation |

---

## 9. TEST CASES - formatPrice (Định dạng giá tiền)

| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependencies | Result | Test date | Note |
|-----|-----|-----|-----|-----|-----|-----|-----|
| BL-030 | Format VND đúng - Test Vietnamese Dong formatting: 1.000.000 VND = 1 triệu đồng. Kiểm tra formatting: 1000000 -> '1.000.000 ₫' với separator '.' và symbol '₫'. Dùng khi hiển thị giá cho khách hàng Việt | 1. Gọi formatPrice(1000000, 'VND')<br>2. Verify format = '1.000.000 ₫' | '1.000.000 ₫' | Không có | PASS | 17-12-2025 | Normal case |
| BL-031 | Format USD đúng - Test US Dollar formatting: 99.5 USD = $99.50. Kiểm tra formatting: 99.5 -> '$99.50' với symbol '$' prefix và 2 decimal places. Dùng khi hiển thị giá cho khách hàng quốc tế | 1. Gọi formatPrice(99.5, 'USD')<br>2. Verify format = '$99.50' | '$99.50' | Không có | PASS | 17-12-2025 | Normal case |
| BL-032 | Dùng VND mặc định - Test default currency: khi không truyền currency parameter, hàm dùng default VND (vì target market là Việt Nam). Phụ thuộc BL-030, kỳ vọng: output chứa symbol '₫' | 1. Gọi formatPrice(500000) không truyền currency<br>2. Verify default = VND<br>3. Verify output chứa ₫ | Output chứa '₫' | Phụ thuộc BL-030 | PASS | 17-12-2025 | Default parameter |
| BL-033 | Throw error khi input không phải number - Test type validation: price input phải là number (int hoặc float). Nếu string/null/undefined, throw error. Bảo vệ function logic từ invalid types | 1. Gọi formatPrice('not a number')<br>2. Verify error được throw | Throw Error: 'Price must be a number' | Không có | PASS | 17-12-2025 | Error handling |

---

## Test Execution Summary

| Metrics | Value |
|---------|-------|
| Total Test Cases | 33 |
| PASSED | 33 |
| FAILED | 0 |
| Pass Rate | 100% |
| Execution Date | 17-12-2025 |
| Tester | QA Team |

---

## Coverage by Function

| Function | Test Cases | Status | Pass Rate |
|----------|-----------|--------|-----------|
| calculateOrderTotal | 3 | PASSED | 100% |
| calculateDiscountedPrice | 5 | PASSED | 100% |
| calculateVAT | 3 | PASSED | 100% |
| checkStockAvailable | 4 | PASSED | 100% |
| isLowStock | 3 | PASSED | 100% |
| calculateNewStock | 3 | PASSED | 100% |
| validateOrderData | 4 | PASSED | 100% |
| validateProductData | 4 | PASSED | 100% |
| formatPrice | 4 | PASSED | 100% |
| **TOTAL** | **33** | **PASSED** | **100%** |
