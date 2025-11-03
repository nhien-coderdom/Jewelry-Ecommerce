'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const { clerkUserId, products, order_items, ...orderData } = ctx.request.body.data || {};

    if (!clerkUserId) return ctx.badRequest('clerkUserId is required');
    if (!products || !Array.isArray(products)) return ctx.badRequest('products is required');

    try {
      // ✅ B1: tạo Order
      const order = await strapi.entityService.create('api::order.order', {
        data: {
          ...orderData,
          clerkUserId,
          products, // chỉ array ID
        },
      });

      // ✅ B2: tạo từng item trong order_items
      if (order_items?.length > 0) {
        for (const item of order_items) {
          await strapi.entityService.create('api::order-item.order-item', {
            data: {
              product: item.product,
              quantity: item.quantity,
              price_at_time: item.price_at_time,
              order: order.id,
            },
          });
        }
      }

      return order;
    } catch (err) {
      console.error('🔥 Order Create Error:', err);
      return ctx.internalServerError('Failed to create order');
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
