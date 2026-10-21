"use client";

// Create / edit form for one portfolio work, grouped into sections
// (details, image with live preview, display). `work` is null when
// creating. `categories` is the DB-managed tab list — the select
// mirrors exactly what the public gallery offers. Server validation
// errors land next to their fields; the server remains the security
// boundary.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass, selectClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";
import ImagePreview from "@/components/ui/ImagePreview.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

const EMPTY = {
  slug: "",
  title: "",
  category: "",
  src: "",
  alt: "",
  width: "900",
  height: "900",
  span: "",
  description: "",
  link: "",
};

function toFormValues(work, categories) {
  // Default new works to the first tab (same as the gallery order).
  const fallback = categories[0]?.slug ?? "";
  if (!work) return { ...EMPTY, category: fallback };
  return {
    slug: work.id ?? "",
    title: work.title ?? "",
    category: work.category ?? fallback,
    src: work.src ?? "",
    alt: work.alt ?? "",
    width: String(work.width ?? ""),
    height: String(work.height ?? ""),
    span: work.span ?? "",
    description: work.description ?? "",
    link: work.link ?? "",
  };
}

export default function WorkForm({ work, categories = [] }) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(work);
  const [values, setValues] = useState(() => toFormValues(work, categories));
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    const payload = {
      title: values.title.trim(),
      category: values.category,
      src: values.src.trim(),
      alt: values.alt.trim(),
      width: Number(values.width),
      height: Number(values.height),
      span: values.span || null,
      description: values.description.trim() || null,
      link: values.link.trim() || null,
      ...(isEdit ? {} : { slug: values.slug.trim() }),
    };

    const result = await apiSend(
      isEdit ? `/api/admin/works/${work.id}` : "/api/admin/works",
      { method: isEdit ? "PATCH" : "POST", body: payload },
    );

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

    push({
      tone: "success",
      title: isEdit ? "Work updated" : "Work created",
      message: `“${payload.title}” is live on the public site.`,
    });
    router.push("/admin/works");
    router.refresh();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/works")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" busy={saving}>
            {saving ? undefined : isEdit ? "Save changes" : "Create work"}
          </Button>
        </>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection
        title="Details"
        description="How the work is identified in the gallery and its URL."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="work-title"
            label="Title"
            required
            error={fieldErrors.title}
          >
            {(a11y) => (
              <input
                id="work-title"
                name="title"
                type="text"
                required
                value={values.title}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="work-slug"
            label="Slug"
            required
            hint={
              isEdit
                ? "Identifies the work — cannot change"
                : "Lowercase, hyphenated — e.g. golden-hour"
            }
            error={fieldErrors.slug}
          >
            {(a11y) => (
              <input
                id="work-slug"
                name="slug"
                type="text"
                required
                disabled={isEdit}
                placeholder="golden-hour"
                value={values.slug}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
        </div>

        <Field
          id="work-category"
          label="Category"
          required
          hint={
            categories.length === 0
              ? "No categories yet — add one in the Categories section first."
              : "Filter tab shown in the public gallery"
          }
          error={fieldErrors.category}
        >
          {(a11y) => (
            <select
              id="work-category"
              name="category"
              required
              disabled={categories.length === 0}
              value={values.category}
              onChange={handleChange}
              className={selectClass}
              {...a11y}
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Image"
        description="Paste a full image URL — the preview updates as you type."
      >
        <Field
          id="work-src"
          label="Image URL"
          required
          error={fieldErrors.src}
        >
          {(a11y) => (
            <input
              id="work-src"
              name="src"
              type="url"
              required
              placeholder="https://…"
              value={values.src}
              onChange={handleChange}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <ImagePreview src={values.src} alt={values.alt} label="Gallery" />

        <Field
          id="work-alt"
          label="Image description (alt text)"
          required
          hint="Used by screen readers"
          error={fieldErrors.alt}
        >
          {(a11y) => (
            <input
              id="work-alt"
              name="alt"
              type="text"
              required
              value={values.alt}
              onChange={handleChange}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Display"
        description="Layout sizing in the mosaic gallery and optional extra content."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="work-width"
            label="Width (px)"
            required
            error={fieldErrors.width}
          >
            {(a11y) => (
              <input
                id="work-width"
                name="width"
                type="number"
                min="1"
                required
                value={values.width}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="work-height"
            label="Height (px)"
            required
            error={fieldErrors.height}
          >
            {(a11y) => (
              <input
                id="work-height"
                name="height"
                type="number"
                min="1"
                required
                value={values.height}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="work-span"
            label="Mosaic span"
            hint="Affects gallery layout"
            error={fieldErrors.span}
          >
            {(a11y) => (
              <select
                id="work-span"
                name="span"
                value={values.span}
                onChange={handleChange}
                className={selectClass}
                {...a11y}
              >
                <option value="">Normal</option>
                <option value="wide">Wide</option>
                <option value="tall">Tall</option>
              </select>
            )}
          </Field>
        </div>

        <Field
          id="work-description"
          label="Description"
          hint="Optional — shown in the work's detail view"
          error={fieldErrors.description}
        >
          {(a11y) => (
            <textarea
              id="work-description"
              name="description"
              rows={4}
              value={values.description}
              onChange={handleChange}
              className={`${inputClass} min-h-[6rem] resize-y`}
              {...a11y}
            />
          )}
        </Field>

        <Field
          id="work-link"
          label="Project link"
          hint="Optional — shown as a “View project” action"
          error={fieldErrors.link}
        >
          {(a11y) => (
            <input
              id="work-link"
              name="link"
              type="url"
              placeholder="https://…"
              value={values.link}
              onChange={handleChange}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>
      </FormSection>
    </FormCard>
  );
}
