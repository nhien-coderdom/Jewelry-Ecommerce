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

```bash
# Run tests in client
docker-compose exec client npm test

# Run tests in server
docker-compose exec server npm test
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
