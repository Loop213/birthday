import { ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import Payment from "../components/common/Payment.jsx";
import WishViewer from "../components/common/WishViewer.jsx";
import { getBirthdayTemplate } from "../data/templates.js";

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
    if (!wish?.shareSlug) {
      return;
    }

    const link = `${window.location.origin}/wish/${wish.shareSlug}`;
    await navigator.clipboard.writeText(link);
    toast.success("Share link copied.");
  }

  function shareOnWhatsapp() {
    if (!wish?.shareSlug) {
      return;
    }

    const link = `${window.location.origin}/wish/${wish.shareSlug}`;
    const password = sessionStorage.getItem(`wish-password-${wish._id}`) || "your chosen password";
    const text = encodeURIComponent(
      `A birthday surprise is ready for you.\n\nLink: ${link}\nPassword: ${password}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const renderedWish = useMemo(() => {
    if (!wish && !preview) {
      return null;
    }

    return {
      ...(wish || {}),
      ...(preview || {})
    };
  }, [preview, wish]);

  const template = getBirthdayTemplate(renderedWish?.templateId);
  const sharePassword = wish ? sessionStorage.getItem(`wish-password-${wish._id}`) || "Use the password you created earlier" : "";
  const shareUrl = wish?.shareSlug ? `${window.location.origin}/wish/${wish.shareSlug}` : "";

  return (
    <>
      <Helmet>
        <title>Preview Wish | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="badge">Step 4</span>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Preview the full 3D celebration before publishing it.
          </h1>
          <p className="mt-3 max-w-3xl text-white/60">
            Check the interactive template, message flow, media, and soundtrack. Once it feels right, payment generates the password-protected URL.
          </p>
        </div>

        {loading || !wish || !renderedWish ? (
          <div className="glass-panel px-6 py-8 text-white/70">Preparing template preview...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WishViewer
              wish={renderedWish}
              mode="preview"
              shareUrl={shareUrl}
              allowShare={Boolean(wish.shareSlug)}
            />

            <div className="space-y-6">
              <Payment
                wish={wish}
                pricing={pricing}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                onPayNow={payNow}
                processing={processing}
                sharePassword={sharePassword}
                onCopyLink={copyLink}
                onShareWhatsapp={shareOnWhatsapp}
              />

              <div className="glass-panel p-6">
                <span className="badge">Template Blueprint</span>
                <h2 className="mt-4 text-2xl font-semibold text-white">{template.label}</h2>
                <p className="mt-3 text-white/60">{template.description}</p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 text-cyan-100">
                      <Sparkles className="h-4 w-4" />
                      <span>Interaction</span>
                    </div>
                    <p className="mt-3 text-sm text-white/65">{template.interactionHint}</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 text-white/80">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      <span>Protection</span>
                    </div>
                    <p className="mt-3 text-sm text-white/65">
                      Every published page is password protected and only stays active for 24 hours after activation.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 text-white/80">
                      <TimerReset className="h-4 w-4 text-amber-200" />
                      <span>Scheduling</span>
                    </div>
                    <p className="mt-3 text-sm text-white/65">
                      Scheduled wishes go live automatically at 12:00 AM on the selected birthday date.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-white/60"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
