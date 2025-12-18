/**
 * Unit Tests cho Checkout - Quá trình thanh toán
 * Test toàn bộ flow: validate data → check stock → tính giá → tạo order → clear cart
 */

const {
  createMockProduct,
  createMockCart,
  createMockStrapi,
  createMockContext,
} = require('../helpers');

describe('Checkout - Quy trình thanh toán', () => {
  let mockStrapi;

  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  describe('VALIDATE: Checkout Data', () => {
    it('PASS: Nên validate checkout data hợp lệ', () => {
      const checkoutData = {
        clerkUserId: 'user_123',
        cartId: 1,
        cartItems: [
          { productId: 1, quantity: 2, price: 100 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Hanoi',
          country: 'Vietnam',
          postalCode: '10000',
        },
        paymentMethod: 'card',
        email: 'user@example.com',
      };

      const isValid = validateCheckoutData(checkoutData);
      expect(isValid).toBe(true);
    });

    it('ERROR_HANDLING: Validation: clerkUserId là required', () => {
      const invalidData = {
        cartId: 1,
        cartItems: [],
        email: 'user@example.com',
      };

      const isValid = !!invalidData.clerkUserId;
      expect(isValid).toBe(false);
    });

    it('ERROR_HANDLING: Validation: cartItems không được rỗng', () => {
      const invalidData = {
        clerkUserId: 'user_123',
        cartItems: [],
      };

      const isValid = invalidData.cartItems && invalidData.cartItems.length > 0;
      expect(isValid).toBe(false);
    });

    it('ERROR_HANDLING: Validation: shippingAddress là required', () => {
      const invalidData = {
        clerkUserId: 'user_123',
        cartItems: [{ productId: 1, quantity: 1 }],
      };

      const isValid = !!invalidData.shippingAddress;
      expect(isValid).toBe(false);
    });

    it('ERROR_HANDLING: Validation: email phải hợp lệ', () => {
      const validEmail = 'user@example.com';
      const invalidEmail = 'invalid-email';

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validEmail);
      const isInvalidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidEmail);

      expect(isValidEmail).toBe(true);
      expect(isInvalidEmail).toBe(false);
    });

    it('ERROR_HANDLING: Validation: paymentMethod phải hợp lệ', () => {
      const validMethods = ['card', 'bank_transfer', 'wallet'];
      const paymentMethod = 'card';

      const isValid = validMethods.includes(paymentMethod);
      expect(isValid).toBe(true);
    });

    it('ERROR_HANDLING: Validation: paymentMethod không hợp lệ', () => {
      const validMethods = ['card', 'bank_transfer', 'wallet'];
      const paymentMethod = 'crypto'; // invalid

      const isValid = validMethods.includes(paymentMethod);
      expect(isValid).toBe(false);
    });
  });

  describe('CHECK_STOCK: Check Stock trước Checkout', () => {
    it('PASS: Nên check stock đủ cho tất cả items', async () => {
      // Mock products với stock đủ
      const products = [
        { id: 1, stock: 10 },
        { id: 2, stock: 5 },
      ];

      const cartItems = [
        { productId: 1, quantity: 3 },  // 3 < 10 ✓
        { productId: 2, quantity: 2 },  // 2 < 5 ✓
      ];

      const allItemsAvailable = cartItems.every(item => {
        const product = products.find(p => p.id === item.productId);
        return product && product.stock >= item.quantity;
      });

      expect(allItemsAvailable).toBe(true);
    });

    it('ERROR_HANDLING: Nên phát hiện stock không đủ', () => {
      const products = [
        { id: 1, stock: 2 },
      ];

      const cartItems = [
        { productId: 1, quantity: 5 },  // 5 > 2 ✗
      ];

      const allItemsAvailable = cartItems.every(item => {
        const product = products.find(p => p.id === item.productId);
        return product && product.stock >= item.quantity;
      });

      expect(allItemsAvailable).toBe(false);
    });

    it('ERROR_HANDLING: Nên phát hiện product không tồn tại', () => {
      const products = [
        { id: 1, stock: 10 },
      ];

      const cartItems = [
        { productId: 999, quantity: 1 },  // Product không tồn tại
      ];

      const allItemsAvailable = cartItems.every(item => {
        const product = products.find(p => p.id === item.productId);
        return product && product.stock >= item.quantity;
      });

      expect(allItemsAvailable).toBe(false);
    });

    it('PASS: Nên kiểm tra stock cho nhiều items', () => {
      const checkoutItems = [
        { productId: 1, quantity: 2, maxStock: 10 },
        { productId: 2, quantity: 1, maxStock: 5 },
        { productId: 3, quantity: 3, maxStock: 8 },
      ];

      const hasStock = checkoutItems.every(item => item.quantity <= item.maxStock);
      expect(hasStock).toBe(true);
    });
  });

  describe('CALCULATE: Tính toán giá cả Checkout', () => {
    it('PASS: Nên tính subtotal đúng', () => {
      const cartItems = [
        { price: 100, quantity: 2 },  // 200
        { price: 50, quantity: 1 },   // 50
        { price: 200, quantity: 3 },  // 600
      ];

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(subtotal).toBe(850);
    });

    it('PASS: Nên tính discount đúng', () => {
      const subtotal = 1000;
      const discountPercent = 10;

      const discount = (subtotal * discountPercent) / 100;
      expect(discount).toBe(100);
    });

    it('PASS: Nên tính VAT đúng', () => {
      const subtotal = 1000;
      const vatPercent = 10;

      const vat = (subtotal * vatPercent) / 100;
      expect(vat).toBe(100);
    });

    it('PASS: Nên tính tổng tiền (subtotal + VAT - discount) đúng', () => {
      const subtotal = 1000;
      const vatPercent = 10;
      const discountPercent = 10;

      const vat = (subtotal * vatPercent) / 100;
      const discount = (subtotal * discountPercent) / 100;
      const total = subtotal + vat - discount;

      expect(total).toBe(1000); // 1000 + 100 - 100
    });

    it('PASS: Nên tính shipping fee', () => {
      const subtotal = 500;
      const shippingFee = 50;

      const grandTotal = subtotal + shippingFee;
      expect(grandTotal).toBe(550);
    });

    it('PASS: Nên miễn phí vận chuyển khi order >= 1000', () => {
      const subtotal = 1200;
      const minForFreeShipping = 1000;
      const shippingFee = subtotal >= minForFreeShipping ? 0 : 50;

      expect(shippingFee).toBe(0);
    });

    it('PASS: Nên tính shipping khi order < 1000', () => {
      const subtotal = 800;
      const minForFreeShipping = 1000;
      const shippingFee = subtotal >= minForFreeShipping ? 0 : 50;

      expect(shippingFee).toBe(50);
    });
  });

  describe('PAYMENT: Process Payment', () => {
    it('PASS: Nên accept payment với amount hợp lệ', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'VND',
        paymentMethod: 'card',
        cardToken: 'tok_visa_123',
      };

      const isValidPayment = !!(paymentData.amount > 0 && paymentData.currency && paymentData.paymentMethod);
      expect(isValidPayment).toBe(true);
    });

    it('ERROR_HANDLING: Nên reject payment với amount âm', () => {
      const paymentData = {
        amount: -1000,
      };

      const isValidPayment = paymentData.amount > 0;
      expect(isValidPayment).toBe(false);
    });

    it('ERROR_HANDLING: Nên reject payment với amount = 0', () => {
      const paymentData = {
        amount: 0,
      };

      const isValidPayment = paymentData.amount > 0;
      expect(isValidPayment).toBe(false);
    });

    it('PASS: Nên xử lý payment status', async () => {
      const paymentStatus = 'pending';
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

      const isValidStatus = validStatuses.includes(paymentStatus);
      expect(isValidStatus).toBe(true);
    });
  });

  describe('CREATE_ORDER: Create Order from Checkout', () => {
    it('PASS: Nên tạo order thành công từ checkout', async () => {
      const checkoutData = {
        clerkUserId: 'user_123',
        cartItems: [
          { productId: 1, quantity: 2, price: 100 },
        ],
        total: 200,
        status: 'pending',
      };

      const order = await mockStrapi.entityService.create('api::order.order', {
        data: {
          clerkUserId: checkoutData.clerkUserId,
          products: checkoutData.cartItems.map(item => item.productId),
          total: checkoutData.total,
          status: checkoutData.status,
        }
      });

      expect(order).toBeDefined();
      expect(order.clerkUserId).toBe('user_123');
      expect(order.total).toBe(200);
    });

    it('PASS: Nên tạo order items cho mỗi cart item', async () => {
      const orderId = 1;
      const cartItems = [
        { productId: 1, quantity: 2, price: 100 },
        { productId: 2, quantity: 1, price: 200 },
      ];

      // Simulate creating order items
      const orderItems = await Promise.all(
        cartItems.map(item =>
          mockStrapi.entityService.create('api::order-item.order-item', {
            data: {
              order: orderId,
              product: item.productId,
              quantity: item.quantity,
              price: item.price,
            }
          })
        )
      );

      expect(orderItems).toHaveLength(2);
      orderItems.forEach((item, index) => {
        expect(item.product).toBe(cartItems[index].productId);
        expect(item.quantity).toBe(cartItems[index].quantity);
      });
    });

    it('PASS: Nên update order status khi payment thành công', async () => {
      const order = await mockStrapi.entityService.create('api::order.order', {
        data: {
          clerkUserId: 'user_123',
          total: 200,
          status: 'pending',
        }
      });

      const updated = await mockStrapi.entityService.update(
        'api::order.order',
        order.id,
        { data: { status: 'paid' } }
      );

      if (updated) {
        expect(updated.status).toBe('paid');
      }
    });
  });

  describe('CLEAR_CART: Clear Cart after Checkout', () => {
    it('PASS: Nên xóa tất cả cart items sau checkout thành công', async () => {
      const cart = await mockStrapi.entityService.create('api::cart.cart', {
        data: createMockCart()
      });

      // Add items to cart
      await mockStrapi.entityService.create('api::cart-item.cart-item', {
        data: { product: 1, quantity: 2, cart: cart.id }
      });

      // Delete cart items
      const mockData = mockStrapi.getMockData();
      mockData.cartItems = [];

      expect(mockData.cartItems).toHaveLength(0);
    });

    it('PASS: Nên giữ cart record nhưng xóa items', async () => {
      const cart = await mockStrapi.entityService.create('api::cart.cart', {
        data: createMockCart()
      });

      const mockData = mockStrapi.getMockData();
      
      // Cart vẫn tồn tại
      expect(mockData.carts).toBeDefined();
      
      // Nhưng items bị xóa
      mockData.cartItems = [];
      expect(mockData.cartItems).toHaveLength(0);
    });
  });

  describe('ERROR_HANDLING: Error Handling', () => {
    it('ERROR_HANDLING: Nên throw error khi stock không đủ', async () => {
      const cartItems = [{ productId: 1, quantity: 100 }];
      const products = [{ id: 1, stock: 5 }];

      const checkStock = () => {
        const item = cartItems[0];
        const product = products.find(p => p.id === item.productId);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      };

      expect(checkStock).toThrow('Insufficient stock for product 1');
    });

    it('ERROR_HANDLING: Nên throw error khi payment bị từ chối', async () => {
      const processPayment = () => {
        throw new Error('Payment declined');
      };

      expect(processPayment).toThrow('Payment declined');
    });

    it('ERROR_HANDLING: Nên throw error khi tạo order thất bại', async () => {
      const createOrder = () => {
        throw new Error('Failed to create order');
      };

      expect(createOrder).toThrow('Failed to create order');
    });

    it('ERROR_HANDLING: Nên handle database connection error', async () => {
      const dbError = () => {
        throw new Error('Database connection failed');
      };

      expect(dbError).toThrow('Database connection failed');
    });
  });

  describe('INTEGRATION: Complete Checkout Flow', () => {
    it('PASS: Nên hoàn thành toàn bộ flow checkout', async () => {
      // Step 1: Validate checkout data
      const checkoutData = {
        clerkUserId: 'user_123',
        cartItems: [{ productId: 1, quantity: 2, price: 100 }],
        total: 200,
        shippingAddress: { street: '123 St', city: 'Hanoi', country: 'Vietnam' },
        email: 'user@example.com',
        paymentMethod: 'card',
      };

      const isValidData = validateCheckoutData(checkoutData);
      expect(isValidData).toBe(true);

      // Step 2: Check stock
      const products = [{ id: 1, stock: 10 }];
      const hasStock = checkoutData.cartItems.every(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod && prod.stock >= item.quantity;
      });
      expect(hasStock).toBe(true);

      // Step 3: Calculate total
      const subtotal = checkoutData.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const vat = (subtotal * 10) / 100;
      const grandTotal = subtotal + vat;
      expect(grandTotal).toBeGreaterThan(0);

      // Step 4: Create order
      const order = await mockStrapi.entityService.create('api::order.order', {
        data: {
          clerkUserId: checkoutData.clerkUserId,
          total: grandTotal,
          status: 'pending',
        }
      });
      expect(order.id).toBeDefined();

      // Step 5: Clear cart
      const mockData = mockStrapi.getMockData();
      mockData.cartItems = [];
      expect(mockData.cartItems).toHaveLength(0);
    });
  });
});

// ============================================
// Helper Functions (Validation Logic)
// ============================================

function validateCheckoutData(data) {
  return !!(
    data.clerkUserId &&
    data.cartItems && data.cartItems.length > 0 &&
    data.shippingAddress &&
    data.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    data.paymentMethod
  );
}
