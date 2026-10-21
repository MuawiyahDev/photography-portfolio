"use client";

// Create or edit one category — a filter tab on the public gallery.
// `category` is null when creating. The slug is only settable on
// create (works reference it) and can be left empty to derive from
// the label on the server.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

export default function CategoryForm({ category = null, onCancel, onSaved }) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(category);

  const [values, setValues] = useState({
    label: category?.label ?? "",
    slug: category?.slug ?? "",
    order: category?.order !== undefined ? String(category.order) : "",
  });
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

    const payload = isEdit
      ? {
          label: values.label.trim(),
          order: values.order === "" ? 0 : Number(values.order),
        }
      : {
          label: values.label.trim(),
          slug: values.slug.trim(),
          ...(values.order === ""
            ? {}
            : { order: Number(values.order) }),
        };

    const result = await apiSend(
      isEdit ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
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
      title: isEdit ? "Category updated" : "Category created",
      message: `“${payload.label}” ${
        isEdit ? "was saved." : "is now a tab in the public gallery."
      }`,
    });
    router.refresh();
    onSaved?.();
    if (!isEdit) {
      setValues({ label: "", slug: "", order: "" });
    }
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <>
          {isEdit ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" busy={saving}>
            {saving
              ? undefined
              : isEdit
                ? "Save changes"
                : "Create category"}
          </Button>
        </>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection
        title={isEdit ? `Edit “${category.label}”` : "New category"}
        description={
          isEdit
            ? "Rename the tab or change its sort position. The slug stays fixed because works reference it."
            : "Each category appears as a filter tab in the public gallery. Leave the slug empty to derive it from the label."
        }
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="category-label"
            label="Label"
            required
            hint="Shown on the tab — e.g. Fine Art"
            error={fieldErrors.label}
            className="sm:col-span-1"
          >
            {(a11y) => (
              <input
                id="category-label"
                name="label"
                type="text"
                required
                maxLength={40}
                placeholder="Fine Art"
                value={values.label}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          {!isEdit ? (
            <Field
              id="category-slug"
              label="Slug"
              hint="Optional — lowercase words separated by hyphens"
              error={fieldErrors.slug}
            >
              {(a11y) => (
                <input
                  id="category-slug"
                  name="slug"
                  type="text"
                  maxLength={64}
                  placeholder="fine-art"
                  value={values.slug}
                  onChange={handleChange}
                  className={inputClass}
                  {...a11y}
                />
              )}
            </Field>
          ) : null}

          <Field
            id="category-order"
            label="Order"
            hint="Sort position among the tabs"
            error={fieldErrors.order}
          >
            {(a11y) => (
              <input
                id="category-order"
                name="order"
                type="number"
                min={0}
                placeholder={isEdit ? String(category.order) : "0"}
                value={values.order}
                onChange={handleChange}
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
