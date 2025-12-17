import re

file = r'd:\Test\Jewelry-Ecommerce\server\tests\__tests__\checkout.test.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace emoji with labels
replacements = [
    ("it('❌ Validation:", "it('ERROR_HANDLING: Validation:"),
    ("it('✅ Validation:", "it('PASS: Validation:"),
    ("it('✅ Nên check", "it('PASS: Nên check"),
    ("it('❌ Nên phát", "it('ERROR_HANDLING: Nên phát"),
    ("it('❌ Nên detect", "it('ERROR_HANDLING: Nên detect"),
    ("it('✅ Nên validate", "it('PASS: Nên validate"),
    ("describe('📦 Check", "describe('CHECK_STOCK: Check"),
    ("describe('💰 ", "describe('CALCULATE: "),
    ("describe('💳 ", "describe('PAYMENT: "),
    ("describe('📋 ", "describe('CREATE_ORDER: "),
    ("describe('🗑️ ", "describe('CLEAR_CART: "),
    ("describe('❌ Error", "describe('ERROR_HANDLING: Error"),
    ("describe('🔄 ", "describe('INTEGRATION: "),
    ("it('✅ Nên tính", "it('PASS: Nên tính"),
    ("it('✅ Nên accept", "it('PASS: Nên accept"),
    ("it('❌ Nên reject", "it('ERROR_HANDLING: Nên reject"),
    ("it('✅ Nên xử lý", "it('PASS: Nên xử lý"),
    ("it('✅ Nên tạo", "it('PASS: Nên tạo"),
    ("it('✅ Nên update", "it('PASS: Nên update"),
    ("it('✅ Nên xóa", "it('PASS: Nên xóa"),
    ("it('✅ Nên giữ", "it('PASS: Nên giữ"),
    ("it('❌ Nên throw", "it('ERROR_HANDLING: Nên throw"),
    ("it('❌ Nên handle", "it('ERROR_HANDLING: Nên handle"),
    ("it('✅ Nên hoàn", "it('PASS: Nên hoàn"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ Checkout.test.js cleaned successfully')
