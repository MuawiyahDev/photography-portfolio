// Login page. Signed-in visitors never see the form — admins land on
// the dashboard, members back on the public site.
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm.jsx";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return <LoginForm />;
}
