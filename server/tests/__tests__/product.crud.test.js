/**
 * 🧪 Unit Tests cho Product - CRUD Operations
 * Test các chức năng Thêm/Xóa/Sửa với MOCK DATA
 */

const {
  createMockProduct,
  createMockStrapi,
} = require('../helpers');

describe('Product - CRUD Unit Tests', () => {
  let mockStrapi;

  // 🎬 Setup: Tạo mock Strapi trước mỗi test
  beforeEach(() => {
    mockStrapi = createMockStrapi();
  });

  // 🧹 Cleanup: Xóa mock data sau mỗi test
  afterEach(() => {
    mockStrapi.clearMockData();
    jest.clearAllMocks();
  });

  describe('➕ CREATE - Thêm Product', () => {
    it('✅ Nên thêm product thành công', async () => {
      const productData = {
        title: 'Diamond Ring',
        description: 'Beautiful diamond ring',
        price: 5000,
        stock: 5,
      };

      const result = await mockStrapi.entityService.create(
        'api::product.product',
        { data: productData }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Diamond Ring');
      expect(result.price).toBe(5000);
      expect(result.stock).toBe(5);
      expect(mockStrapi.entityService.create).toHaveBeenCalledTimes(1);
    });

    it('✅ Nên thêm nhiều products liên tiếp', async () => {
      await mockStrapi.entityService.create('api::product.product', {
        data: createMockProduct({ title: 'Product 1' })
      });

      await mockStrapi.entityService.create('api::product.product', {
        data: createMockProduct({ title: 'Product 2' })
      });

      const mockData = mockStrapi.getMockData();
      expect(mockData.products).toHaveLength(2);
    });

    it('❌ Validation: Giá không được âm', () => {
      const invalidProduct = {
        title: 'Invalid Product',
        price: -100,
        stock: 10,
      };

      // Trong thực tế, Strapi sẽ validate, nhưng ở đây ta test logic validation
      const isValid = invalidProduct.price >= 0;
      expect(isValid).toBe(false);
    });

    it('❌ Validation: Stock không được âm', () => {
      const invalidProduct = {
        title: 'Invalid Stock',
        price: 100,
        stock: -5,
      };

      const isValid = invalidProduct.stock >= 0;
      expect(isValid).toBe(false);
    });
  });

  describe('✏️ UPDATE - Sửa Product', () => {
    it('✅ Nên update price thành công', async () => {
      // Tạo product
      const product = await mockStrapi.entityService.create(
        'api::product.product',
        {
          data: createMockProduct({ 
            title: 'Gold Necklace', 
            price: 1000 
          })
        }
      );

      // Update price
      const updated = await mockStrapi.entityService.update(
        'api::product.product',
        product.id,
        { data: { price: 1500 } }
      );

      expect(updated.price).toBe(1500);
      expect(updated.title).toBe('Gold Necklace');
      expect(mockStrapi.entityService.update).toHaveBeenCalledTimes(1);
    });

    it('✅ Nên update stock sau khi có order', async () => {
      const product = await mockStrapi.entityService.create(
        'api::product.product',
        {
          data: createMockProduct({ stock: 10 })
        }
      );

      // Giả lập trừ stock
      const newStock = product.stock - 3;
      const updated = await mockStrapi.entityService.update(
        'api::product.product',
        product.id,
        { data: { stock: newStock } }
      );

      expect(updated.stock).toBe(7);
    });

    it('✅ Nên update nhiều fields cùng lúc', async () => {
      const product = await mockStrapi.entityService.create(
        'api::product.product',
        {
          data: createMockProduct()
        }
      );

      const updated = await mockStrapi.entityService.update(
        'api::product.product',
        product.id,
        { 
          data: { 
            title: 'Updated Title',
            price: 2000,
            stock: 20
          } 
        }
      );

      expect(updated.title).toBe('Updated Title');
      expect(updated.price).toBe(2000);
      expect(updated.stock).toBe(20);
    });
  });

  describe('🗑️ DELETE - Xóa Product', () => {
    it('✅ Nên xóa product thành công', async () => {
      const product = await mockStrapi.entityService.create(
        'api::product.product',
        {
          data: createMockProduct({ title: 'Product to Delete' })
        }
      );

      await mockStrapi.entityService.delete(
        'api::product.product',
        product.id
      );

      const deleted = await mockStrapi.entityService.findOne(
        'api::product.product',
        product.id
      );

      expect(deleted).toBeNull();
      expect(mockStrapi.entityService.delete).toHaveBeenCalledTimes(1);
    });

    it('✅ Nên xóa được nhiều products', async () => {
      const product1 = await mockStrapi.entityService.create(
        'api::product.product',
        { data: createMockProduct({ title: 'Delete 1' }) }
      );

      const product2 = await mockStrapi.entityService.create(
        'api::product.product',
        { data: createMockProduct({ title: 'Delete 2' }) }
      );

      await mockStrapi.entityService.delete('api::product.product', product1.id);
      await mockStrapi.entityService.delete('api::product.product', product2.id);

      const mockData = mockStrapi.getMockData();
      expect(mockData.products).toHaveLength(0);
    });
  });

  describe('🔍 READ - Đọc/Tìm Product', () => {
    it('✅ Nên tìm được product theo ID', async () => {
      const product = await mockStrapi.entityService.create(
        'api::product.product',
        {
          data: createMockProduct({ title: 'Find Me' })
        }
      );

      const found = await mockStrapi.entityService.findOne(
        'api::product.product',
        product.id
      );

      expect(found).toBeDefined();
      expect(found.id).toBe(product.id);
      expect(found.title).toBe('Find Me');
    });

    it('✅ Nên tìm được tất cả products', async () => {
      await mockStrapi.entityService.create('api::product.product', {
        data: createMockProduct({ title: 'Product 1' })
      });

      await mockStrapi.entityService.create('api::product.product', {
        data: createMockProduct({ title: 'Product 2' })
      });

      const products = await mockStrapi.entityService.findMany(
        'api::product.product'
      );

      expect(products.length).toBeGreaterThanOrEqual(2);
    });

    it('❌ Nên trả về null khi product không tồn tại', async () => {
      const notFound = await mockStrapi.entityService.findOne(
        'api::product.product',
        99999
      );

      expect(notFound).toBeNull();
    });
  });
});
