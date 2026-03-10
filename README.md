# NCC Upscale — Premium Learning Management System

A full-stack LMS where Admins manage employees and publish paid courses, and Users browse, purchase, and complete them.

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL (Neon), JWT Auth, Razorpay  
**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, DnD Kit

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or local)
- Razorpay test account

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:5000`. On first run, it automatically creates all database tables and seeds sample data.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

## Test Credentials

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@ncc.com          | Admin@123    |
| Employee | sarah@company.com      | Employee@123 |
| Employee | james@company.com      | Employee@123 |
| Employee | priya@company.com      | Employee@123 |
| Employee | david@company.com      | Employee@123 |
| Employee | emily@company.com      | Employee@123 |

## Razorpay Test Payment

Use Razorpay test mode card:
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

## Features

- Dark luxury editorial design with glassmorphism
- JWT authentication with refresh tokens
- Razorpay payment integration
- Kanban task board with drag-and-drop
- Circular progress rings
- Learning streak tracker
- Revenue analytics dashboard
- Certificate generation
- Deadline countdown timers
- Skeleton loading states
- Responsive mobile navigation
- Real-time notifications with polling
- Admin course creation wizard
- User management panel
- Framer Motion page transitions

## Project Structure

```
backend/
├── controllers/     # Route handlers
├── db/              # Database pool, schema, seed
├── middleware/       # Auth & error handling
├── routes/          # API route definitions
└── index.js         # Entry point

frontend/
├── src/
│   ├── components/  # Shared UI components
│   ├── context/     # Auth context
│   ├── hooks/       # Custom hooks
│   ├── pages/       # All page components
│   │   ├── admin/   # Admin panel pages
│   │   └── dashboard/ # Employee dashboard
│   ├── utils/       # API client
│   ├── App.jsx      # Router
│   └── main.jsx     # Entry point
└── index.html
```
