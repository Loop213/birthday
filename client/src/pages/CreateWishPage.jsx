import { useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import WishForm from "../components/forms/WishForm.jsx";

export default function CreateWishPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSave({ formData, intent, accessPassword }) {
    setSubmitting(true);

    try {
      const response = await api.post("/wishes", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const wishId = response.data.data._id;
      sessionStorage.setItem(`wish-password-${wishId}`, accessPassword);
      toast.success("Draft saved.");

      if (intent === "preview") {
        navigate(`/dashboard/preview/${wishId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Create Wish | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="badge">Build your page</span>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Design a birthday landing page that feels cinematic.
          </h1>
          <p className="mt-3 max-w-3xl text-white/60">
            Add memories, music, shayari, password protection, and scheduling. You can preview everything before payment.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8">
          <WishForm onSave={handleSave} submitting={submitting} />
        </div>
      </section>
    </>
  );
}
