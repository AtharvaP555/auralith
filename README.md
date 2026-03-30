# Auralith — Full-Stack eCommerce Platform

A production-quality eCommerce platform built with a modern full-stack architecture. Browse products, manage a cart, place orders with real payment processing, and manage everything through an admin dashboard.

**Live demo:** https://auralith-sandy.vercel.app

> Test credentials  
> User — register any account  
> Admin — email: `atharvapuranik255@gmail.com` (contact for password)  
> Test UPI ID for payments: `success@razorpay`

---

## Tech stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend         | React 19, Vite, Tailwind CSS        |
| State management | Zustand, TanStack React Query       |
| Backend          | Node.js, Express                    |
| Database         | PostgreSQL (Neon serverless)        |
| ORM              | Prisma                              |
| Payments         | Razorpay                            |
| Hosting          | Vercel (frontend), Render (backend) |

---

## Features

### User facing

- Register and login with JWT authentication (access + refresh tokens)
- Browse products with search, category filter, and sort
- Persistent cart (survives page refresh and logout)
- Product detail pages with image gallery and stock tracking
- Checkout with Razorpay payment integration
- Order history with live status tracking
- User profile page

### Admin

- Product management — create, edit, delete products
- Order management — view all orders, update status
- Revenue and stats overview

### Technical highlights

- JWT access tokens (15min) + refresh tokens (7 days) with automatic silent refresh
- Optimistic UI cart updates with Zustand persist middleware
- Razorpay webhook signature verification to prevent duplicate orders
- Cursor-safe pagination on product listings
- PostgreSQL full-text search on product name and description
- Role-based access control (USER / ADMIN)
- Global error handling with consistent API response shape
- Responsive design across all screen sizes

---

## Architecture

```
auralith/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/         # Axios instance + API functions
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route-level page components
│       └── store/       # Zustand global state
└── server/          # Node.js + Express backend
    └── src/
        ├── controllers/ # Request handlers
        ├── middleware/  # Auth, error handling
        ├── routes/      # Express routers
        └── utils/       # Prisma client, JWT, helpers
```

---

## Local setup

### Prerequisites

- Node.js v18+
- A [Neon](https://neon.tech) account (free)
- A [Razorpay](https://razorpay.com) account (free test mode)

### 1. Clone the repo

```bash
git clone git@github.com:AtharvaP555/auralith.git
cd auralith
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
node src/utils/seed.js
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

### 4. Visit

```
http://localhost:5173
```

---

## Environment variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```
