/**
 * 🛠️ Test Helpers
 * Các hàm tiện ích để tạo MOCK DATA cho testing
 */

/**
 * 🎭 Tạo mock product data
 */
function createMockProduct(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    title: 'Test Product',
    description: 'Test Description',
    price: 1000,
    stock: 10,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * 🎭 Tạo mock order data
 */
function createMockOrder(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    clerkUserId: 'test_user_123',
    products: [1, 2],
    order_items: [
      { product: 1, quantity: 2, price_at_time: 100 },
      { product: 2, quantity: 1, price_at_time: 200 }
    ],
    total: 400,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * 🎭 Tạo mock cart data
 */
function createMockCart(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    email: 'test@example.com',
    username: 'testuser',
    cart_items: [],
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * 🎭 Tạo mock cart items
 */
function createMockCartItems(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    product: i + 1,
    quantity: i + 1,
    price: (i + 1) * 100
  }));
}

/**
 * 🎭 Mock Strapi entityService
 */
function createMockStrapi() {
  const mockData = {
    products: [],
    orders: [],
    carts: [],
    cartItems: []
  };

  return {
    // Mock contentType function (cần cho createCoreController)
    contentType: jest.fn((uid) => ({
      uid,
      kind: 'collectionType',
      modelName: uid.split('.').pop(),
    })),

    entityService: {
      create: jest.fn((contentType, { data }) => {
        const entity = { id: Math.floor(Math.random() * 10000), ...data };
        
        if (contentType.includes('product')) {
          mockData.products.push(entity);
        } else if (contentType.includes('order')) {
          mockData.orders.push(entity);
        } else if (contentType.includes('cart-item')) {
          mockData.cartItems.push(entity);
        } else if (contentType.includes('cart')) {
          mockData.carts.push(entity);
        }
        
        return Promise.resolve(entity);
      }),

      findOne: jest.fn((contentType, id) => {
        let items = [];
        if (contentType.includes('product')) items = mockData.products;
        else if (contentType.includes('order')) items = mockData.orders;
        else if (contentType.includes('cart')) items = mockData.carts;
        else if (contentType.includes('cart-item')) items = mockData.cartItems;
        
        return Promise.resolve(items.find(item => item.id === id) || null);
      }),

      findMany: jest.fn((contentType, options = {}) => {
        let items = [];
        if (contentType.includes('product')) items = mockData.products;
        else if (contentType.includes('order')) items = mockData.orders;
        else if (contentType.includes('cart')) items = mockData.carts;
        else if (contentType.includes('cart-item')) items = mockData.cartItems;
        
        return Promise.resolve(items);
      }),

      update: jest.fn((contentType, id, { data }) => {
        let items = [];
        if (contentType.includes('product')) items = mockData.products;
        else if (contentType.includes('order')) items = mockData.orders;
        else if (contentType.includes('cart')) items = mockData.carts;
        else if (contentType.includes('cart-item')) items = mockData.cartItems;
        
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...data };
          return Promise.resolve(items[index]);
        }
        return Promise.resolve(null);
      }),

      delete: jest.fn((contentType, id) => {
        if (contentType.includes('product')) {
          mockData.products = mockData.products.filter(p => p.id !== id);
        } else if (contentType.includes('order')) {
          mockData.orders = mockData.orders.filter(o => o.id !== id);
        } else if (contentType.includes('cart')) {
          mockData.carts = mockData.carts.filter(c => c.id !== id);
        } else if (contentType.includes('cart-item')) {
          mockData.cartItems = mockData.cartItems.filter(ci => ci.id !== id);
        }
        return Promise.resolve({ id });
      })
    },

    // Helper để xóa tất cả mock data
    clearMockData: () => {
      mockData.products = [];
      mockData.orders = [];
      mockData.carts = [];
      mockData.cartItems = [];
    },

    // Helper để lấy mock data
    getMockData: () => mockData
  };
}

/**
 * 🎭 Mock Context cho Strapi controller
 */
function createMockContext(overrides = {}) {
  return {
    request: {
      body: {},
      query: {},
      ...overrides.request,
    },
    query: {},
    params: {},
    badRequest: jest.fn((msg) => ({ error: msg, status: 400 })),
    notFound: jest.fn((msg) => ({ error: msg, status: 404 })),
    internalServerError: jest.fn((msg) => ({ error: msg, status: 500 })),
    ...overrides,
  };
}

module.exports = {
  createMockProduct,
  createMockOrder,
  createMockCart,
  createMockCartItems,
  createMockStrapi,
  createMockContext,
};
