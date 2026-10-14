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
  `w-full max-w-full rounded-lg border bg-white px-3.5 py-3 text-ink ${
    hasError ? "border-error" : "border-sand"
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
      className="bg-coal py-14 text-[#f4efe7] sm:py-20"
    >
      <Container className="flex flex-col items-stretch gap-8 md:flex-row md:items-start lg:gap-16">
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

          <ul className="mt-7 list-none border-t border-white/15">
            {CONTACT_DETAILS.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 border-b border-white/15 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <strong className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-clay">
                  {item.label}
                </strong>
                {item.href ? (
                  <a
                    href={item.href}
                    className="break-all text-white underline underline-offset-4 sm:text-right"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="sm:text-right">{item.value}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-clay">
            Currently booking March–September 2026. Travel available.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid min-w-0 flex-1 gap-4 rounded-[0.625rem] bg-white p-5 text-ink sm:p-7 md:flex-[1.4]"
        >
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
            className="inline-flex items-center justify-center rounded-full bg-pine px-6 py-3 font-semibold text-white transition-colors hover:bg-pine-dark"
          >
            Send Inquiry
          </button>
          <p
            role="status"
            aria-live="polite"
            className={`min-h-[1.5em] text-[0.95rem] ${
              status.type === "success"
                ? "font-semibold text-success"
                : status.type === "error"
                  ? "font-semibold text-error"
                  : ""
            }`}
          >
            {status.message}
          </p>
        </form>
      </Container>
    </section>
  );
}
