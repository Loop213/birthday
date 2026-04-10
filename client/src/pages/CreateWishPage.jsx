import { useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import WishForm from "../components/forms/WishForm.jsx";
import TemplateSelector from "../components/forms/TemplateSelector.jsx";
import { birthdayTemplates, getBirthdayTemplate } from "../data/templates.js";

export default function CreateWishPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(birthdayTemplates[0].id);
  const selectedTemplate = getBirthdayTemplate(selectedTemplateId);

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

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="badge">Template-based creator</span>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Pick a 3D birthday template, then tailor every detail around it.
          </h1>
          <p className="mt-3 max-w-3xl text-white/60">
            Start from a reusable interactive scene like {selectedTemplate.shortLabel}, personalize the content, preview the experience, and publish the shareable password-protected link after payment.
          </p>
        </div>

        <div className="space-y-6">
          <TemplateSelector
            selectedTemplateId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
          />

          <div className="glass-panel p-6 sm:p-8">
            <WishForm
              selectedTemplateId={selectedTemplateId}
              onSave={handleSave}
              submitting={submitting}
            />
          </div>
        </div>
      </section>
    </>
  );
}
