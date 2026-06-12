
# 🛍️ VMart — Full-Stack MERN E-Commerce Platform

> **Shop Smart, Live Better** — A production-ready e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) and powered by Vite.

---

## 🚀 Features

### 🛒 Customer Features
- **Authentication** — JWT-based login, register, forgot/reset password, persistent sessions
- **Product Catalog** — Advanced filtering, sorting, search, pagination
- **Product Detail** — Image gallery, variants (size/color), reviews & ratings
- **Shopping Cart** — Add, update, remove items, coupon codes, real-time subtotal
- **Wishlist** — Save favourite products
- **Checkout** — Multi-step (Address → Payment → Review)
- **Razorpay Payment** — UPI, Cards, Net Banking, Wallets
- **Cash on Delivery** — COD support
- **Order Tracking** — Real-time status timeline with history
- **Order History** — View, cancel, track all orders
- **User Profile** — Edit name, phone, manage saved addresses
- **Dark / Light Mode** — Persistent theme toggle
- **Fully Responsive** — Mobile, tablet & desktop layouts

### 🛠️ Admin Features
- **Dashboard** — Revenue chart, stats cards, recent orders, top products
- **Product Management** — Full CRUD with image uploads
- **Order Management** — View and update order statuses
- **User Management** — View users, toggle active/inactive
- **Category Management** — CRUD for categories

### ⚙️ Technical Features
- **Redux Toolkit** — Global state management
- **React Router v6** — Nested routing with protected/admin routes
- **CSS Modules** — Scoped, maintainable styles (no Tailwind)
- **Axios Interceptors** — Auto-attach JWT tokens
- **Multer** — Local image uploads (Cloudinary-ready)
- **Helmet, Rate Limiting, CORS** — Security best practices
- **Lazy Loading** — Code-split pages for performance
- **Toast Notifications** — React Hot Toast
- **SEO** — React Helmet Async meta tags

---

## 📁 Project Structure

```
vmart-ecommerce/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Email, seeder
│   ├── uploads/         # Local uploads (git-ignored)
│   ├── server.js        # Entry point
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/   # Spinner, etc.
│   │   │   ├── layout/   # Header, Footer, AdminLayout
│   │   │   └── product/  # ProductCard
│   │   ├── pages/
│   │   │   ├── admin/    # Dashboard, Products, Orders, Users
│   │   │   └── *.jsx     # Customer pages
│   │   ├── store/
│   │   │   └── slices/   # Redux slices
│   │   ├── services/     # Axios API instance
│   │   └── styles/       # Global CSS, variables
│   └── vite.config.js
│
├── package.json         # Root scripts
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/vmart-ecommerce.git
cd vmart-ecommerce

# Install all dependencies
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/vmart
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173

# Razorpay (get from razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx

# Optional: Stripe, Cloudinary, Email
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 📧 **Admin**: `admin@vmart.com` / `admin123`
- 📧 **User**: `user@vmart.com` / `user123`
- 🗂️ 6 Categories, 8 Sample Products

### 4. Start Development Servers

```bash
# From root — starts both frontend and backend
npm run dev
```

Or start individually:
```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

### 5. Open in Browser

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | VMart Store |
| `http://localhost:5173/admin` | Admin Panel |
| `http://localhost:5000/api/health` | API Health Check |

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (with filters) |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Create (Admin) |
| PUT | `/api/products/:id` | Update (Admin) |
| DELETE | `/api/products/:id` | Delete (Admin) |
| POST | `/api/products/:id/reviews` | Add review |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders` | My orders |
| GET | `/api/orders/:id` | Order detail |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders` | All orders (Admin) |
| PUT | `/api/orders/:id/status` | Update status (Admin) |

---

## 💳 Payment Setup

### Razorpay (Primary)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get test keys from Dashboard → Settings → API Keys
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   ```

### Stripe (Optional)
1. Sign up at [stripe.com](https://stripe.com)
2. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   ```

---

## 🌐 Deployment

### Backend (Railway / Render / Heroku)
```bash
# Set environment variables in your hosting dashboard
# Build command: npm install
# Start command: node server.js
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Environment for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...   # Atlas URI
FRONTEND_URL=https://vmart.vercel.app
JWT_SECRET=<strong-random-secret>
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Redux Toolkit, React Router v6 |
| Styling | CSS Modules (custom design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Payments | Razorpay, Stripe |
| File Upload | Multer |
| Email | Nodemailer |
| Icons | React Icons (Feather) |
| Notifications | React Hot Toast |

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Home | Hero banner, categories, featured products |
| Products | Grid/list view, sidebar filters |
| Product Detail | Image gallery, variants, reviews |
| Cart | Item management, shipping calculator |
| Checkout | 3-step flow with Razorpay |
| Admin Dashboard | Revenue chart, stats, recent orders |

---

## 📄 License

MIT © VMart 2024

---

> Built with ❤️ using the MERN Stack

# vmart-ecommerce

