module.exports = {
  async syncUser(ctx) {
    try {
      const { clerkUserID, email, username, phone, address } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email },
      });

      let user;
      const updateData = {
        username: username || existingUser?.username,
        phone: phone !== undefined ? phone : existingUser?.phone,
        address: address !== undefined ? address : existingUser?.address,
        clerkUserID: clerkUserID || existingUser?.clerkUserID,
      };

      if (existingUser) {
        // Update user hiện có
        user = await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: existingUser.id },
          data: updateData,
        });
        console.log('✅ User updated:', user.email);
      } else {
        // Tạo user mới
        const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });

        user = await strapi.db.query('plugin::users-permissions.user').create({
          data: {
            email,
            username: username || email.split('@')[0],
            phone: phone || '',
            address: address || '',
            clerkUserID: clerkUserID || '',
            provider: 'clerk',
            confirmed: true,
            blocked: false,
            role: defaultRole?.id,
          },
        });
        console.log('✅ User created:', user.email);
      }

      ctx.body = { 
        success: true, 
        message: 'User synced successfully', 
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          address: user.address,
        }
      };
    } catch (error) {
      console.error('❌ Error syncing user:', error);
      ctx.body = { success: false, error: error.message };
    }
  },
};
