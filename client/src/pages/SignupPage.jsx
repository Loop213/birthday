import { useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractErrorMessage } from "../api/http.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signup(form);
      toast.success("Account created. Let’s design the first wish.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Signup | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto flex min-h-[82vh] max-w-6xl items-center px-4 pt-28 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <span className="badge">Launch your studio</span>
            <h1 className="text-5xl font-semibold text-white">Start crafting premium birthday moments.</h1>
            <p className="max-w-xl text-lg leading-8 text-white/65">
              Create immersive pages with animations, music, protected links, scheduling, and monetized delivery.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-3xl font-semibold text-white">Create account</h2>
                <p className="mt-2 text-white/55">We’ll drop you straight into the creator dashboard.</p>
              </div>

              <label className="space-y-2">
                <span className="field-label">Full Name</span>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  className="field-input"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Password</span>
                <input
                  type="password"
                  className="field-input"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </label>

              <button type="submit" disabled={submitting} className="button-primary w-full justify-center">
                {submitting ? "Creating..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-white/55">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-cyan-200">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
