import { useState, useEffect } from "react";

export default function Navbar({ name }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { name: "Home", href: "#home" },
    { name: "Tentang", href: "#about" },
    { name: "Skill", href: "#skills" },
    { name: "Riwayat", href: "#timeline" },
    { name: "Proyek", href: "#projects" },
    { name: "Sertifikat", href: "#certificates" },
    { name: "Kontak", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "nav-blur py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className={`text-sm font-bold tracking-wider transition-all ${scrolled ? "text-white" : "text-white/70 hover:text-white"}`}>
          {name}<span className="text-amber-500">.</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              {l.name}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
          {!isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden nav-blur absolute top-full left-0 w-full">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                {l.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
