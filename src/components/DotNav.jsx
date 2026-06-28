import { useState, useEffect } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "Tentang" },
  { id: "skills", label: "Keahlian" },
  { id: "timeline", label: "Riwayat" },
  { id: "projects", label: "Proyek" },
  { id: "certificates", label: "Sertifikat" },
  { id: "contact", label: "Kontak" },
];

export default function DotNav() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="dot-nav">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          data-label={s.label}
          className={active === s.id ? "active" : ""}
        />
      ))}
    </nav>
  );
}
