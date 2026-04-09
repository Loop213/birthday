# Database Schema

## User

- `name`: creator/admin display name
- `email`: unique lowercase login identifier
- `passwordHash`: bcrypt hash for local auth
- `role`: `user | admin`
- `isBlocked`: admin moderation flag
- `authProvider`: `local | google`
- timestamps

## Wish

- `owner`: reference to `User`
- `recipientName`, `relation`
- `message`, `shayari`
- `theme`: `romantic | family | funny | emotional | royal | party`
- `images[]`: uploaded gallery assets
- `music`: preset or uploaded soundtrack metadata
- `voiceMessage`: optional uploaded audio note
- `accessPasswordHash`: password protection hash
- `shareSlug`: unique public URL slug
- `deliveryMode`: `manual | scheduled`
- `scheduleAt`, `recipientEmail`, `recipientPhone`, `timezone`
- `status`: `draft | pending_payment | scheduled | active | expired | moderated`
- `paymentStatus`: `unpaid | paid | refunded`
- `priceBreakdown`: `baseAmount`, `discountAmount`, `finalAmount`, `couponCode`
- `previewViews`, `deliveredAt`, `openedAt`, `expiresAt`, `isActive`
- timestamps

## Coupon

- `code`: unique uppercase coupon key
- `description`
- `discountType`: `flat | percentage`
- `discountValue`
- `maxDiscount`
- `minOrderAmount`
- `expiresAt`
- `usageLimit`, `userUsageLimit`, `usedCount`
- `isActive`
- timestamps

## Payment

- `wish`: reference to `Wish`
- `user`: reference to `User`
- `provider`: `demo | razorpay`
- `orderId`, `paymentId`, `signature`
- `amount`, `currency`
- `status`: `created | paid | failed | refunded`
- `couponCode`
- `rawPayload`: provider payload snapshot
- timestamps
