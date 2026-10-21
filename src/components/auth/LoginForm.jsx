"use client";

// Login form. On submit it asks Auth.js to verify the credentials
// against the database (via POST /api/auth/callback/credentials).
// `redirect: false` lets us show errors inline instead of bouncing
// to the default error page. On success we navigate home and refresh
// so the server-rendered header picks up the new session.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import PasswordInput from "@/components/ui/PasswordInput.jsx";

const inputClass =
  "w-full rounded-xl border bg-cream/50 px-4 py-3 text-ink shadow-[inset_0_1px_2px_rgba(32,28,23,0.05)] outline-none transition placeholder:text-ink/35 focus:bg-white focus:ring-2 dark:bg-white/5 dark:text-cream dark:shadow-none dark:placeholder:text-white/30 dark:focus:bg-white/10 border-sand hover:border-ink/30 focus:border-pine focus:ring-pine/25 dark:border-white/10 dark:hover:border-white/25 dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20";

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
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

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Same message whether the email exists or the password was
      // wrong — don't reveal which one failed.
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="mx-auto max-w-md">
          <Eyebrow>Welcome back</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Sign in
          </h1>
          <p className="mt-3 text-muted dark:text-white/60">
            Sign in to your account to manage your bookings.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 grid gap-5 rounded-2xl bg-white p-5 text-ink shadow-2xl ring-1 ring-black/10 dark:bg-[#211c16] dark:text-cream dark:ring-white/10 sm:p-7"
          >
            <div className="grid gap-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold">
                Email{" "}
                <span aria-hidden="true" className="font-normal text-error">
                  *
                </span>
              </label>
              <input
                id="login-email"
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
              <label
                htmlFor="login-password"
                className="text-sm font-semibold"
              >
                Password{" "}
                <span aria-hidden="true" className="font-normal text-error">
                  *
                </span>
              </label>
              <PasswordInput
                id="login-password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Your password"
                value={values.password}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-white shadow-lg shadow-pine/25 transition-all hover:bg-pine-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
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
              No account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-pine underline underline-offset-4 dark:text-emerald-300"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
