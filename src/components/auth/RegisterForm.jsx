"use client";

// Registration form. POSTs to /api/auth/register (which hashes the
// password with bcrypt and stores the user in PostgreSQL). On success
// it automatically signs the user in with the same credentials, so
// they land on the site already signed in.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import PasswordInput from "@/components/ui/PasswordInput.jsx";

const inputClass =
  "w-full rounded-xl border bg-cream/50 px-4 py-3 text-ink shadow-[inset_0_1px_2px_rgba(32,28,23,0.05)] outline-none transition placeholder:text-ink/35 focus:bg-white focus:ring-2 dark:bg-white/5 dark:text-cream dark:shadow-none dark:placeholder:text-white/30 dark:focus:bg-white/10 border-sand hover:border-ink/30 focus:border-pine focus:ring-pine/25 dark:border-white/10 dark:hover:border-white/25 dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20";

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => (null));
      setLoading(false);
      setError(data?.error ?? "Registration failed. Please try again.");
      return;
    }

    // Account created — sign in automatically with the same credentials.
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="mx-auto max-w-md">
          <Eyebrow>Join the studio</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Create an account
          </h1>
          <p className="mt-3 text-muted dark:text-white/60">
            Sign up to book shoots and manage your inquiries.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 grid gap-5 rounded-2xl bg-white p-5 text-ink shadow-2xl ring-1 ring-black/10 dark:bg-[#211c16] dark:text-cream dark:ring-white/10 sm:p-7"
          >
            <div className="grid gap-1.5">
              <label htmlFor="reg-name" className="text-sm font-semibold">
                Name{" "}
                <span aria-hidden="true" className="font-normal text-error">
                  *
                </span>
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Appleseed"
                value={values.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold">
                Email{" "}
                <span aria-hidden="true" className="font-normal text-error">
                  *
                </span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jane@example.com"
                value={values.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold">
                Password{" "}
                <span aria-hidden="true" className="font-normal text-error">
                  *
                </span>
              </label>
              <PasswordInput
                id="reg-password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={values.password}
                onChange={handleChange}
                className={inputClass}
              />
              <span className="text-xs font-medium text-ink/45 dark:text-white/45">
                Minimum 8 characters.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-white shadow-lg shadow-pine/25 transition-all hover:bg-pine-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>

            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-error ring-1 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-300/20"
              >
                {error}
              </p>
            ) : null}

            <p className="text-center text-sm text-muted dark:text-white/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-pine underline underline-offset-4 dark:text-emerald-300"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
