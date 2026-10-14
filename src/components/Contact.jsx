import { useState } from "react";
import { CONTACT_DETAILS, PROJECT_TYPES } from "../data/site.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

const INITIAL_VALUES = { name: "", email: "", projectType: "", message: "" };
const MESSAGE_MIN = 20;

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Please enter your name (at least 2 characters).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.projectType) {
    errors.projectType = "Please choose a project type.";
  }
  if (values.message.trim().length < MESSAGE_MIN) {
    errors.message = `Tell me a little more (at least ${MESSAGE_MIN} characters).`;
  }
  return errors;
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3 5 5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14s4.5-4 4.5-7.5A4.5 4.5 0 0 0 8 2 4.5 4.5 0 0 0 3.5 6.5C3.5 10 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="6.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2.5h2.6l1.1 3-1.6 1.2a8.5 8.5 0 0 0 3.2 3.2l1.2-1.6 3 1.1V12a1.5 1.5 0 0 1-1.6 1.5C6.4 13.3 2.7 9.6 2.5 4.1A1.5 1.5 0 0 1 3 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 13.5c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5h4L13.5 9.5a1 1 0 0 1 0 1.4l-2.6 2.6a1 1 0 0 1-1.4 0L2.5 6.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="6" r="1.25" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = { email: MailIcon, text: PinIcon, phone: PhoneIcon };

