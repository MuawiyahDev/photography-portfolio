import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { getSiteSettings } from "@/lib/settings.js";

// Public (landing) pages share the site header + footer.
// The dashboard lives in /admin with its own shell instead.
export default async function SiteLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-cream font-sans text-ink antialiased transition-colors duration-200 dark:bg-[#161310] dark:text-cream">
      <Header />
      <main id="main" className="w-full max-w-full overflow-x-clip">
        {children}
      </main>
      <Footer contact={settings.contact} />
    </div>
  );
}
