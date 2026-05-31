# Rangstone Tourism Backend

Production-ready Node.js backend for Rangstone Tourism using Express, PostgreSQL, Prisma, JWT access and refresh tokens, Firebase Storage uploads, Razorpay payments, RBAC, Joi validation, Helmet, CORS, rate limiting, and Swagger docs.

## Modules

- Auth: OTP, register, login, refresh token rotation, logout, profile, new/existing user check.
- Users: create, update, delete, block/unblock, role updates, activity logs.
- Packages: package CRUD, trip dates, pickup points, Firebase Storage images, captain assignment.
- Bookings: package, hotel, and vehicle bookings, ticket generation, cancellation, booking history.
- Captains: assigned trips, ticket verification, boarded/not-boarded marking.
- Agents: referral code, bookings, commission history, monthly payout calculation.
- Agent Management: per-agent booking permissions, per-service percentage/fixed commissions, wallets, commission transactions, payouts, and agent/admin dashboards.
- Hotels: hotel CRUD, rooms, room photos, booking support.
- Vehicles: car, bike, scooter rental CRUD, booking and rent calculation.
- Payments: Razorpay order creation, verification, transactions, refunds.
- Reviews: package, hotel, vehicle reviews with admin hide/delete.
- Dashboard: users, bookings, revenue, payouts, active inventory, recent bookings, revenue graph data.

## Setup

```bash
npm install
copy .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Swagger runs at:

```text
http://localhost:5000/api-docs
```

Health check:

```text
GET /health
```

## Environment

Use `.env.example` as the source of required configuration. Do not commit real `.env` files or Firebase service account JSON.

For local OTP testing, set:

```env
OTP_DELIVERY_MODE=log
```

That logs OTPs to the server console instead of calling Fast2SMS.

## Firebase Storage

Firebase is used only for image/file uploads. Configure one of:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`

Also set:

```env
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

## Seeded Login

`npm run db:seed` creates all roles and a super admin:

```json
{
  "phoneNumber": "9999999999",
  "password": "ChangeMe123!"
}
```

Change these values in `.env` before production.

## API Response Shape

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Scripts

- `npm start`: run production server.
- `npm run dev`: run with nodemon.
- `npm run db:generate`: generate Prisma client.
- `npm run db:migrate`: run development migration.
- `npm run db:migrate:prod`: deploy migrations.
- `npm run db:seed`: seed roles and super admin.
- `npm run db:studio`: open Prisma Studio.
- `npm run postman`: generate `Rangstone-Tourism.postman_collection.json` from Swagger paths.

## Agent Permission & Commission APIs

Admin routes:

```text
GET    /api/admin/agents
GET    /api/admin/agents/:id
GET    /api/admin/agents/:id/permissions
PUT    /api/admin/agents/:id/permissions
GET    /api/admin/agents/:id/commission-rules
PUT    /api/admin/agents/:id/commission-rules
GET    /api/admin/agents/:id/wallet
GET    /api/admin/agents/:id/transactions
GET    /api/admin/payouts
POST   /api/admin/payouts
PATCH  /api/admin/payouts/:id/approve
PATCH  /api/admin/payouts/:id/pay
```

Agent routes:

```text
GET /api/agent/dashboard
GET /api/agent/wallet
GET /api/agent/commission-history
GET /api/agent/payout-history
```

When an `AGENT_VENDOR` creates a booking, the backend checks `agent_permissions` first. If allowed, it creates a pending commission transaction and increments the agent wallet pending amount. When the booking is confirmed, the commission moves from pending balance to available balance.

## Security Notes

- Use strong JWT secrets in production.
- Keep Firebase service accounts and `.env` outside Git.
- Set `NODE_ENV=production`.
- Restrict `CORS_ORIGIN` to trusted frontend origins.
- Configure HTTPS and `TRUST_PROXY=true` behind a trusted proxy.
