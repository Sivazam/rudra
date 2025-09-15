# Sanathan Rudraksha - Spiritual Beads E-commerce Store

A production-ready Next.js 15 e-commerce application tailored for spiritual beads (Rudraksha, Malas, Bracelets, Gemstones, Yantras) with Firebase mobile OTP authentication, custom admin dashboard, and Razorpay payment integration.

## 🚀 Features

### Frontend Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Product Catalog**: Grid layout with product cards, ratings, and pricing
- **Category Navigation**: Easy navigation between Rudraksha, Malas, Bracelets, Gemstones, and Yantras
- **Shopping Cart**: Add to cart functionality with persistent storage
- **Search & Filter**: Product search and category filtering
- **User Authentication**: Firebase mobile OTP-based login
- **Payment Integration**: Razorpay test-mode payments

### Admin Features
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **Product Management**: CRUD operations for products with variants
- **Category Management**: Manage product categories
- **Order Management**: View and manage customer orders
- **Discount Management**: Create and manage discount codes
- **Inventory Management**: Track stock levels and low-stock alerts
- **User Management**: View customer information

### Technical Features
- **Next.js 15**: Latest Next.js with App Router
- **TypeScript**: Full TypeScript support
- **MongoDB**: Database with Mongoose ODM
- **Firebase Authentication**: Mobile OTP authentication
- **Razorpay**: Payment gateway integration
- **Tailwind CSS**: Modern styling with brand colors
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase (Mobile OTP)
- **Payments**: Razorpay (Test Mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI with shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context, Zustand

## 🎨 Brand Colors

- **Primary**: `#A36922` (Saffron Brown)
- **Secondary**: `#FCF5E5` (Light Cream)
- **Accent**: `#8B0000` (Dark Red)

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- MongoDB instance
- Firebase project
- Razorpay account

### 1. Clone & Setup
```bash
git clone https://github.com/yournextstore/yournextstore.git spiritual-beads-store
cd spiritual-beads-store
npm install
```

### 2. Environment Configuration
Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Configure the following environment variables:

#### MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/spiritual-beads-store
```

#### Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Phone Authentication
3. Add a web app to your project
4. Download service account key from Project Settings → Service Accounts

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
# ... other Firebase admin config
```

#### Razorpay
1. Create a Razorpay account at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your test API keys

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Database Setup
The application will automatically create the necessary collections when you first run it. No manual database setup is required.

### 4. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (store)/                  # Store pages
│   │   ├── page.tsx             # Homepage
│   │   ├── products/            # Product pages
│   │   └── category/            # Category pages
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx           # Admin layout
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── categories/          # Category management
│   │   └── middleware.ts        # Admin auth middleware
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx       # Mobile OTP login
│   │   └── verify/page.tsx      # OTP verification
│   └── api/                     # API routes
│       ├── admin/               # Admin APIs
│       ├── checkout/            # Payment APIs
│       ├── session/             # Session management
│       └── webhooks/            # Webhook handlers
├── components/                  # UI components
├── lib/                         # Utility libraries
│   ├── models/                  # Database models
│   ├── firebase.ts              # Firebase config
│   ├── db.ts                    # Database connection
│   └── utils.ts                 # Utility functions
└── ui/                          # Shadcn UI components
```

## 🔧 Admin Setup

### Creating an Admin User
1. First, create a regular user through the Firebase authentication
2. In Firebase Console, go to Authentication → Users
3. Find the user and add custom claims:
   ```javascript
   // In Firebase Console or using admin SDK
   admin.auth().setCustomUserClaims(uid, { admin: true });
   ```

### Admin Dashboard Features
- **Dashboard**: Overview of sales, orders, and inventory
- **Categories**: Manage product categories
- **Products**: Add/edit products with variants
- **Orders**: View and manage customer orders
- **Discounts**: Create promotional discount codes
- **Customers**: View customer information

## 💳 Payment Setup

### Razorpay Test Mode
The application is configured to use Razorpay in test mode by default. Test cards can be found in the [Razorpay documentation](https://razorpay.com/docs/payment-gateway/test-card-details/).

### Webhook Configuration
1. In Razorpay Dashboard, go to Settings → Webhooks
2. Add a webhook endpoint: `https://yourdomain.com/api/webhooks/razorpay`
3. Use your `RAZORPAY_WEBHOOK_SECRET` from environment variables
4. Enable events: `payment.captured`, `payment.failed`

## 📱 Mobile OTP Authentication

### How It Works
1. User enters mobile number
2. Firebase sends OTP via SMS
3. User enters OTP for verification
4. Session cookie is created for authenticated access

### Firebase Configuration
1. Enable Phone Authentication in Firebase Console
2. Configure phone number providers (India supported by default)
3. Set up reCAPTCHA verification

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 🧪 Testing

### Running Tests
```bash
npm test
```

### End-to-End Testing
For testing admin flows and checkout process, you can use Cypress or Playwright.

## 📝 API Documentation

### Store APIs
- `GET /api/products` - Get products with filtering
- `GET /api/categories` - Get categories
- `POST /api/checkout` - Create Razorpay order
- `POST /api/cart` - Cart operations

### Admin APIs
- `GET /api/admin/categories` - Manage categories
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/discounts` - Manage discounts

## 🔒 Security Features

- **Admin Authentication**: Firebase session verification
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Next.js built-in CSRF protection
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **Environment Variables**: Sensitive data in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE-AGPL.md) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](https://github.com/yournextstore/yournextstore)
- Review the Firebase and Razorpay documentation

## 🙏 Acknowledgments

- [Your Next Store](https://github.com/yournextstore/yournextstore) - Base e-commerce template
- [Firebase](https://firebase.google.com/) - Authentication services
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Next.js](https://nextjs.org/) - React framework

---

**Sanathan Rudraksha** - Bringing spiritual products to the digital world with modern technology.