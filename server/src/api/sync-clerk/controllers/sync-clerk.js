module.exports = {
  async syncUser(ctx) {
    try {
      const data = ctx.request.body;

      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: data.email },
      });

      let user;
      if (existingUser) {
        user = await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: existingUser.id },
          data,
        });
      } else {
        user = await strapi.db.query('plugin::users-permissions.user').create({ data });
      }

      ctx.body = { message: 'User synced successfully', user };
    } catch (error) {
      console.error('❌ Error syncing user:', error);
      ctx.badRequest('Failed to sync user');
    }
  },
};
