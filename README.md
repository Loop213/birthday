# Birthday Glow

Birthday Glow is a full-stack 3D birthday wishes platform where users create premium, password-protected birthday pages with music, photos, shayari, scheduling, coupon support, and a polished public reveal experience.

## Highlights

- React + Vite frontend with Tailwind CSS, Framer Motion, and React Three Fiber
- Express + MongoDB backend with JWT auth, admin role controls, coupons, payment flow, and scheduled jobs
- Premium dark/neon visual language with glassmorphism, animated 3D hero sections, and mobile-friendly layouts
- Public birthday pages with password protection, 24-hour expiry, fireworks, music, voice notes, and WhatsApp sharing
- Admin panel for revenue tracking, user blocking, coupon CRUD, and content moderation
- Local-friendly fallbacks:
  - `PAYMENT_PROVIDER=demo` for development without live Razorpay credentials
  - local file uploads when Cloudinary is not configured
  - console email fallback when SMTP is not configured

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Three.js via `@react-three/fiber` and `@react-three/drei`

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT auth
- Multer uploads
- Node-cron scheduler
- Razorpay integration path
- Nodemailer

## Folder Structure

```text
Birthday/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   └── pages/
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── uploads/
│   └── package.json
├── docs/
│   ├── api-routes.md
│   └── database-schema.md
├── .env.example
├── package.json
└── README.md
```

## Core Product Flow

1. User signs up or logs in.
2. User creates a birthday draft with recipient details, message, media, password, and theme.
3. User previews the page before payment.
4. User applies a coupon if available.
5. Payment is created and verified.
6. A unique public URL becomes available.
7. Wish is either:
   - shared manually right away, or
   - auto-activated by the scheduler at the saved birthday time.
8. Public page expires automatically after 24 hours.

## Local Setup

### 1. Install dependencies

```bash
npm install
npm install --workspace client
npm install --workspace server
```

### 2. Configure environment

Copy the example env files:

```bash
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Key defaults:

- App runs at `http://localhost:5173`
- API runs at `http://localhost:5000`
- MongoDB defaults to `mongodb://127.0.0.1:27017/birthday-wishes`
- Default admin credentials come from:
  - `ADMIN_EMAIL=admin@birthdayglow.com`
  - `ADMIN_PASSWORD=Admin@123`

### 3. Start MongoDB

Use a local MongoDB instance or MongoDB Atlas connection string.

### 4. Run the app

```bash
npm run dev
```

## Environment Variables

### Shared / Server

- `CLIENT_ORIGIN`
- `CLIENT_PUBLIC_URL`
- `SERVER_PORT`
- `SERVER_PUBLIC_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `PAYMENT_PROVIDER`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Client

- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_APP_NAME`

## Payment Notes

- Development mode works with `PAYMENT_PROVIDER=demo`
- Production mode should use `PAYMENT_PROVIDER=razorpay`
- The frontend includes Razorpay checkout loading logic
- The backend verifies payment signature before publishing the link

## Scheduling & Expiry

- `node-cron` runs every minute
- Scheduled wishes become active when `scheduleAt <= now`
- Active wishes auto-expire after 24 hours
- When SMTP is configured, scheduled deliveries can email the recipient link automatically

## Upload Strategy

- If Cloudinary credentials exist, uploads go to Cloudinary
- Otherwise uploads are saved locally under [server/uploads](/Users/singhvivek2103/Documents/CODEX/Birthday/server/uploads)

## API Routes

See [docs/api-routes.md](/Users/singhvivek2103/Documents/CODEX/Birthday/docs/api-routes.md)

## Database Schema

See [docs/database-schema.md](/Users/singhvivek2103/Documents/CODEX/Birthday/docs/database-schema.md)

## Deployment Guide

### Frontend on Vercel

1. Import the `client` directory as a Vercel project.
2. Set:
   - `VITE_API_URL=https://your-api-domain/api`
   - `VITE_RAZORPAY_KEY_ID=...`
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

### Backend on Render

1. Create a Web Service pointing to the `server` directory.
2. Add environment variables from `server/.env.example`.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Provide:
   - MongoDB URI
   - Razorpay credentials
   - SMTP credentials
   - Cloudinary credentials

## Important Notes

- Google login is not wired yet; the backend schema leaves room for `authProvider` expansion.
- Preset music URLs are placeholder-friendly public demo tracks. Swap them with licensed assets before production launch.
- Scheduled email currently sends the link automatically; if you need password delivery inside the email, add an encrypted password escrow layer or separate OTP/share flow.

## Suggested Next Upgrades

- Google OAuth with Passport or Firebase Auth
- Rich text editor for message/shayari
- Analytics for public page opens and watch time
- Admin approval workflow instead of direct moderation delete
- S3-backed uploads for larger production media volumes
