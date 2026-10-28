"use client";

// Change the signed-in user's password. Posts to PATCH
// /api/account/password, which verifies the CURRENT password against
// the stored bcrypt hash before writing the new one — this form never
// touches a hash, and no password value ever leaves the request body.
//
// Success clears every field (a password should never linger in a
// form) and confirms with the inline FormStatus banner — this page is
// on the public site, where there is no ToastProvider.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Field, { inputClass } from "@/components/ui/Field.jsx";
import FormCard, { FormSection } from "@/components/ui/FormCard.jsx";
import FormStatus from "@/components/ui/FormStatus.jsx";
import PasswordInput from "@/components/ui/PasswordInput.jsx";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function PasswordForm() {
  const router = useRouter();

  const [values, setValues] = useState(EMPTY);
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
    if (saving) return;
    setStatus(null);

    // Confirm the new password client-side before bothering the server.
    if (values.newPassword !== values.confirmPassword) {
      setFieldErrors({
        confirmPassword: "Both entries of the new password must match.",
      });
      setStatus({
        type: "error",
        message: "Some fields need attention — please review them below.",
      });
      return;
    }

    setSaving(true);

    const result = await apiSend("/api/account/password", {
      method: "PATCH",
      body: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
    });

    setSaving(false);

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

    setValues(EMPTY);
    setStatus({
      type: "success",
      message: "Your password has been changed. Use it the next time you sign in.",
    });
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      footer={
        <Button
          type="submit"
          busy={saving}
          disabled={
            !values.currentPassword ||
            !values.newPassword ||
            !values.confirmPassword
          }
        >
          Change password
        </Button>
      }
    >
      {status ? <FormStatus status={status} /> : null}

      <FormSection
        title="Change password"
        description="Enter your current password to confirm it's you, then choose a new one of at least 8 characters."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="account-current-password"
            label="Current password"
            required
            error={fieldErrors.currentPassword}
            className="sm:col-span-3"
          >
            {(a11y) => (
              <PasswordInput
                id="account-current-password"
                name="currentPassword"
                autoComplete="current-password"
                maxLength={100}
                value={values.currentPassword}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="account-new-password"
            label="New password"
            required
            hint="At least 8 characters"
            error={fieldErrors.newPassword}
          >
            {(a11y) => (
              <PasswordInput
                id="account-new-password"
                name="newPassword"
                autoComplete="new-password"
                maxLength={100}
                value={values.newPassword}
                onChange={handleChange}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>

          <Field
            id="account-confirm-password"
            label="Confirm new password"
            required
            error={fieldErrors.confirmPassword}
          >
            {(a11y) => (
              <PasswordInput
                id="account-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                maxLength={100}
                value={values.confirmPassword}
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
