# 🕉️ Rudra Store - Spiritual Products E-commerce Platform

A modern, production-ready e-commerce platform for spiritual products, specializing in authentic Rudraksha beads, malas, and spiritual accessories. Built with Next.js 15, TypeScript, and modern web technologies.

## ✨ Features

### 🛍️ Customer Experience
- **Product Catalog**: Browse and search through authentic spiritual products
- **Product Details**: Detailed product information with specifications and guides
- **Shopping Cart**: Persistent cart with Zustand state management
- **Secure Checkout**: Razorpay integration for secure payments
- **Mobile Responsive**: Optimized for all devices
- **Authentication**: Firebase OTP-based login system

### 🎨 Design & UI
- **Beautiful Design**: Saffron and cream color scheme matching spiritual aesthetics
- **Product Grid**: Responsive grid layout with filtering and sorting
- **Category Navigation**: Easy category-based browsing
- **Product Variants**: Support for multiple product variants (Regular, Medium, Ultra, Rare)
- **Image Gallery**: Multiple product images with thumbnail navigation

### 🛡️ Security & Performance
- **Secure Authentication**: Firebase OTP with session management
- **Payment Security**: Razorpay secure payment processing
- **API Protection**: Admin routes protected with authentication
- **SEO Optimized**: Meta tags, sitemap, and robots.txt
- **Error Handling**: Comprehensive error pages and validation

### 📊 Admin Dashboard
- **Product Management**: CRUD operations for products
- **Category Management**: Manage product categories
- **Variant Management**: Handle product variants and pricing
- **Order Management**: View and manage customer orders
- **Discount Management**: Create and manage discount codes

## 🚀 Technology Stack

### 🎯 Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe JavaScript development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework

### 🔐 Authentication & Database
- **🔥 Firebase** - OTP-based authentication
- **🗄️ MongoDB** - NoSQL database with Mongoose ODM
- **🍪 JWT** - Secure session management

### 💳 Payment & State Management
- **💳 Razorpay** - Payment gateway integration
- **🐻 Zustand** - Lightweight state management
- **🔄 React Query** - Server state management

### 🧩 UI Components
- **🧩 shadcn/ui** - High-quality accessible components
- **🎯 Lucide React** - Beautiful icon library
- **🎨 Framer Motion** - Smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB instance running
- Firebase project configured
- Razorpay account for payments

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd rudra-store
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
# Add your Firebase credentials, MongoDB URI, and Razorpay keys
```

4. **Database Setup**
```bash
# Push database schema (if using Prisma - optional as we use Mongoose)
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rudra-store

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret

# Application Configuration
NODE_ENV=development
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin dashboard components
│   ├── cart/             # Shopping cart components
│   ├── store/            # Store frontend components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── models/           # Mongoose models
│   ├── firebase.ts       # Firebase configuration
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # Utility functions
├── store/                # Zustand stores
│   └── cart.ts           # Shopping cart store
└── middleware.ts         # Route protection middleware
```

## 🛡️ Security Features

### Authentication
- Firebase OTP-based authentication
- Secure HTTP-only session cookies
- JWT token validation
- Protected admin routes

### Payment Security
- Razorpay secure payment processing
- Webhook signature verification
- Order status tracking
- Secure transaction handling

### Data Protection
- Input validation and sanitization
- MongoDB query protection
- XSS prevention
- CSRF protection

## 🎨 Design System

### Color Palette
- **Primary**: Saffron (#A36922)
- **Background**: Cream (#FCF5E5)
- **Accent**: Red (#8B0000)
- **Text**: Dark gray (#1f2937)

### Typography
- Clean, readable fonts
- Proper hierarchy and spacing
- Mobile-optimized sizing

### Components
- Consistent design patterns
- Accessible and semantic HTML
- Responsive and adaptive layouts

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup for Production
1. Set all environment variables in production
2. Configure Firebase for production
3. Set up Razorpay production keys
4. Configure MongoDB production instance
5. Set up proper domain and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 About Rudra Store

Rudra Store is dedicated to providing authentic spiritual products to seekers worldwide. We specialize in:
- Original Nepali Rudraksha beads
- Handcrafted malas and bracelets
- Spiritual accessories and idols
- Puja items and meditation tools

Our mission is to make genuine spiritual products accessible to everyone while maintaining the highest standards of quality and authenticity.

---

Built with ❤️ for the spiritual community. May peace and prosperity be with you all. 🕉️