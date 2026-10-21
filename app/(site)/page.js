import Hero from "@/components/Hero.jsx";
import Portfolio from "@/components/Portfolio.jsx";
import About from "@/components/About.jsx";
import Contact from "@/components/Contact.jsx";
import { auth } from "@/auth";
import { getAllWorks } from "@/lib/works.js";
import { getAllCategories } from "@/lib/categories.js";
import { getFavoriteSlugs } from "@/lib/favorites.js";
import { getRatingsBySlug } from "@/lib/ratings.js";
import { getSiteSettings } from "@/lib/settings.js";

// Render on every request so the page always shows live database data
// (and `next build` never needs a database connection to succeed).
export const dynamic = "force-dynamic";

export default async function Home() {
  // auth() reads the HTTP-only session cookie on the server.
  const session = await auth();

  const [works, initialFavorites, initialRatings, settings, categories] =
    await Promise.all([
      getAllWorks(),
      session?.user ? getFavoriteSlugs(session.user.id) : [],
      session?.user ? getRatingsBySlug(session.user.id) : {},
      getSiteSettings(), // cached — same query the layout already ran
      getAllCategories(), // filter tabs — managed in the dashboard
    ]);

  return (
    <>
      <Hero content={settings.hero} />
      <Portfolio
        works={works}
        categories={categories}
        initialFavorites={initialFavorites}
        initialRatings={initialRatings}
        signedIn={Boolean(session?.user)}
      />
      <About content={settings.about} />
      <Contact content={settings.contact} />
    </>
  );
}
