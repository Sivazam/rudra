# Rudra Store - Spiritual Products E-commerce Platform

A modern, fully-featured e-commerce platform for spiritual products built with Next.js 15, TypeScript, and Tailwind CSS. This platform specializes in authentic Rudraksha beads, malas, and other spiritual items.

## 🚀 Features

### Customer-Facing Features
- **🛍️ Product Catalog**: Browse and search spiritual products with advanced filtering
- **📱 Mobile-First Design**: Responsive design that works seamlessly on all devices
- **🛒 Shopping Cart**: Persistent cart with variant selection and quantity management
- **💳 Secure Payments**: Razorpay integration for secure online payments
- **🔐 Firebase Authentication**: Mobile OTP-based authentication system
- **⭐ Product Reviews**: Rating and review system for all products
- **📸 Product Gallery**: Multiple product images with zoom functionality
- **🎯 Variant Selection**: Multiple product variants (Regular, Medium, Ultra, Rare)
- **🚚 Order Tracking**: Real-time order status updates

### Admin Dashboard Features
- **📊 Dashboard**: Analytics and overview of store performance
- **🏷️ Category Management**: CRUD operations for product categories
- **📦 Product Management**: Add, edit, and manage products with variants
- **🎛️ Variant Management**: Manage product variants, pricing, and inventory
- **💰 Discount Management**: Create and manage discount codes
- **📋 Order Management**: View and process customer orders
- **🔒 Admin Authentication**: Secure admin access with session management

### Technical Features
- **⚡ Next.js 15**: Latest Next.js with App Router and Server Components
- **🎨 Tailwind CSS**: Custom saffron and cream color scheme
- **🗄️ MongoDB**: Scalable database with Mongoose ODM
- **🔄 Zustand**: Lightweight state management for cart and UI
- **🔒 JWT Authentication**: Secure token-based authentication
- **🌐 SEO Optimized**: Meta tags, Open Graph, and structured data
- **📱 Progressive Web App**: Offline support and app-like experience
- **🔍 Search Optimization**: Advanced search with filtering and sorting

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library

### Authentication & Security
- **Firebase Authentication** - Mobile OTP authentication
- **JWT** - Session management and API security
- **bcryptjs** - Password hashing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM with schema validation

### Payments
- **Razorpay** - Payment gateway integration
- **Webhooks** - Real-time payment verification

### State Management
- **Zustand** - Lightweight state management
- **React Context** - Global state management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- Firebase project
- Razorpay account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyADTcaTlnTWepqB6bFuJH6WkXSh3lUVxso
FIREBASE_AUTH_DOMAIN=rudra-bb6b7.firebaseapp.com
FIREBASE_PROJECT_ID=rudra-bb6b7
FIREBASE_STORAGE_BUCKET=rudra-bb6b7.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=889150603232
FIREBASE_APP_ID=1:889150603232:e2ae8734b6eeab6f585

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rudra-store

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/rudra-store.git
cd rudra-store
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Create MongoDB database and update MONGODB_URI in .env.local
npm run db:push
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   └── verify/               # OTP verification page
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx            # Admin layout
│   │   ├── page.tsx             # Dashboard
│   │   ├── categories/          # Category management
│   │   ├── products/            # Product management
│   │   ├── variants/            # Variant management
│   │   ├── discounts/           # Discount management
│   │   └── orders/              # Order management
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication APIs
│   │   ├── payment/             # Payment APIs
│   │   ├── products/            # Product APIs
│   │   ├── categories/          # Category APIs
│   │   ├── admin/               # Admin APIs
│   │   └── webhooks/            # Webhook handlers
│   ├── products/                # Product pages
│   │   └── [id]/                # Product detail page
│   ├── checkout/                # Checkout page
│   ├── order-success/           # Order success page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx           # 404 page
│   └── error.tsx               # Error page
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Admin dashboard components
│   ├── store/                  # Storefront components
│   └── cart/                   # Cart components
├── lib/                        # Utility libraries
│   ├── models/                 # Mongoose models
│   ├── mongodb.ts              # MongoDB connection
│   ├── firebase.ts             # Firebase configuration
│   ├── validation.ts           # Form validation schemas
│   ├── apiUtils.ts             # API utilities
│   └── razorpay.ts             # Razorpay utilities
├── store/                      # Zustand stores
│   └── cartStore.ts            # Shopping cart store
├── hooks/                      # Custom React hooks
└── styles/                     # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Saffron (`#A36922`)
- **Background**: Cream (`#FCF5E5`)
- **Accent**: Dark Red (`#8B0000`)
- **Text**: Dark Gray (`#1f2937`)

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable sans-serif
- **Prices**: Prominent saffron color

### Components
- **Buttons**: Rounded corners with hover effects
- **Cards**: Subtle shadows with hover animations
- **Forms**: Clean, accessible form inputs
- **Navigation**: Intuitive mobile-first design

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Initiate OTP login
- `POST /api/auth/verify-otp` - Verify OTP and create session

### Product Endpoints
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/[slug]` - Get single product details

### Category Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (admin)

### Payment Endpoints
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Admin Endpoints
- `GET /api/admin/products` - Get products (admin)
- `POST /api/admin/products` - Create product (admin)
- `GET /api/admin/categories` - Get categories (admin)
- `POST /api/admin/categories` - Create category (admin)
- `GET /api/admin/orders` - Get orders (admin)

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup for Production
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Create Firebase project and enable Authentication
3. Set up Razorpay account and get API keys
4. Configure all environment variables
5. Set up domain and SSL certificates

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... add all required environment variables
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based session management
- Firebase OTP authentication
- Admin role-based access control
- Secure HTTP-only cookies
- CSRF protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Security headers

### Payment Security
- Razorpay secure payment gateway
- Webhook signature verification
- PCI DSS compliance
- Fraud detection

## 📊 Performance Optimization

### Frontend
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Server-side rendering where appropriate
- Optimized bundle size
- Caching strategies

### Backend
- Database indexing
- API response caching
- CDN integration
- Optimized database queries
- Connection pooling

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test products.test.ts

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- E2E tests for user flows
- Component tests for React components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the established code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **shadcn/ui** - For the beautiful UI components
- **Firebase** - For authentication services
- **Razorpay** - For payment gateway integration
- **MongoDB** - For the robust database solution

## 📞 Support

For support and questions:
- Email: support@rudrastore.com
- Documentation: [docs.rudrastore.com](https://docs.rudrastore.com)
- Issues: [GitHub Issues](https://github.com/your-username/rudra-store/issues)

---

Built with ❤️ for the spiritual community by Rudra Store team.