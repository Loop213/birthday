# API Routes

Base URL: `/api`

## Health

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check for uptime and deployment validation |

## Auth

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Create a user account and receive JWT |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `GET` | `/auth/me` | Authenticated | Get current logged-in user |

## Wishes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/wishes` | Authenticated | List logged-in user's wish pages |
| `POST` | `/wishes` | Authenticated | Create a draft wish page with media uploads |
| `GET` | `/wishes/:id` | Authenticated | Get one wish by owner |
| `PUT` | `/wishes/:id` | Authenticated | Update wish details and upload more assets |
| `GET` | `/wishes/:id/preview` | Authenticated | Get a preview-friendly representation |
| `DELETE` | `/wishes/:id` | Authenticated | Remove own wish draft/page |
| `GET` | `/wishes/public/meta/:slug` | Public | Get lightweight public metadata before unlock |
| `POST` | `/wishes/public/access/:slug` | Public | Validate password and unlock wish data |

## Coupons

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/coupons/apply` | Authenticated | Validate coupon and return recalculated pricing |
| `GET` | `/coupons` | Admin | List all coupons |
| `POST` | `/coupons` | Admin | Create a coupon |
| `PUT` | `/coupons/:id` | Admin | Update coupon |
| `DELETE` | `/coupons/:id` | Admin | Delete coupon |

## Payments

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/payments/order` | Authenticated | Create payment order for a wish |
| `POST` | `/payments/verify` | Authenticated | Verify provider callback and publish wish |

## Admin

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin | Dashboard stats, revenue, and recent activity |
| `GET` | `/admin/users` | Admin | List users |
| `PATCH` | `/admin/users/:id/toggle-block` | Admin | Block or unblock non-admin users |
| `GET` | `/admin/wishes` | Admin | Review wishes for moderation |
| `DELETE` | `/admin/wishes/:id` | Admin | Moderate and deactivate a wish |
