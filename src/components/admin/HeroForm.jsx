"use client";

// Edit the public homepage hero section (singleton — PUT replaces it).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";
import ImagePreview from "@/components/ui/ImagePreview.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import ListEditor from "./ListEditor.jsx";

const EMPTY = {
  eyebrow: "",
  heading: "",
  subheading: "",
  primaryCta: { text: "", href: "" },
  secondaryCta: { text: "", href: "" },
  image: { src: "", alt: "", caption: "", width: "1600", height: "2000" },
  stats: [],
  press: [],
};

function toFormValues(content) {
  if (!content) return EMPTY;
  return {
    eyebrow: content.eyebrow ?? "",
    heading: content.heading ?? "",
    subheading: content.subheading ?? "",
    primaryCta: { ...content.primaryCta },
    secondaryCta: { ...content.secondaryCta },
    image: {
      src: content.image?.src ?? "",
      alt: content.image?.alt ?? "",
      caption: content.image?.caption ?? "",
      width: String(content.image?.width ?? ""),
      height: String(content.image?.height ?? ""),
    },
    stats: (content.stats ?? []).map((s) => ({ ...s })),
    press: (content.press ?? []).map((p) => ({ value: p })),
  };
}

export default function HeroForm({ content }) {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState(() => toFormValues(content));
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (path, value) => {
    setValues((prev) => {
      if (path.length === 1) return { ...prev, [path[0]]: value };
      const next = { ...prev };
      let cursor = next;
      for (let i = 0; i < path.length - 1; i += 1) cursor = cursor[path[i]];
      cursor[path[path.length - 1]] = value;
      return next;
    });
    setFieldErrors((prev) => {
      const key = path.join(".");
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    const payload = {
      eyebrow: values.eyebrow.trim(),
      heading: values.heading.trim(),
      subheading: values.subheading.trim(),
      primaryCta: {
        text: values.primaryCta.text.trim(),
        href: values.primaryCta.href.trim(),
      },
      secondaryCta: {
        text: values.secondaryCta.text.trim(),
        href: values.secondaryCta.href.trim(),
      },
      image: {
        src: values.image.src.trim(),
        alt: values.image.alt.trim(),
        caption: values.image.caption.trim(),
        width: Number(values.image.width),
        height: Number(values.image.height),
      },
      stats: values.stats
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value),
      press: values.press.map((p) => p.value.trim()).filter(Boolean),
    };

    const result = await apiSend("/api/admin/settings/hero", {
      method: "PUT",
      body: payload,
    });

    setSaving(false);

    if (!result.ok) {
      setFieldErrors(result.data?.fields ?? {});
      setStatus({
        type: "error",
        message:
          result.data?.error ??
          "Some fields need attention — please review them below.",
      });
      return;
    }

    setStatus({ type: "success", message: "Hero section saved." });
    push({
      tone: "success",
      title: "Hero section saved",
      message: "The public homepage now shows the new content.",
    });
    router.refresh();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <Button type="submit" busy={saving}>
          {saving ? undefined : "Save hero section"}
        </Button>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection
        title="Heading"
        description="The main message visitors see first."
      >
        <Field id="hero-eyebrow" label="Eyebrow" error={fieldErrors.eyebrow}>
          {(a11y) => (
            <input
              id="hero-eyebrow"
              type="text"
              value={values.eyebrow}
              onChange={(e) => set(["eyebrow"], e.target.value)}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field id="hero-heading" label="Heading" required error={fieldErrors.heading}>
          {(a11y) => (
            <input
              id="hero-heading"
              type="text"
              value={values.heading}
              onChange={(e) => set(["heading"], e.target.value)}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field
          id="hero-subheading"
          label="Subheading"
          required
          error={fieldErrors.subheading}
        >
          {(a11y) => (
            <textarea
              id="hero-subheading"
              rows={3}
              value={values.subheading}
              onChange={(e) => set(["subheading"], e.target.value)}
              className={`${inputClass} min-h-[5rem] resize-y`}
              {...a11y}
            />
          )}
        </Field>
      </FormSection>

      <FormSection title="Call-to-action buttons">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="hero-cta-primary-text"
            label="Primary — text"
            required
            error={fieldErrors["primaryCta.text"]}
          >
            {(a11y) => (
              <input
                id="hero-cta-primary-text"
                type="text"
                value={values.primaryCta.text}
                onChange={(e) => set(["primaryCta", "text"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-cta-primary-href"
            label="Primary — link"
            required
            error={fieldErrors["primaryCta.href"]}
          >
            {(a11y) => (
              <input
                id="hero-cta-primary-href"
                type="text"
                placeholder="#work"
                value={values.primaryCta.href}
                onChange={(e) => set(["primaryCta", "href"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-cta-secondary-text"
            label="Secondary — text"
            required
            error={fieldErrors["secondaryCta.text"]}
          >
            {(a11y) => (
              <input
                id="hero-cta-secondary-text"
                type="text"
                value={values.secondaryCta.text}
                onChange={(e) => set(["secondaryCta", "text"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-cta-secondary-href"
            label="Secondary — link"
            required
            error={fieldErrors["secondaryCta.href"]}
          >
            {(a11y) => (
              <input
                id="hero-cta-secondary-href"
                type="text"
                value={values.secondaryCta.href}
                onChange={(e) => set(["secondaryCta", "href"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Image"
        description="The full-bleed hero photograph with an optional caption."
      >
        <Field
          id="hero-image-src"
          label="Image URL"
          required
          error={fieldErrors["image.src"]}
        >
          {(a11y) => (
            <input
              id="hero-image-src"
              type="url"
              placeholder="https://…"
              value={values.image.src}
              onChange={(e) => set(["image", "src"], e.target.value)}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <ImagePreview src={values.image.src} alt={values.image.alt} label="Hero" />

        <div className="grid gap-5 sm:grid-cols-4">
          <Field
            id="hero-image-alt"
            label="Alt text"
            required
            className="sm:col-span-4"
            error={fieldErrors["image.alt"]}
          >
            {(a11y) => (
              <input
                id="hero-image-alt"
                type="text"
                value={values.image.alt}
                onChange={(e) => set(["image", "alt"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-image-caption"
            label="Caption"
            hint="Optional"
            className="sm:col-span-2"
            error={fieldErrors["image.caption"]}
          >
            {(a11y) => (
              <input
                id="hero-image-caption"
                type="text"
                value={values.image.caption}
                onChange={(e) => set(["image", "caption"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-image-width"
            label="Width (px)"
            required
            error={fieldErrors["image.width"]}
          >
            {(a11y) => (
              <input
                id="hero-image-width"
                type="number"
                min="1"
                value={values.image.width}
                onChange={(e) => set(["image", "width"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="hero-image-height"
            label="Height (px)"
            required
            error={fieldErrors["image.height"]}
          >
            {(a11y) => (
              <input
                id="hero-image-height"
                type="number"
                min="1"
                value={values.image.height}
                onChange={(e) => set(["image", "height"], e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Stats & press"
        description="Key figures shown under the hero and press mentions below."
      >
        <ListEditor
          label="Stats"
          rows={values.stats}
          onChange={(rows) => set(["stats"], rows)}
          template={() => ({ label: "", value: "" })}
          addLabel="Add stat"
          max={8}
          emptyMessage="No stats yet."
          fields={[
            { key: "label", label: "Label" },
            { key: "value", label: "Value" },
          ]}
        />

        <ListEditor
          label="Press mentions"
          rows={values.press}
          onChange={(rows) => set(["press"], rows)}
          template={() => ({ value: "" })}
          addLabel="Add mention"
          max={12}
          emptyMessage="No press mentions."
          fields={[{ key: "value", label: "Publication", wide: true }]}
        />
      </FormSection>
    </FormCard>
  );
}
