module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/sync-clerk',
      handler: 'sync-clerk.syncUser',
      config: {
        auth: false, // nếu bạn chưa cần auth
      },
    },
  ],
};
