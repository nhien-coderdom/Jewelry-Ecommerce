'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // 🟢 Override: CREATE
  async create(ctx) {
    const { clerkUserId, ...orderData } = ctx.request.body.data || {};

    // ⚠️ TEMPORARY: Remove validation for demo
    // if (!clerkUserId) {
    //   return ctx.badRequest('clerkUserId is required');
    // }

    // Tạo order mới (với hoặc không có clerkUserId)
    const entity = await strapi.db.query('api::order.order').create({
      data: {
        ...orderData,
        ...(clerkUserId && { clerkUserId }), // Chỉ thêm nếu có
      },
    });

    return entity;
  },

  // 🟢 Override: FIND (GET /api/orders)
  async find(ctx) {
    const { clerkUserId } = ctx.query;

    if (!clerkUserId) {
      return ctx.badRequest('clerkUserId is required in query');
    }

    const entities = await strapi.db.query('api::order.order').findMany({
      where: { clerkUserId },
      orderBy: { createdAt: 'desc' },
    });

    return entities;
  },

  // 🟢 Override: FIND ONE (GET /api/orders/:id)
  async findOne(ctx) {
    const { id } = ctx.params;
    const { clerkUserId } = ctx.query;

    if (!clerkUserId) {
      return ctx.badRequest('clerkUserId is required in query');
    }

    const entity = await strapi.db.query('api::order.order').findOne({
      where: { id, clerkUserId },
    });

    if (!entity) {
      return ctx.notFound('Order not found or not authorized');
    }

    return entity;
  },
}));

