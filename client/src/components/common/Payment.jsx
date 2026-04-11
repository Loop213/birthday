import { CheckCircle2, Copy, ExternalLink, MessageCircleMore, TicketPercent } from "lucide-react";
import { getBirthdayTemplate } from "../../data/templates.js";

function formatCurrency(amount) {
  return `Rs.${(amount / 100).toFixed(2)}`;
}

function formatSchedule(value) {
  if (!value) {
    return "Manual share";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function Payment({
  wish,
  pricing,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onPayNow,
  paymentMethod,
  onPaymentMethodChange,
  processing,
  sharePassword,
  onCopyLink,
  onShareWhatsapp
}) {
  const template = getBirthdayTemplate(wish?.templateId);
  const isPublished = wish?.paymentStatus === "paid";
  const reservedUrl = wish?.shareSlug ? `${window.location.origin}/wish/${wish.shareSlug}` : "";

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <span className="badge">Checkout</span>
        <h2 className="mt-4 text-3xl font-semibold text-white">Publish the wish page</h2>
        <p className="mt-3 text-white/60">
          Template chosen: {template.label}. After payment, the password-protected link stays active for 24 hours.
        </p>

        <div className="mt-6 space-y-3">
          <div className="space-y-3">
            <span className="field-label">Payment method</span>
            <div className="grid gap-3">
              {[
                {
                  value: "razorpay",
                  label: "Online Payment",
                  description: "Pay instantly with Razorpay and activate the wish immediately."
                },
                {
                  value: "cod",
                  label: "COD / Manual Payment",
                  description: "Send the request for admin approval before the link becomes active."
                }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onPaymentMethodChange(option.value)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    paymentMethod === option.value
                      ? "border-cyan-300/40 bg-cyan-300/10 shadow-glow"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <p className="font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm text-white/60">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2">
            <span className="field-label">Coupon code</span>
            <div className="flex gap-3">
              <input
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value)}
                className="field-input"
                placeholder="SAVE20"
              />
              <button type="button" onClick={onApplyCoupon} className="button-secondary shrink-0">
                <TicketPercent className="h-4 w-4" />
                Apply
              </button>
            </div>
          </label>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between text-white/60">
            <span>Base price</span>
            <span>{formatCurrency(pricing.baseAmount)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-white/60">
            <span>Coupon savings</span>
            <span>- {formatCurrency(pricing.discountAmount)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-white/60">
            <span>Birthday schedule</span>
            <span>{formatSchedule(wish?.scheduleAt)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(pricing.finalAmount)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPayNow}
          disabled={processing || wish?.paymentStatus === "paid" || wish?.orderStatus === "pending"}
          className="button-primary mt-6 w-full justify-center"
        >
          {wish?.paymentStatus === "paid"
            ? "Already Published"
            : wish?.orderStatus === "pending"
              ? "Waiting For Admin Approval"
            : processing
              ? "Processing..."
              : paymentMethod === "cod"
                ? "Place COD Request"
                : `Pay ${formatCurrency(pricing.finalAmount)}`}
        </button>
      </div>

      {wish?.shareSlug ? (
        <div className="glass-panel p-6">
          <div className={`flex items-center gap-3 ${isPublished ? "text-emerald-300" : "text-amber-200"}`}>
            <CheckCircle2 className="h-5 w-5" />
            <span>{isPublished ? "Wish published" : "Reserved wish URL"}</span>
          </div>
          <p className="mt-4 break-all rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-white/75">
            {reservedUrl}
          </p>
          {isPublished ? (
            <>
              <p className="mt-3 text-sm text-white/55">
                Share password: <span className="font-semibold text-white/85">{sharePassword}</span>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={onCopyLink} className="button-secondary">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </button>
                <a
                  href={`/wish/${wish.shareSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button-secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
                <button type="button" onClick={onShareWhatsapp} className="button-secondary">
                  <MessageCircleMore className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>
            </>
          ) : wish?.orderStatus === "pending" ? (
            <p className="mt-3 text-sm text-white/55">
              Your COD/manual payment request has been sent to admin. The wish will activate only after approval.
            </p>
          ) : wish?.orderStatus === "rejected" ? (
            <p className="mt-3 text-sm text-rose-200/80">
              This manual payment request was rejected. Create a new request or switch to online payment.
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/55">
              The URL is reserved now, but it will stay locked until the ₹10 payment is verified.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
