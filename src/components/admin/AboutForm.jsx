"use client";

// Edit the public About section (singleton — PUT replaces it).
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
  paragraphs: [{ value: "" }],
  ctaText: "",
  ctaHref: "",
  image: { src: "", alt: "", width: "900", height: "1100" },
};

function toFormValues(content) {
  if (!content) return EMPTY;
  const paragraphs = (content.paragraphs ?? []).map((p) => ({ value: p }));
  return {
    eyebrow: content.eyebrow ?? "",
    heading: content.heading ?? "",
    paragraphs: paragraphs.length ? paragraphs : [{ value: "" }],
    ctaText: content.ctaText ?? "",
    ctaHref: content.ctaHref ?? "",
    image: {
      src: content.image?.src ?? "",
      alt: content.image?.alt ?? "",
      width: String(content.image?.width ?? ""),
      height: String(content.image?.height ?? ""),
    },
  };
}

export default function AboutForm({ content }) {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState(() => toFormValues(content));
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    const payload = {
      eyebrow: values.eyebrow.trim(),
      heading: values.heading.trim(),
      paragraphs: values.paragraphs.map((p) => p.value.trim()).filter(Boolean),
      ctaText: values.ctaText.trim(),
      ctaHref: values.ctaHref.trim(),
      image: {
        src: values.image.src.trim(),
        alt: values.image.alt.trim(),
        width: Number(values.image.width),
        height: Number(values.image.height),
      },
    };

    const result = await apiSend("/api/admin/settings/about", {
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

    setStatus({ type: "success", message: "About section saved." });
    push({
      tone: "success",
      title: "About section saved",
      message: "The public about section is up to date.",
    });
    router.refresh();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <Button type="submit" busy={saving}>
          {saving ? undefined : "Save about section"}
        </Button>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection title="Heading" description="Section intro on the homepage.">
        <Field id="about-eyebrow" label="Eyebrow" error={fieldErrors.eyebrow}>
          {(a11y) => (
            <input
              id="about-eyebrow"
              type="text"
              value={values.eyebrow}
              onChange={(e) => setValues((p) => ({ ...p, eyebrow: e.target.value }))}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field id="about-heading" label="Heading" required error={fieldErrors.heading}>
          {(a11y) => (
            <input
              id="about-heading"
              type="text"
              value={values.heading}
              onChange={(e) => setValues((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Biography"
        description="One paragraph per row — they render in order."
      >
        <ListEditor
          label="Paragraphs"
          rows={values.paragraphs}
          onChange={(rows) => setValues((p) => ({ ...p, paragraphs: rows }))}
          template={() => ({ value: "" })}
          addLabel="Add paragraph"
          max={6}
          emptyMessage="Add at least one paragraph."
          fields={[
            { key: "value", label: "Paragraph", type: "textarea", wide: true },
          ]}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="about-cta-text"
            label="Button text"
            required
            error={fieldErrors.ctaText}
          >
            {(a11y) => (
              <input
                id="about-cta-text"
                type="text"
                value={values.ctaText}
                onChange={(e) => setValues((p) => ({ ...p, ctaText: e.target.value }))}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="about-cta-href"
            label="Button link"
            required
            error={fieldErrors.ctaHref}
          >
            {(a11y) => (
              <input
                id="about-cta-href"
                type="text"
                placeholder="#contact"
                value={values.ctaHref}
                onChange={(e) => setValues((p) => ({ ...p, ctaHref: e.target.value }))}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Profile image"
        description="Photograph shown beside the biography."
      >
        <Field
          id="about-image-src"
          label="Image URL"
          required
          error={fieldErrors["image.src"]}
        >
          {(a11y) => (
            <input
              id="about-image-src"
              type="url"
              placeholder="https://…"
              value={values.image.src}
              onChange={(e) =>
                setValues((p) => ({ ...p, image: { ...p.image, src: e.target.value } }))
              }
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <ImagePreview src={values.image.src} alt={values.image.alt} label="Profile" />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="about-image-alt"
            label="Alt text"
            required
            className="sm:col-span-3"
            error={fieldErrors["image.alt"]}
          >
            {(a11y) => (
              <input
                id="about-image-alt"
                type="text"
                value={values.image.alt}
                onChange={(e) =>
                  setValues((p) => ({ ...p, image: { ...p.image, alt: e.target.value } }))
                }
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="about-image-width"
            label="Width (px)"
            required
            error={fieldErrors["image.width"]}
          >
            {(a11y) => (
              <input
                id="about-image-width"
                type="number"
                min="1"
                value={values.image.width}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    image: { ...p.image, width: e.target.value },
                  }))
                }
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field
            id="about-image-height"
            label="Height (px)"
            required
            error={fieldErrors["image.height"]}
          >
            {(a11y) => (
              <input
                id="about-image-height"
                type="number"
                min="1"
                value={values.image.height}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    image: { ...p.image, height: e.target.value },
                  }))
                }
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
        </div>
      </FormSection>
    </FormCard>
  );
}
