"use client";

// Edit the signed-in user's name and email. Posts to PATCH /api/account,
// which scopes the write to session.user.id — this component never
// sends (or could send) a target user id.
//
// This page lives on the public site, which has no ToastProvider
// (toasts are dashboard-only), so success is confirmed with the inline
// FormStatus banner. After a save, useSession().update() syncs the
// header dropdown's display name/email with the fresh values.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const { update } = useSession();

  const [values, setValues] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const isDirty =
    values.name.trim() !== (user.name ?? "") ||
    values.email.trim() !== user.email;

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
    if (!isDirty || saving) return;
    setStatus(null);
    setSaving(true);

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
    };

    const result = await apiSend("/api/account", {
      method: "PATCH",
      body: payload,
    });

    setSaving(false);

    // Session expired — send them to the login page like the rest of
    // the app does on a 401.
    if (result.status === 401) {
      router.push("/login");
      return;
    }

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

    // Keep the session token's display values in sync, then re-render
    // the server components (account page, header) from the database.
    await update({ name: payload.name, email: payload.email }).catch(() => {});
    setStatus({
      type: "success",
      message: "Your profile changes have been saved.",
    });
    router.refresh();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <>
          {isDirty ? (
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => {
                setValues({ name: user.name ?? "", email: user.email ?? "" });
                setFieldErrors({});
                setStatus(null);
              }}
            >
              Discard
            </Button>
          ) : null}
          <Button type="submit" busy={saving} disabled={!isDirty}>
            Save changes
          </Button>
        </>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection
        title="Profile"
        description="Your name and email identify your account. The email is also where order confirmations are sent."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="account-name"
            label="Name"
            required
            error={fieldErrors.name}
          >
            {(a11y) => (
              <input
                id="account-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={120}
                placeholder="Your name"
                value={values.name}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="account-email"
            label="Email"
            required
            hint="Used to sign in"
            error={fieldErrors.email}
          >
            {(a11y) => (
              <input
                id="account-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                value={values.email}
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
