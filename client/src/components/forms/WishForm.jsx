import { useEffect, useRef, useState } from "react";
import { musicPresets, relations } from "../../data/options.js";
import { getBirthdayTemplate } from "../../data/templates.js";

const PHOTO_FRAME_STYLES = [
  {
    value: "romantic",
    label: "Romantic",
    description: "Soft blush glow with dreamy rounded borders."
  },
  {
    value: "birthday",
    label: "Birthday",
    description: "Festive color pop for celebration-heavy memories."
  },
  {
    value: "neon",
    label: "Neon",
    description: "Bright glow edges for a modern premium story."
  },
  {
    value: "classic",
    label: "Classic",
    description: "Clean elegant frame with timeless styling."
  }
];

const PHOTO_TRANSITIONS = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "flip", label: "Flip" }
];

function buildDefaultForm(templateId) {
  const template = getBirthdayTemplate(templateId);

  return {
    recipientName: "",
    relation: relations[0],
    message: "",
    shayari: "",
    accessPassword: "",
    deliveryMode: "manual",
    scheduleAt: "",
    recipientEmail: "",
    recipientPhone: "",
    timezone: "Asia/Kolkata",
    musicMode: "preset",
    musicPreset: template.defaultMusicPreset,
    photoFrameStyle: "romantic",
    photoTransition: "fade"
  };
}

