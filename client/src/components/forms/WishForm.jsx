import { useRef, useState } from "react";
import { musicPresets, relations, themes } from "../../data/options.js";

const defaultForm = {
  recipientName: "",
  relation: relations[0],
  message: "",
  shayari: "",
  theme: themes[0].value,
  accessPassword: "",
  deliveryMode: "manual",
  scheduleAt: "",
  recipientEmail: "",
  recipientPhone: "",
  timezone: "Asia/Kolkata",
  musicMode: "preset",
  musicPreset: musicPresets[0].value
};

export default function WishForm({ onSave, submitting = false }) {
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [musicUpload, setMusicUpload] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState(null);
  const submitIntentRef = useRef("preview");
  const today = new Date().toISOString().slice(0, 10);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        payload.append(key, value);
      }
    });

    images.forEach((file) => payload.append("images", file));

    if (musicUpload) {
      payload.append("musicUpload", musicUpload);
    }

    if (voiceMessage) {
      payload.append("voiceMessage", voiceMessage);
    }

    await onSave({
      formData: payload,
      intent: submitIntentRef.current,
      accessPassword: form.accessPassword
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="field-label">Recipient Name</span>
          <input
            name="recipientName"
            value={form.recipientName}
            onChange={updateField}
            required
            className="field-input"
            placeholder="Aarohi"
          />
        </label>

        <label className="space-y-2">
          <span className="field-label">Relation</span>
          <select
            name="relation"
            value={form.relation}
            onChange={updateField}
            className="field-input"
          >
            {relations.map((relation) => (
              <option key={relation} value={relation}>
                {relation}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="field-label">Main Message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={updateField}
            className="field-input min-h-32"
            placeholder="Write a heartfelt birthday message..."
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="field-label">Shayari / Poetic Note</span>
          <textarea
            name="shayari"
            value={form.shayari}
            onChange={updateField}
            className="field-input min-h-28"
            placeholder="Tumhari muskaan se hi meri duniya roshan hai..."
          />
        </label>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="field-label">Theme</span>
          <select
            name="theme"
            value={form.theme}
            onChange={updateField}
            className="field-input"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="field-label">Access Password</span>
          <input
            type="password"
            name="accessPassword"
            value={form.accessPassword}
            onChange={updateField}
            required
            className="field-input"
            placeholder="Secret password for recipient"
          />
        </label>

        <label className="space-y-2">
          <span className="field-label">Timezone</span>
          <input
            name="timezone"
            value={form.timezone}
            onChange={updateField}
            className="field-input"
          />
        </label>
      </section>

      <section className="glass-panel space-y-5 p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="field-label">Delivery Mode</span>
            <select
              name="deliveryMode"
              value={form.deliveryMode}
              onChange={updateField}
              className="field-input"
            >
              <option value="manual">Manual Share</option>
              <option value="scheduled">Auto-send at birthday time</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="field-label">Birthday Schedule</span>
            <input
              type="date"
              name="scheduleAt"
              value={form.scheduleAt}
              onChange={updateField}
              min={today}
              required={form.deliveryMode === "scheduled"}
              className="field-input"
            />
            <p className="text-sm text-white/50">
              Auto-send will trigger at 12:00 AM on the selected birthday date.
            </p>
          </label>

          <label className="space-y-2">
            <span className="field-label">Recipient Email</span>
            <input
              type="email"
              name="recipientEmail"
              value={form.recipientEmail}
              onChange={updateField}
              className="field-input"
              placeholder="recipient@example.com"
            />
          </label>

          <label className="space-y-2">
            <span className="field-label">Recipient Phone</span>
            <input
              name="recipientPhone"
              value={form.recipientPhone}
              onChange={updateField}
              className="field-input"
              placeholder="+91 98XXXXXX12"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel space-y-4 p-5">
          <div>
            <p className="field-label">Memory Gallery</p>
            <p className="mt-1 text-sm text-white/55">
              Upload up to 6 images for the cinematic reveal.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setImages(Array.from(event.target.files || []))}
            className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/15 file:px-4 file:py-2 file:text-sm file:text-cyan-100"
          />
          <p className="text-sm text-white/55">{images.length} image(s) selected</p>
        </div>

        <div className="glass-panel space-y-4 p-5">
          <div>
            <p className="field-label">Music & Voice</p>
            <p className="mt-1 text-sm text-white/55">
              Choose a preset soundtrack or upload your own audio.
            </p>
          </div>

          <div className="grid gap-3">
            <label className="inline-flex items-center gap-3 text-sm text-white/75">
              <input
                type="radio"
                name="musicMode"
                value="preset"
                checked={form.musicMode === "preset"}
                onChange={updateField}
              />
              Use preset music
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-white/75">
              <input
                type="radio"
                name="musicMode"
                value="upload"
                checked={form.musicMode === "upload"}
                onChange={updateField}
              />
              Upload custom track
            </label>
          </div>

          {form.musicMode === "preset" ? (
            <select
              name="musicPreset"
              value={form.musicPreset}
              onChange={updateField}
              className="field-input"
            >
              {musicPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => setMusicUpload(event.target.files?.[0] || null)}
              className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-fuchsia-400/15 file:px-4 file:py-2 file:text-sm file:text-fuchsia-100"
            />
          )}

          <div className="space-y-2">
            <span className="field-label">Voice Message Upload</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => setVoiceMessage(event.target.files?.[0] || null)}
              className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-amber-300/15 file:px-4 file:py-2 file:text-sm file:text-amber-100"
            />
          </div>
        </div>
      </section>

      <div className="glass-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Preview before payment</p>
          <p className="mt-1 text-sm text-white/60">
            Save the draft, inspect the full immersive experience, then unlock the paid share link.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            onClick={() => {
              submitIntentRef.current = "dashboard";
            }}
            disabled={submitting}
            className="button-secondary justify-center"
          >
            {submitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            onClick={() => {
              submitIntentRef.current = "preview";
            }}
            disabled={submitting}
            className="button-primary justify-center"
          >
            {submitting ? "Saving..." : "Save & Preview"}
          </button>
        </div>
      </div>
    </form>
  );
}
