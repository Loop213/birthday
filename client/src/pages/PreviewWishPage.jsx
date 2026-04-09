import { CheckCircle2, Copy, ExternalLink, MessageCircleMore, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import WishExperience from "../components/three/WishExperience.jsx";
import { musicPresets, themePalette } from "../data/options.js";

function formatCurrency(amount) {
  return `Rs.${(amount / 100).toFixed(2)}`;
}

async function loadRazorpayScript() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PreviewWishPage() {
  const { id } = useParams();
  const [wish, setWish] = useState(null);
  const [preview, setPreview] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [pricing, setPricing] = useState({
    baseAmount: 1000,
    discountAmount: 0,
    finalAmount: 1000
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  async function loadWish() {
    try {
      const [wishResponse, previewResponse] = await Promise.all([
        api.get(`/wishes/${id}`),
        api.get(`/wishes/${id}/preview`)
      ]);

      setWish(wishResponse.data.data);
      setPreview(previewResponse.data.data.preview);
      setPricing(wishResponse.data.data.priceBreakdown || {
        baseAmount: 1000,
        discountAmount: 0,
        finalAmount: 1000
      });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWish();
  }, [id]);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code first.");
      return;
    }

    try {
      const response = await api.post("/coupons/apply", { code: couponCode });
      setPricing(response.data.data.pricing);
      toast.success("Coupon applied.");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function verifyPayment(payload) {
    const response = await api.post("/payments/verify", payload);
    setWish(response.data.data.wish);
    toast.success("Wish published successfully.");
  }

  async function payNow() {
    if (!wish) {
      return;
    }

    setProcessing(true);

    try {
      const response = await api.post("/payments/order", {
        wishId: wish._id,
        couponCode
      });

      const order = response.data.data.order;
      setPricing(response.data.data.pricing);

      if (order.provider === "demo") {
        await verifyPayment({
          wishId: wish._id,
          orderId: order.orderId,
          demoSuccessToken: order.demoSuccessToken
        });
        await loadWish();
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Birthday Glow",
        description: `Birthday page for ${wish.recipientName}`,
        theme: {
          color: "#4bf4ff"
        },
        handler: async (paymentResult) => {
          await verifyPayment({
            wishId: wish._id,
            orderId: order.orderId,
            paymentId: paymentResult.razorpay_payment_id,
            signature: paymentResult.razorpay_signature
          });
          await loadWish();
        }
      });

      razorpay.open();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  }

  async function copyLink() {
    const link = `${window.location.origin}/wish/${wish.shareSlug}`;
    await navigator.clipboard.writeText(link);
    toast.success("Share link copied.");
  }

  function shareOnWhatsapp() {
    const link = `${window.location.origin}/wish/${wish.shareSlug}`;
    const password = sessionStorage.getItem(`wish-password-${wish._id}`) || "your chosen password";
    const text = encodeURIComponent(
      `A birthday surprise is ready for you.\n\nLink: ${link}\nPassword: ${password}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const colors = themePalette[preview?.theme || "romantic"];
  const presetTrack = musicPresets.find((preset) => preset.value === wish?.music?.preset);

  return (
    <>
      <Helmet>
        <title>Preview Wish | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading || !wish || !preview ? (
          <div className="glass-panel px-6 py-8 text-white/70">Preparing preview...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="glass-panel overflow-hidden p-6">
                <div className={`rounded-[2rem] bg-gradient-to-br ${colors.halo} p-3`}>
                  <WishExperience accent={colors.accent} glow={colors.glow} />
                </div>

                <div className="mt-6">
                  <span className="badge">{preview.theme}</span>
                  <h1 className="mt-4 text-4xl font-semibold text-white">
                    Birthday preview for {preview.recipientName}
                  </h1>
                  <p className="mt-3 text-white/65">{preview.message || "Add a personal message to deepen the reveal."}</p>
                  <blockquote className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-white/70">
                    {preview.shayari || "Your shayari will glow here once you add it to the birthday page."}
                  </blockquote>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Images</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{preview.images?.length || 0}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Music</p>
                    <p className="mt-2 text-lg text-white/80">
                      {wish.music?.type === "upload" ? "Custom upload ready" : presetTrack?.label || "Preset track"}
                    </p>
                  </div>
                </div>
              </div>

              {wish.images?.length ? (
                <div className="glass-panel p-6">
                  <h2 className="text-xl font-semibold text-white">Uploaded memories</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {wish.images.map((image) => (
                      <img
                        key={image.url}
                        src={image.url}
                        alt={wish.recipientName}
                        className="h-48 w-full rounded-[1.5rem] object-cover"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6">
                <span className="badge">Checkout</span>
                <h2 className="mt-4 text-3xl font-semibold text-white">Publish the wish page</h2>
                <p className="mt-3 text-white/60">
                  Secure payment unlocks the unique share URL. Scheduled wishes go live automatically at 12:00 AM on the selected birthday date.
                </p>

                <div className="mt-6 space-y-3">
                  <label className="space-y-2">
                    <span className="field-label">Coupon code</span>
                    <div className="flex gap-3">
                      <input
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        className="field-input"
                        placeholder="SAVE20"
                      />
                      <button type="button" onClick={applyCoupon} className="button-secondary shrink-0">
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
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.finalAmount)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={payNow}
                  disabled={processing || wish.paymentStatus === "paid"}
                  className="button-primary mt-6 w-full justify-center"
                >
                  {wish.paymentStatus === "paid"
                    ? "Already Published"
                    : processing
                      ? "Processing..."
                      : `Pay ${formatCurrency(pricing.finalAmount)}`}
                </button>
              </div>

              {wish.shareSlug ? (
                <div className="glass-panel p-6">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Wish published</span>
                  </div>
                  <p className="mt-4 break-all rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                    {window.location.origin}/wish/{wish.shareSlug}
                  </p>
                  <p className="mt-3 text-sm text-white/55">
                    Password to share:{" "}
                    <span className="font-semibold text-white/80">
                      {sessionStorage.getItem(`wish-password-${wish._id}`) || "Use the password you created earlier"}
                    </span>
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={copyLink} className="button-secondary">
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
                    <button type="button" onClick={shareOnWhatsapp} className="button-secondary">
                      <MessageCircleMore className="h-4 w-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
