// Edit the homepage hero section.
import { getSetting } from "@/lib/settings.js";
import PageHeader from "@/components/admin/PageHeader.jsx";
import HeroForm from "@/components/admin/HeroForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getSetting("hero");

  return (
    <div>
      <PageHeader
        title="Hero"
        description="The first thing every visitor sees: heading, buttons, stats, press list, and the main image."
      />
      <HeroForm content={hero} />
    </div>
  );
}
