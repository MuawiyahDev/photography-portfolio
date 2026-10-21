// Edit the public About section.
import { getSetting } from "@/lib/settings.js";
import PageHeader from "@/components/admin/PageHeader.jsx";
import AboutForm from "@/components/admin/AboutForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await getSetting("about");

  return (
    <div>
      <PageHeader
        title="About"
        description="Your bio, call-to-action button, and profile image."
      />
      <AboutForm content={about} />
    </div>
  );
}
