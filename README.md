# 💍 Jewelry E-commerce Platform

Full-stack jewelry e-commerce application built with Next.js and Strapi CMS.

## 🏗️ Tech Stack

### Frontend (Client)
- **Next.js 14** - React framework
- **Clerk** - Authentication
- **Stripe** - Payment processing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Resend** - Email service

### Backend (Server)
- **Strapi 4.21** - Headless CMS
- **PostgreSQL** - Database
- **Cloudinary** - Image hosting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Chạy với Docker (Khuyến nghị)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Jewelry-Ecommerce

# 2. Copy và config environment variables
cp .env.example .env
# Sửa file .env với các keys thực tế của bạn

# 3. Start với Docker Compose
docker-compose up --build

# 4. Truy cập ứng dụng
# Frontend: http://localhost:3000
# Strapi Admin: http://localhost:1337/admin
```

👉 **Xem hướng dẫn chi tiết**: [DOCKER_HUONG_DAN.md](./DOCKER_HUONG_DAN.md)

### Chạy Local (Không dùng Docker)

#### Prerequisites
- Node.js 18.x hoặc 20.x
- npm hoặc yarn
- PostgreSQL (hoặc SQLite cho development)

#### Setup Client
```bash
cd client
npm install
cp .env.example .env
# Config .env
npm run dev
```

#### Setup Server
```bash
cd server
npm install
cp .env.example .env
# Config .env
npm run dev
```

## 📁 Project Structure

```
Jewelry-Ecommerce/
├── client/                 # Next.js frontend
│   ├── app/               # App router
│   │   ├── (auth)/       # Auth pages
│   │   ├── api/          # API routes
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── products/     # Product pages
│   │   ├── _components/  # Reusable components
│   │   └── _state/       # Redux store
│   ├── public/           # Static files
│   └── Dockerfile
│
├── server/                # Strapi backend
│   ├── src/              # API logic
│   ├── config/           # Configuration
│   ├── database/         # Database migrations
│   ├── public/           # Uploads
│   ├── tests/            # Unit tests & documentation
│   │   ├── __tests__/    # Jest test files
│   │   ├── helpers.js    # Mock data helpers
│   │   ├── TEST_CASE_FORM_*.md  # Test case documentation (102+ tests)
│   │   └── setup.js      # Test setup
│   └── Dockerfile
│
├── docker-compose.yml    # Docker orchestration
├── .env.example          # Environment template
└── README.md
```

## 🔧 Configuration

### Required Environment Variables

#### Client (.env trong client/)
```env
NEXT_PUBLIC_REST_API_URL=http://localhost:1337/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
NEXT_PUBLIC_STRIPE_PUBLISHER_KEY=your_key
NEXT_PUBLIC_STRIPE_SECRET_KEY=your_secret
RESEND_API_KEY=your_key
```

#### Server (.env trong server/)
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_NAME=jewelry_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_password
APP_KEYS=your_keys
JWT_SECRET=your_secret
```

## 📚 Documentation

- [Docker Setup Guide (Tiếng Việt)](./DOCKER_HUONG_DAN.md) - Hướng dẫn Docker chi tiết
- [Docker Setup Guide (English)](./DOCKER_SETUP.md) - Detailed Docker guide

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :1337

# Kill process or change port in docker-compose.yml
```

### Database connection error
```bash
# Check if postgres is running
docker-compose ps

# Restart server
docker-compose restart server
```

### Module not found
```bash
# Reinstall in container
docker-compose exec client npm install
docker-compose exec server npm install
```

## 📝 Development

### Test Architecture

```
Unit Tests (Jest)
├── businessLogic.test.js (33 tests)
│   └── Calculations: price, VAT, discounts, stock validation
├── order.logic.test.js (16 tests)
│   └── CRUD: create, read, update with authorization checks
├── cart.crud.test.js (12 tests)
│   └── Operations: add, update, delete items with stock validation
├── product.crud.test.js (12 tests)
│   └── CRUD: create, read, update, delete products
└── checkout.test.js (29 tests)
    └── Flow: validate → stock check → price calc → payment → order → clear cart

Integration Points:
- Product Stock ↔ Cart Items ↔ Order Creation
- Payment Success → Order Creation + Cart Clearing
- Inventory Management across all operations
```

### Test Mock Data Pattern

```javascript
// Setup: createMockStrapi() initializes mock entities
mockStrapi.entityService.create('api::product.product', data)
mockStrapi.entityService.create('api::cart.cart', data)
mockStrapi.entityService.update('api::order.order', id, data)

// Cleanup: afterEach clears mock data
mockStrapi.clearMockData()
jest.clearAllMocks()
```

### Chạy commands trong Docker container
```bash
# Access client shell
docker-compose exec client sh

# Access server shell
docker-compose exec server sh

# Run npm commands
docker-compose exec server npm run strapi
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f client
docker-compose logs -f server
```

## 🧪 Testing

### Unit Tests Documentation

Comprehensive test coverage for jewelry e-commerce platform with 102+ unit tests.

#### Test Suites (All 100% Pass Rate ✅)

| Test Suite | Tests | Status | Coverage |
|---|---|---|---|
| **businessLogic.test.js** | 33 | ✅ PASS | Price calc, VAT, stock, validation |
| **order.logic.test.js** | 16 | ✅ PASS | Order CRUD with authorization |
| **cart.crud.test.js** | 12 | ✅ PASS | Cart operations with stock validation |
| **product.crud.test.js** | 12 | ✅ PASS | Product CRUD operations |
| **checkout.test.js** | 29 | ✅ PASS | Complete checkout flow |
| **TOTAL** | **102** | **✅ 100%** | **Full integration flow** |

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- businessLogic.test.js
npm test -- order.logic.test.js
npm test -- cart.crud.test.js
npm test -- product.crud.test.js
npm test -- checkout.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

#### Test Documentation Files

Located in `server/tests/`:
- `TEST_CASE_FORM_BUSINESS_LOGIC_ORGANIZED.md` - 33 pricing/validation tests
- `TEST_CASE_FORM_ORDER_LOGIC.md` - 16 order management tests
- `TEST_CASE_FORM_CART_CRUD.md` - 12 cart operations tests
- `TEST_CASE_FORM_PRODUCT_CRUD.md` - 12 product management tests
- `TEST_CASE_FORM_CHECKOUT.md` - 29 checkout flow tests

#### Key Test Features

✅ **Payment Success Verification** - Confirms payment success → createOrder + clearCart flow
✅ **Stock Validation** - Prevents overselling, validates inventory
✅ **Error Handling** - Comprehensive error scenario testing
✅ **End-to-End Integration** - Complete checkout flow validation
✅ **Mock Data Patterns** - Isolated test execution with proper cleanup

#### Run Tests in Docker

```bash
# Run all tests in server container
docker-compose exec server npm test

# Run specific test
docker-compose exec server npm test -- checkout.test.js

# View coverage
docker-compose exec server npm test -- --coverage
```

## 🚢 Deployment

### Production Build

1. Update environment variables for production
2. Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Deploy to your hosting service (AWS, DigitalOcean, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team
- Strapi team
- All contributors

---

Made with ❤️ for jewelry lovers
