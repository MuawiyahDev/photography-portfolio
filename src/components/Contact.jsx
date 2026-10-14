import { useState } from "react";
import { CONTACT_DETAILS, PROJECT_TYPES } from "../data/site.js";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

const INITIAL_VALUES = { name: "", email: "", projectType: "", message: "" };

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
  if (values.message.trim().length < 20) {
    errors.message = "Tell me a little more (at least 20 characters).";
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

const ICONS = { email: MailIcon, text: PinIcon, phone: PhoneIcon };

function Field({ id, label, error, children }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <small id={`${id}-error`} className="text-sm text-error">
          {error}
        </small>
      ) : null}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full max-w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/35 focus:ring-2 ${
    hasError
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-sand focus:border-pine focus:ring-pine/25"
  }`;

export default function Contact() {
  const [values, setValues] = useState(INITIAL_VALUES);
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
                  className="flex min-w-0 items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
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
          className="grid min-w-0 flex-1 gap-4 rounded-2xl bg-white p-5 text-ink shadow-2xl ring-1 ring-black/10 sm:p-7 lg:p-8 md:flex-[1.4]"
        >
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field id="field-name" label="Name" error={errors.name}>
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
                className={inputClass(errors.name)}
              />
            </Field>

            <Field id="field-email" label="Email" error={errors.email}>
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
                className={inputClass(errors.email)}
              />
            </Field>
          </div>

          <Field id="field-type" label="Project type" error={errors.projectType}>
            <select
              id="field-type"
              name="projectType"
              value={values.projectType}
              onChange={handleChange}
              aria-invalid={Boolean(errors.projectType)}
              aria-describedby={errors.projectType ? "field-type-error" : undefined}
              className={inputClass(errors.projectType)}
            >
              <option value="">Select a project type</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="field-message" label="Message" error={errors.message}>
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

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-pine px-6 py-3.5 font-semibold text-white transition-colors hover:bg-pine-dark sm:w-auto sm:justify-self-start"
          >
            Send Inquiry →
          </button>
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
