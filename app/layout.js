import "./globals.css";
import Providers from "@/components/Providers.jsx";

export const metadata = {
  title: "Bilal Ahmed — Photographer & Visual Artist",
  description:
    "Bilal Ahmed — photographer and visual artist. Portraits, editorial, architecture, street, nature and fine art. View the portfolio and book a shoot.",
  icons: { icon: "/favicon.svg" },
};

// Root layout: document shell only. Page chrome (site header/footer or
// the dashboard shell) comes from the route group layouts below.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
