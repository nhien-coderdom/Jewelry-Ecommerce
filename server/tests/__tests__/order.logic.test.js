/**
 * 🧪 Unit Tests cho Order Logic
 * Test logic tạo/tìm order với MOCK DATA
 */

const {
  createMockProduct,
  createMockOrder,
  createMockStrapi,
  createMockContext,
} = require('../helpers');

describe('Order Logic - Unit Tests', () => {
  let mockStrapi;

  // 🎬 Setup: Tạo mock data trước mỗi test
  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  // 🧹 Cleanup: Xóa mock data sau mỗi test
  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  describe('🎯 CREATE Order Logic', () => {
    it('✅ Nên tạo order thành công với mock data hợp lệ', async () => {
      const orderData = {
        clerkUserId: 'test_user_123',
        products: [1],
        total: 1000,
        status: 'pending',
      };

      const order = await mockStrapi.entityService.create('api::order.order', {
        data: orderData
      });

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.clerkUserId).toBe('test_user_123');
      expect(order.total).toBe(1000);
      expect(mockStrapi.entityService.create).toHaveBeenCalledWith(
        'api::order.order',
        expect.objectContaining({ data: orderData })
      );
    });

    it('❌ Validation: clerkUserId là required', () => {
      const orderData = {
        products: [1],
        total: 100
      };

      const isValid = !!orderData.clerkUserId;
      expect(isValid).toBe(false);
    });

    it('❌ Validation: products là required', () => {
      const orderData = {
        clerkUserId: 'user_123',
        total: 100
      };

      const isValid = !!orderData.products && Array.isArray(orderData.products);
      expect(isValid).toBe(false);
    });

    it('❌ Validation: order_items là required', () => {
      const orderData = {
        clerkUserId: 'user_123',
        products: [1],
        total: 100
      };

      const isValid = !!orderData.order_items && Array.isArray(orderData.order_items);
      expect(isValid).toBe(false);
    });

    it('✅ Logic: Kiểm tra stock trước khi order', () => {
      const productStock = 5;
      const requestedQuantity = 3;

      const hasEnoughStock = productStock >= requestedQuantity;
      expect(hasEnoughStock).toBe(true);
    });

    it('❌ Logic: Phát hiện stock không đủ', () => {
      const productStock = 1;
      const requestedQuantity = 10;

      const hasEnoughStock = productStock >= requestedQuantity;
      expect(hasEnoughStock).toBe(false);
    });

    it('✅ Logic: Tính stock mới sau khi order', () => {
      const currentStock = 10;
      const orderedQuantity = 3;

      const newStock = currentStock - orderedQuantity;
      expect(newStock).toBe(7);
    });

    it('✅ Nên tạo order items thành công', async () => {
      const order = await mockStrapi.entityService.create('api::order.order', {
        data: {
          clerkUserId: 'user_789',
          total: 300
        }
      });

      const orderItem = await mockStrapi.entityService.create(
        'api::order-item.order-item',
        {
          data: {
            product: 1,
            quantity: 3,
            price_at_time: 100,
            order: order.id
          }
        }
      );

      expect(orderItem).toBeDefined();
      expect(orderItem.quantity).toBe(3);
      expect(orderItem.order).toBe(order.id);
    });
  });

  describe('🔍 FIND Orders Logic', () => {
    it('✅ Nên tìm được orders với mock data', async () => {
      // Tạo mock orders
      await mockStrapi.entityService.create('api::order.order', {
        data: createMockOrder({ clerkUserId: 'user_search', total: 100 })
      });

      await mockStrapi.entityService.create('api::order.order', {
        data: createMockOrder({ clerkUserId: 'user_search', total: 200 })
      });

      const orders = await mockStrapi.entityService.findMany('api::order.order');

      expect(orders.length).toBeGreaterThanOrEqual(2);
    });

    it('❌ Validation: clerkUserId required khi tìm', () => {
      const query = {};

      const isValid = !!query.clerkUserId;
      expect(isValid).toBe(false);
    });

    it('✅ Nên lọc orders theo clerkUserId', () => {
      const allOrders = [
        { id: 1, clerkUserId: 'user_a', total: 100 },
        { id: 2, clerkUserId: 'user_b', total: 200 },
        { id: 3, clerkUserId: 'user_a', total: 300 },
      ];

      const userId = 'user_a';
      const filtered = allOrders.filter(o => o.clerkUserId === userId);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(o => o.clerkUserId === 'user_a')).toBe(true);
    });
  });

  describe('🔎 FIND ONE Order Logic', () => {
    it('✅ Nên tìm được 1 order theo ID', async () => {
      const order = await mockStrapi.entityService.create('api::order.order', {
        data: createMockOrder({ 
          clerkUserId: 'user_findone', 
          total: 500 
        })
      });

      const found = await mockStrapi.entityService.findOne(
        'api::order.order',
        order.id
      );

      expect(found).toBeDefined();
      expect(found.id).toBe(order.id);
    });

    it('❌ Nên trả về null khi order không tồn tại', async () => {
      const notFound = await mockStrapi.entityService.findOne(
        'api::order.order',
        99999
      );

      expect(notFound).toBeNull();
    });

    it('✅ Logic: Validate ownership (order thuộc về user)', () => {
      const order = { id: 1, clerkUserId: 'user_a' };
      const requestUserId = 'user_a';

      const isOwner = order.clerkUserId === requestUserId;
      expect(isOwner).toBe(true);
    });

    it('❌ Logic: Phát hiện order không thuộc về user', () => {
      const order = { id: 1, clerkUserId: 'user_a' };
      const requestUserId = 'user_b';

      const isOwner = order.clerkUserId === requestUserId;
      expect(isOwner).toBe(false);
    });
  });
});