export default function WishForm({
  selectedTemplateId,
  onSave,
  submitting = false
}) {
  const [form, setForm] = useState(() => buildDefaultForm(selectedTemplateId));
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [musicUpload, setMusicUpload] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState(null);
  const submitIntentRef = useRef("preview");
  const previousTemplateIdRef = useRef(selectedTemplateId);
  const selectedTemplate = getBirthdayTemplate(selectedTemplateId);
  const nowLocal = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  useEffect(() => {
    const previousTemplate = getBirthdayTemplate(previousTemplateIdRef.current);
    previousTemplateIdRef.current = selectedTemplateId;

    setForm((current) => ({
      ...current,
      musicPreset:
        current.musicMode === "preset" &&
        (!current.musicPreset || current.musicPreset === previousTemplate.defaultMusicPreset)
          ? selectedTemplate.defaultMusicPreset
          : current.musicPreset
    }));
  }, [selectedTemplate.defaultMusicPreset, selectedTemplateId]);

  useEffect(() => {
    setPreviewIndex(0);
  }, [imagePreviews.length]);

  useEffect(() => () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
  }, [imagePreviews]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageSelection(event) {
    const nextFiles = Array.from(event.target.files || []).slice(0, 6);

    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));

    setImages(nextFiles);
    setImagePreviews(
      nextFiles.map((file, index) => ({
        id: `${file.name}-${index}-${file.lastModified}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file)
      }))
    );
  }

  function moveImage(fromIndex, direction) {
    const toIndex = fromIndex + direction;

    if (toIndex < 0 || toIndex >= images.length) {
      return;
    }

    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });

    setImagePreviews((current) => {
      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });

    setPreviewIndex(toIndex);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (images.length < 3 || images.length > 6) {
      return;
    }

    const payload = new FormData();

    payload.append("templateId", selectedTemplateId);

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
      <section className="glass-panel overflow-hidden p-0">
        <div className={`h-32 bg-gradient-to-br ${selectedTemplate.halo}`} />
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="badge">Step 2</span>
              <h2 className="mt-4 text-3xl font-semibold text-white">
                Personalize {selectedTemplate.shortLabel}
              </h2>
              <p className="mt-2 max-w-3xl text-white/60">
                The selected 3D stage drives the scene, motion, and mood automatically. You only need to add the personal touches.
              </p>
            </div>
            <div className="max-w-sm rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-white/65">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Interaction</p>
              <p className="mt-2">{selectedTemplate.interactionHint}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/45">Auto soundtrack</p>
              <p className="mt-2">
                {
                  musicPresets.find((preset) => preset.value === selectedTemplate.defaultMusicPreset)?.label
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTemplate.features.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

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
          <p className="text-sm text-white/45">
            This name will appear as 3D text inside the selected template.
          </p>
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
        <div className="space-y-2">
          <span className="field-label">Template Mood</span>
          <div className="field-input flex min-h-[50px] items-center justify-between">
            <span>{selectedTemplate.label}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
              Auto themed
            </span>
          </div>
        </div>

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
              <option value="scheduled">Auto-send 1 hour before birthday</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="field-label">Birthday Date & Time</span>
            <input
              type="datetime-local"
              name="scheduleAt"
              value={form.scheduleAt}
              onChange={updateField}
              min={nowLocal}
              required={form.deliveryMode === "scheduled"}
              className="field-input"
            />
            <p className="text-sm text-white/50">
              We will send the link 1 hour before this time, and the page will unlock exactly at the birthday moment.
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
              Upload 3 to 6 images, choose a frame style, pick a transition, and arrange the story order before generating the URL.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelection}
            className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/15 file:px-4 file:py-2 file:text-sm file:text-cyan-100"
          />
          <p className={`text-sm ${images.length >= 3 && images.length <= 6 ? "text-emerald-200/80" : "text-amber-200/80"}`}>
            {images.length} image(s) selected. Minimum 3 and maximum 6 required.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="field-label">Photo Frame Style</span>
              <select
                name="photoFrameStyle"
                value={form.photoFrameStyle}
                onChange={updateField}
                className="field-input"
              >
                {PHOTO_FRAME_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-white/45">
                {PHOTO_FRAME_STYLES.find((style) => style.value === form.photoFrameStyle)?.description}
              </p>
            </label>

            <label className="space-y-2">
              <span className="field-label">Photo Transition</span>
              <select
                name="photoTransition"
                value={form.photoTransition}
                onChange={updateField}
                className="field-input"
              >
                {PHOTO_TRANSITIONS.map((transition) => (
                  <option key={transition.value} value={transition.value}>
                    {transition.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {imagePreviews.length ? (
            <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Slideshow Preview</p>
                <div className="flex gap-2">
                  {imagePreviews.map((preview, index) => (
                    <button
                      key={preview.id}
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === previewIndex ? "w-8 bg-cyan-200" : "w-2.5 bg-white/25"
                      }`}
                      aria-label={`Preview photo ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/55">
                <img
                  src={imagePreviews[previewIndex]?.previewUrl}
                  alt={imagePreviews[previewIndex]?.name || "Selected preview"}
                  className={`h-64 w-full object-cover ${
                    form.photoTransition === "zoom"
                      ? "transition duration-500 hover:scale-105"
                      : form.photoTransition === "flip"
                        ? "transition duration-500 [transform:perspective(1000px)_rotateY(0deg)] hover:[transform:perspective(1000px)_rotateY(10deg)]"
                        : "transition duration-500"
                  }`}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview.id}
                    className={`rounded-[1.2rem] border p-3 ${
                      index === previewIndex ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-slate-950/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={preview.previewUrl}
                        alt={preview.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{preview.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/45">
                          Slide {index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === imagePreviews.length - 1}
                        className="button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel space-y-4 p-5">
          <div>
            <p className="field-label">Music & Voice</p>
            <p className="mt-1 text-sm text-white/55">
              Use the template soundtrack or upload a custom audio track and voice note.
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
          <p className="text-lg font-semibold text-white">Step 3: Preview before payment</p>
          <p className="mt-1 text-sm text-white/60">
            Save the draft, inspect the full interactive 3D scene, then unlock the paid share link.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            onClick={() => {
              submitIntentRef.current = "dashboard";
            }}
            disabled={submitting || images.length < 3 || images.length > 6}
            className="button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            onClick={() => {
              submitIntentRef.current = "preview";
            }}
            disabled={submitting || images.length < 3 || images.length > 6}
            className="button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save & Preview"}
          </button>
        </div>
      </div>
    </form>
  );
}