function Field({ id, label, error, hint, icon, iconTop = false, children }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}{" "}
          <span aria-hidden="true" className="font-normal text-error">
            *
          </span>
        </label>
        {hint ? (
          <span className="shrink-0 text-xs font-medium text-ink/45">{hint}</span>
        ) : null}
      </div>
      <div className="relative min-w-0">
        {icon ? (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-3.5 text-ink/35 ${
              iconTop ? "top-3.5" : "top-1/2 -translate-y-1/2"
            }`}
          >
            {icon}
          </span>
        ) : null}
        {children}
      </div>
      {error ? (
        <small id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="9.8" r="0.9" fill="currentColor" />
          </svg>
          {error}
        </small>
      ) : null}
    </div>
  );
}

const inputClass = (hasError, withIcon = false) =>
  `w-full max-w-full rounded-xl border bg-cream/50 py-3 text-ink shadow-[inset_0_1px_2px_rgba(32,28,23,0.05)] outline-none transition placeholder:text-ink/35 focus:bg-white focus:ring-2 ${
    withIcon ? "pl-10 pr-4" : "px-4"
  } ${
    hasError
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-sand hover:border-ink/30 focus:border-pine focus:ring-pine/25"
  }`;

export default function Contact() {
  // Draft autosave: typed text survives a refresh on this device.
  // (Delivery still needs a backend or form-to-email service — see notes.)
  const [values, setValues] = useLocalStorage(
    "bilal-ahmed-portfolio:contact-draft:v1",
    INITIAL_VALUES,
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    const firstName = values.name.trim();
    setStatus({
      type: "success",
      message: `Thank you, ${firstName}. Your inquiry was received — I’ll reply within two working days.`,
    });
    setValues(INITIAL_VALUES);
  };

  const messageLen = values.message.trim().length;
  const messageMet = messageLen >= MESSAGE_MIN;
  const hasDraft = Object.values(values).some((v) => v.trim().length > 0);
  const isFormValid = Object.keys(validate(values)).length === 0;

  // No-API file save: downloads the inquiry as a .txt file. Note this
  // saves to the *visitor's* device — browsers cannot write files to
  // the site owner's computer without a backend or email service.
  const handleDownloadCopy = () => {
    const projectLabel =
      PROJECT_TYPES.find((t) => t.value === values.projectType)?.label ??
      "—";
    const text = [
      "New inquiry — Bilal Ahmed Photography",
      `Date: ${new Date().toLocaleString()}`,
      "",
      `Name: ${values.name.trim() || "—"}`,
      `Email: ${values.email.trim() || "—"}`,
      `Project type: ${projectLabel}`,
      "",
      "Message:",
      values.message.trim() || "—",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `inquiry-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative overflow-hidden bg-coal py-14 text-[#f4efe7] sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-pine/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-pine/15 blur-3xl"
      />

      <Container className="relative flex flex-col items-stretch gap-10 md:flex-row md:items-start lg:gap-16">
        <div className="min-w-0 flex-1">
          <Eyebrow tone="dark">Contact — bookings open for 2026</Eyebrow>
          <h2
            id="contact-heading"
            className="font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
          >
            Book a Shoot
          </h2>
          <p className="mt-3 max-w-[65ch] text-clay">
            Portraits, weddings, editorial assignments, and commissions. Share a
            few details and I&rsquo;ll reply within two working days.
          </p>

          <ul className="mt-8 grid gap-3">
            {CONTACT_DETAILS.map((item) => {
              const Icon = ICONS[item.type] ?? PinIcon;
              return (
                <li
                  key={item.label}
                  className="flex min-w-0 items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:border-white/25"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-clay">
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-clay">
                      {item.label}
                    </strong>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="block truncate text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="block truncate">{item.value}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-clay">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Booking March–September 2026 · Travel available
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid min-w-0 flex-1 gap-5 rounded-2xl bg-white p-5 text-ink shadow-2xl ring-1 ring-black/10 sm:p-7 lg:p-8 md:flex-[1.4]"
        >
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <Field
              id="field-name"
              label="Name"
              error={errors.name}
              icon={<UserIcon />}
            >
              <input
                id="field-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Appleseed"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "field-name-error" : undefined}
                className={inputClass(errors.name, true)}
              />
            </Field>

            <Field
              id="field-email"
              label="Email"
              error={errors.email}
              icon={<MailIcon />}
            >
              <input
                id="field-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={values.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "field-email-error" : undefined}
                className={inputClass(errors.email, true)}
              />
            </Field>
          </div>

          <Field
            id="field-type"
            label="Project type"
            error={errors.projectType}
            icon={<TagIcon />}
          >
            <select
              id="field-type"
              name="projectType"
              value={values.projectType}
              onChange={handleChange}
              aria-invalid={Boolean(errors.projectType)}
              aria-describedby={errors.projectType ? "field-type-error" : undefined}
              className={`${inputClass(errors.projectType, true)} appearance-none pr-10 ${values.projectType ? "" : "text-ink/35"}`}
            >
              <option value="">Select a project type</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40"
            >
              <ChevronDownIcon />
            </span>
          </Field>

          <Field
            id="field-message"
            label="Message"
            error={errors.message}
            hint={
              <span className={messageMet ? "text-success" : undefined}>
                {messageLen}/{MESSAGE_MIN} min
              </span>
            }
          >
            <textarea
              id="field-message"
              name="message"
              rows={5}
              placeholder="Date, location, and what you have in mind…"
              value={values.message}
              onChange={handleChange}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "field-message-error" : undefined}
              className={`${inputClass(errors.message)} min-h-[7.5rem] resize-y`}
            />
          </Field>

          <div className="grid gap-2.5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-white shadow-lg shadow-pine/25 transition-all hover:bg-pine-dark active:scale-[0.98] sm:w-auto"
              >
                Send Inquiry
                <span aria-hidden="true">→</span>
              </button>
              <Button
                variant="ghost"
                onClick={handleDownloadCopy}
                disabled={!isFormValid}
                title={
                  isFormValid
                    ? "Save this inquiry as a .txt file on your device"
                    : "Fill in all fields correctly to download a copy"
                }
                className={
                  isFormValid ? "" : "cursor-not-allowed opacity-50"
                }
              >
                Download a copy (.txt)
              </Button>
            </div>
            <p className="text-xs text-ink/45">
              {hasDraft
                ? "Draft auto-saved on this device — safe to refresh."
                : "Typically replies within two working days."}
            </p>
          </div>
          {status.message ? (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "bg-green-50 text-success ring-1 ring-green-600/20"
                  : "bg-red-50 text-error ring-1 ring-red-600/20"
              }`}
            >
              {status.message}
            </p>
          ) : null}
        </form>
      </Container>
    </section>
  );
}
