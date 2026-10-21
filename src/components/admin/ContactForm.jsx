"use client";

// Edit the public Contact section (singleton — PUT replaces it).
// Inquiries are listed below the form on the same page (read-only).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import ListEditor from "./ListEditor.jsx";

const DETAIL_TYPES = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text / address" },
];

const EMPTY = {
  eyebrow: "",
  heading: "",
  blurb: "",
  details: [{ label: "", type: "email", value: "", href: "" }],
  socials: [],
};

function toFormValues(content) {
  if (!content) return EMPTY;
  return {
    eyebrow: content.eyebrow ?? "",
    heading: content.heading ?? "",
    blurb: content.blurb ?? "",
    details: (content.details ?? []).map((d) => ({
      label: d.label ?? "",
      type: d.type ?? "text",
      value: d.value ?? "",
      href: d.href ?? "",
    })),
    socials: (content.socials ?? []).map((s) => ({ ...s })),
  };
}

export default function ContactForm({ content }) {
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
      blurb: values.blurb.trim(),
      details: values.details.map((d) => ({
        label: d.label.trim(),
        type: d.type,
        value: d.value.trim(),
        href: d.href.trim(),
      })),
      socials: values.socials.map((s) => ({
        label: s.label.trim(),
        href: s.href.trim(),
      })),
    };

    const result = await apiSend("/api/admin/settings/contact", {
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

    setStatus({ type: "success", message: "Contact section saved." });
    push({
      tone: "success",
      title: "Contact section saved",
      message: "The public contact section is up to date.",
    });
    router.refresh();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <Button type="submit" busy={saving}>
          {saving ? undefined : "Save contact section"}
        </Button>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection title="Heading" description="Section intro on the homepage.">
        <Field id="contact-eyebrow" label="Eyebrow" error={fieldErrors.eyebrow}>
          {(a11y) => (
            <input
              id="contact-eyebrow"
              type="text"
              value={values.eyebrow}
              onChange={(e) => setValues((p) => ({ ...p, eyebrow: e.target.value }))}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field id="contact-heading" label="Heading" required error={fieldErrors.heading}>
          {(a11y) => (
            <input
              id="contact-heading"
              type="text"
              value={values.heading}
              onChange={(e) => setValues((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field
          id="contact-blurb"
          label="Intro paragraph"
          required
          error={fieldErrors.blurb}
        >
          {(a11y) => (
            <textarea
              id="contact-blurb"
              rows={3}
              value={values.blurb}
              onChange={(e) => setValues((p) => ({ ...p, blurb: e.target.value }))}
              className={`${inputClass} min-h-[5rem] resize-y`}
              {...a11y}
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Contact details"
        description="Ways visitors can reach the studio — rendered in order."
      >
        <ListEditor
          label="Details"
          rows={values.details}
          onChange={(rows) => setValues((p) => ({ ...p, details: rows }))}
          template={() => ({ label: "", type: "email", value: "", href: "" })}
          addLabel="Add detail"
          max={8}
          fields={[
            { key: "label", label: "Label" },
            { key: "type", label: "Type", type: "select", options: DETAIL_TYPES },
            { key: "value", label: "Value" },
            { key: "href", label: "Link", hint: "" },
          ]}
        />
      </FormSection>

      <FormSection title="Social links">
        <ListEditor
          label="Socials"
          rows={values.socials}
          onChange={(rows) => setValues((p) => ({ ...p, socials: rows }))}
          template={() => ({ label: "", href: "" })}
          addLabel="Add social link"
          max={8}
          emptyMessage="No social links."
          fields={[
            { key: "label", label: "Label" },
            { key: "href", label: "URL" },
          ]}
        />
      </FormSection>
    </FormCard>
  );
}
