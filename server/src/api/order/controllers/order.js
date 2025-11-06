'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
  const { clerkUserId, products, order_items, ...orderData } = ctx.request.body.data || {};

  if (!clerkUserId) return ctx.badRequest('clerkUserId is required');
  if (!products || !Array.isArray(products)) return ctx.badRequest('products is required');
  if (!order_items || !Array.isArray(order_items)) return ctx.badRequest('order_items is required');

  try {
    // ✅ B1: tạo Order
    const order = await strapi.entityService.create('api::order.order', {
      data: {
        ...orderData,
        clerkUserId,
        products,
      },
    });

    // ✅ B2: tạo từng Order Item + kiểm tra/trừ stock
    for (const item of order_items) {
      // Lấy thông tin sản phẩm
      const product = await strapi.entityService.findOne('api::product.product', item.product, {
        fields: ['stock', 'title'],
      });

      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // ✅ Kiểm tra còn hàng không
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.title}`);
      }

      // ✅ Tạo Order Item
      await strapi.entityService.create('api::order-item.order-item', {
        data: {
          product: item.product,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          order: order.id,
        },
      });

      // ✅ Trừ stock sản phẩm
      await strapi.entityService.update('api::product.product', item.product, {
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    return order;

  } catch (err) {
    console.error("🔥 Order Creation Error:", err);

    return ctx.internalServerError(err.message || 'Failed to create order');
  }
},

  // GET /api/orders?clerkUserId=x
  async find(ctx) {
    const { clerkUserId } = ctx.query;
    if (!clerkUserId) return ctx.badRequest('clerkUserId is required');

    return await strapi.db.query('api::order.order').findMany({
      where: { clerkUserId },
      populate: ['products', 'order_items', 'order_items.product'],
      orderBy: { createdAt: 'desc' },
    });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { clerkUserId } = ctx.query;

    if (!clerkUserId) return ctx.badRequest('clerkUserId is required');

    const order = await strapi.db.query('api::order.order').findOne({
      where: { id, clerkUserId },
      populate: ['products', 'order_items', 'order_items.product'],
    });

    if (!order) return ctx.notFound('Order not found');

    return order;
  }
}));
