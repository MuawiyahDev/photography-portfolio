import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Portfolio from "./components/Portfolio.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-cream font-sans text-ink antialiased transition-colors duration-200 dark:bg-[#161310] dark:text-cream">
      <Header />
      <main id="main" className="w-full max-w-full overflow-x-clip">
        <Hero />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
