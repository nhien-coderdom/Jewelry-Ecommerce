module.exports = (plugin) => {
  plugin.controllers.user.syncClerk = async (ctx) => {
    const { clerkUserID, email, username } = ctx.request.body;

    if (!clerkUserID || !email) {
      return ctx.badRequest("Missing clerkUserID or email");
    }

    // Kiểm tra user có tồn tại chưa
    const existing = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { clerkUserID },
    });

    let user;
    if (existing) {
      // Update nếu có
      user = await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: existing.id },
        data: { email, username },
      });
    } else {
      // Tạo mới nếu chưa có
      user = await strapi.db.query("plugin::users-permissions.user").create({
        data: { clerkUserID, email, username, confirmed: true },
      });
    }

    ctx.body = user;
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/sync-clerk",
    handler: "user.syncClerk",
    config: { auth: false },
  });

  return plugin;
};
