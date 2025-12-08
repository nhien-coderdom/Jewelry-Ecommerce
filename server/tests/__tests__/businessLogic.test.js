/**
 * 🧪 Unit Tests cho Business Logic - Xử lý giá cả
 * Test các hàm tính toán giá cả, discount, VAT, stock
 * KHÔNG cần database - CHỈ test logic thuần
 */

const {
  calculateOrderTotal,
  calculateDiscountedPrice,
  calculateVAT,
  checkStockAvailable,
  isLowStock,
  calculateNewStock,
  validateOrderData,
  validateProductData,
  formatPrice,
} = require('../../src/utils/businessLogic');

describe('💰 Tính toán giá cả', () => {
  describe('calculateOrderTotal', () => {
    it('✅ Nên tính tổng tiền đúng cho nhiều items', () => {
      const items = [
        { price: 100, quantity: 2 },  // 200
        { price: 200, quantity: 1 },  // 200
        { price: 50, quantity: 3 },   // 150
      ];

      const total = calculateOrderTotal(items);

      expect(total).toBe(550);
    });

    it('✅ Nên trả về 0 khi array rỗng', () => {
      expect(calculateOrderTotal([])).toBe(0);
    });

    it('❌ Nên throw error khi input không phải array', () => {
      expect(() => calculateOrderTotal('not array')).toThrow('Items must be an array');
    });
  });

  describe('calculateDiscountedPrice', () => {
    it('✅ Nên tính giá sale 20% đúng', () => {
      const result = calculateDiscountedPrice(1000, 20);
      expect(result).toBe(800);
    });

    it('✅ Nên trả về giá gốc khi discount = 0', () => {
      expect(calculateDiscountedPrice(500, 0)).toBe(500);
    });

    it('✅ Nên trả về 0 khi discount = 100%', () => {
      expect(calculateDiscountedPrice(1000, 100)).toBe(0);
    });

    it('❌ Nên throw error khi giá âm', () => {
      expect(() => calculateDiscountedPrice(-100, 10)).toThrow('Price cannot be negative');
    });

    it('❌ Nên throw error khi discount > 100', () => {
      expect(() => calculateDiscountedPrice(1000, 150)).toThrow('Discount must be between 0 and 100');
    });
  });

  describe('calculateVAT', () => {
    it('✅ Nên tính VAT 10% đúng', () => {
      const result = calculateVAT(1000, 10);
      
      expect(result.vat).toBe(100);
      expect(result.total).toBe(1100);
    });

    it('✅ Nên dùng VAT mặc định 10% khi không truyền', () => {
      const result = calculateVAT(1000);
      
      expect(result.vat).toBe(100);
      expect(result.total).toBe(1100);
    });

    it('❌ Nên throw error khi subtotal âm', () => {
      expect(() => calculateVAT(-1000)).toThrow('Subtotal cannot be negative');
    });
  });
});

describe('📦 Quản lý Stock', () => {
  describe('checkStockAvailable', () => {
    it('✅ Nên trả về true khi stock đủ', () => {
      expect(checkStockAvailable(10, 5)).toBe(true);
    });

    it('✅ Nên trả về true khi stock bằng đúng số lượng cần', () => {
      expect(checkStockAvailable(5, 5)).toBe(true);
    });

    it('❌ Nên trả về false khi stock không đủ', () => {
      expect(checkStockAvailable(3, 10)).toBe(false);
    });

    it('❌ Nên throw error khi stock âm', () => {
      expect(() => checkStockAvailable(-5, 10)).toThrow('Stock cannot be negative');
    });
  });

  describe('isLowStock', () => {
    it('✅ Nên cảnh báo khi stock < threshold', () => {
      expect(isLowStock(3, 5)).toBe(true);
    });

    it('✅ Nên dùng threshold mặc định = 5', () => {
      expect(isLowStock(3)).toBe(true);
      expect(isLowStock(10)).toBe(false);
    });

    it('❌ Nên không cảnh báo khi stock >= threshold', () => {
      expect(isLowStock(10, 5)).toBe(false);
    });
  });

  describe('calculateNewStock', () => {
    it('✅ Nên tính stock mới đúng', () => {
      expect(calculateNewStock(10, 3)).toBe(7);
    });

    it('✅ Nên cho phép stock về 0', () => {
      expect(calculateNewStock(5, 5)).toBe(0);
    });

    it('❌ Nên throw error khi stock không đủ', () => {
      expect(() => calculateNewStock(3, 10)).toThrow('Not enough stock');
    });
  });
});

describe('✅ Validation', () => {
  describe('validateOrderData', () => {
    it('✅ Nên validate thành công với data hợp lệ', () => {
      const validData = {
        clerkUserId: 'user_123',
        products: [1, 2, 3],
        order_items: [
          { product: 1, quantity: 2 }
        ],
        total: 500
      };

      const result = validateOrderData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('❌ Nên fail khi thiếu clerkUserId', () => {
      const invalidData = {
        products: [1],
        order_items: [{ product: 1, quantity: 1 }]
      };

      const result = validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('clerkUserId is required');
    });

    it('❌ Nên fail khi products rỗng', () => {
      const invalidData = {
        clerkUserId: 'user_123',
        products: [],
        order_items: [{ product: 1, quantity: 1 }]
      };

      const result = validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('products array is required and must not be empty');
    });

    it('❌ Nên fail khi total âm', () => {
      const invalidData = {
        clerkUserId: 'user_123',
        products: [1],
        order_items: [{ product: 1, quantity: 1 }],
        total: -100
      };

      const result = validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('total cannot be negative');
    });
  });

  describe('validateProductData', () => {
    it('✅ Nên validate thành công với data hợp lệ', () => {
      const validData = {
        title: 'Diamond Ring',
        price: 5000,
        stock: 10
      };

      const result = validateProductData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('❌ Nên fail khi thiếu title', () => {
      const invalidData = {
        price: 1000,
        stock: 5
      };

      const result = validateProductData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('title is required');
    });

    it('❌ Nên fail khi price âm', () => {
      const invalidData = {
        title: 'Product',
        price: -100,
        stock: 5
      };

      const result = validateProductData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('price must be >= 0');
    });

    it('❌ Nên fail khi stock âm', () => {
      const invalidData = {
        title: 'Product',
        price: 100,
        stock: -5
      };

      const result = validateProductData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('stock must be >= 0');
    });
  });
});

describe('🔢 Format giá tiền', () => {
  describe('formatPrice', () => {
    it('✅ Nên format VND đúng', () => {
      const result = formatPrice(1000000, 'VND');
      expect(result).toBe('1.000.000 ₫');
    });

    it('✅ Nên format USD đúng', () => {
      const result = formatPrice(99.5, 'USD');
      expect(result).toBe('$99.50');
    });

    it('✅ Nên dùng VND mặc định', () => {
      const result = formatPrice(500000);
      expect(result).toContain('₫');
    });

    it('❌ Nên throw error khi input không phải number', () => {
      expect(() => formatPrice('not a number')).toThrow('Price must be a number');
    });
  });
});
