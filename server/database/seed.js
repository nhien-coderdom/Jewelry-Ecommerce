/**
 * Seed Data for Strapi
 * Run this to populate initial data
 * 
 * Usage: npm run strapi seed
 */

module.exports = {
  async seed(strapi) {
    console.log('🌱 Seeding database...');

    // 1. Create Categories
    const categories = await Promise.all([
      strapi.db.query('api::category.category').create({
        data: {
          name: 'Rings',
          slug: 'rings',
          description: 'Beautiful engagement and wedding rings',
          publishedAt: new Date(),
        },
      }),
      strapi.db.query('api::category.category').create({
        data: {
          name: 'Necklaces',
          slug: 'necklaces',
          description: 'Elegant necklaces for every occasion',
          publishedAt: new Date(),
        },
      }),
      strapi.db.query('api::category.category').create({
        data: {
          name: 'Bracelets',
          slug: 'bracelets',
          description: 'Stunning bracelets and bangles',
          publishedAt: new Date(),
        },
      }),
    ]);

    console.log('✅ Categories created:', categories.length);

    // 2. Create Products
    const products = await Promise.all([
      strapi.db.query('api::product.product').create({
        data: {
          title: 'Diamond Engagement Ring',
          description: 'Beautiful 1 carat diamond engagement ring',
          price: 5000,
          category: categories[0].id,
          slug: 'diamond-engagement-ring',
          instantDelivery: true,
          publishedAt: new Date(),
        },
      }),
      strapi.db.query('api::product.product').create({
        data: {
          title: 'Gold Necklace',
          description: '18k gold necklace with pendant',
          price: 2000,
          category: categories[1].id,
          slug: 'gold-necklace',
          instantDelivery: true,
          publishedAt: new Date(),
        },
      }),
      strapi.db.query('api::product.product').create({
        data: {
          title: 'Silver Bracelet',
          description: 'Sterling silver bracelet',
          price: 500,
          category: categories[2].id,
          slug: 'silver-bracelet',
          instantDelivery: true,
          publishedAt: new Date(),
        },
      }),
    ]);

    console.log('✅ Products created:', products.length);

    console.log('🎉 Seeding completed!');
  },
};
