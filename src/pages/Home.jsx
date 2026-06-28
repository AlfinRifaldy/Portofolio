import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import DotNav from "@/components/DotNav";
import ProjectsSection from "@/components/ProjectsSection";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [bioRes, eduRes, expRes, skillRes, projRes, certRes] = await Promise.all([
        supabase.from("bio").select("*").limit(1).single(),
        supabase.from("educations").select("*").order("sort_order", { ascending: true }),
        supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
        supabase.from("skills").select("*").order("sort_order", { ascending: true }),
        supabase.from("projects").select("*").order("sort_order", { ascending: true }),
        supabase.from("certificates").select("*").order("sort_order", { ascending: true }),
      ]);

      const bio = bioRes.data || {};
      if (bio.cv_url !== undefined) {
        bio.cvUrl = bio.cv_url;
      }

      setPortfolio({
        bio,
        educations: eduRes.data || [],
        experiences: expRes.data || [],
        skills: skillRes.data || [],
        projects: projRes.data || [],
        certificates: certRes.data || [],
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <svg className="animate-spin h-10 w-10 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-sm font-medium">Memuat portofolio...</p>
        </div>
      </div>
    );
  }

  const { bio, educations, experiences, skills, projects, certificates } = portfolio;

  return (
    <>
      <Navbar name={bio.name} />
      <DotNav />

      <main>

        {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
        <section id="home" className="fp-section grain">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left: Text */}
            <div className="space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-semibold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Tersedia untuk Pekerjaan
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
                {bio.name?.split(" ").slice(0, 2).join(" ")}
                <br />
                <span className="text-amber-500">{bio.name?.split(" ").slice(2).join(" ")}</span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-md leading-relaxed mx-auto lg:mx-0">
                {bio.role}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href="#contact" className="px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm tracking-wide transition-colors shadow-lg shadow-amber-500/20">
                  Hubungi Saya
                </a>
                <a href="/cv" target="_blank" rel="noreferrer" className="px-7 py-3.5 rounded-full border border-slate-700 hover:border-amber-500/30 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2 hover:bg-white/5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Unduh CV
                </a>
              </div>

              {/* Socials */}
              <div className="flex items-center justify-center lg:justify-start gap-5 pt-2">
                {bio.socials?.github && <a href={bio.socials.github} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-amber-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg></a>}
                {bio.socials?.linkedin && <a href={bio.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-amber-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>}
                {bio.socials?.instagram && <a href={bio.socials.instagram} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-amber-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
                {bio.socials?.email && <a href={`mailto:${bio.socials.email}`} className="text-slate-600 hover:text-amber-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a>}
              </div>
            </div>

            {/* Right: Avatar */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl border border-slate-800 bg-slate-900/40 p-3 group-hover:border-amber-500/30 transition-all duration-500">
                  <img src={bio.avatar} alt={bio.name} className="w-full h-full object-cover rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 z-10">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          </div>
        </section>


        {/* ═══════════════ SECTION 2: ABOUT ═══════════════ */}
        <section id="about" className="fp-section grain">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="grid grid-cols-2 gap-5">
              {[
                { num: "2+", label: "Tahun Pengalaman", desc: "Web Development" },
                { num: "10+", label: "Proyek Dirilis", desc: "End-to-End" },
                { num: "5+", label: "Sertifikat", desc: "Kompetensi Profesional" },
                { num: "100%", label: "Dedikasi", desc: "Pada Setiap Proyek" },
              ].map((s, i) => (
                <div key={i} className="card p-6 text-center group">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 block">{s.num}</span>
                  <span className="text-sm font-semibold text-slate-300 block mt-2">{s.label}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 block">{s.desc}</span>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Tentang Saya</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 leading-tight">
                  Merancang Produk Digital <br />Dengan <span className="text-amber-500">Standar Tinggi</span>
                </h2>
              </div>
              <p className="text-slate-400 text-[15px] leading-relaxed">{bio.about}</p>
              <p className="text-slate-400 text-[15px] leading-relaxed">
                Saya menggabungkan keterampilan backend engineering dengan kepekaan desain frontend untuk membangun produk yang tidak hanya fungsional, tetapi juga memberikan pengalaman pengguna yang luar biasa.
              </p>
              <div className="flex items-center gap-5 pt-2">
                <span className="text-slate-600 text-xs font-semibold">Connect →</span>
                {bio.socials?.github && <a href={bio.socials.github} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-amber-500 transition-colors text-xs font-mono">GitHub</a>}
                {bio.socials?.linkedin && <a href={bio.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-amber-500 transition-colors text-xs font-mono">LinkedIn</a>}
              </div>
            </div>
          </div>
        </section>


        {/* ═══════════════ SECTION 3: SKILLS ═══════════════ */}
        <section id="skills" className="fp-section grain">
          <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <div className="text-center mb-14">
              <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Keahlian Utama</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Teknologi & Penguasaan</h2>
              <div className="section-line mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {skills.map((skill) => (
                <div key={skill.id} className="card p-5 space-y-3 hover:border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-200">{skill.name}</span>
                    <span className="text-xs font-mono font-bold text-amber-500">{skill.level}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${skill.level}%` }}></div>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-600">{skill.category}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ═══════════════ SECTION 4: TIMELINE ═══════════════ */}
        <section id="timeline" className="fp-section grain">
          <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <div className="text-center mb-14">
              <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Riwayat</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Pengalaman & Pendidikan</h2>
              <div className="section-line mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-8 pb-3 border-b border-slate-800 uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Pengalaman Kerja
                </h3>
                <div className="border-l-2 border-slate-800 pl-6 space-y-10">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="tl-dot">
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">{exp.period}</span>
                      <h4 className="text-[15px] font-bold text-white mt-3">{exp.role}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">{exp.company}</p>
                      <p className="text-slate-400 text-sm mt-3 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-8 pb-3 border-b border-slate-800 uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  Pendidikan
                </h3>
                <div className="border-l-2 border-slate-800 pl-6 space-y-10">
                  {educations.map((edu) => (
                    <div key={edu.id} className="tl-dot">
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">{edu.period}</span>
                      <h4 className="text-[15px] font-bold text-white mt-3">{edu.degree}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">{edu.institution}</p>
                      <p className="text-slate-400 text-sm mt-3 leading-relaxed">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 5: PROJECTS ═══════════════ */}
        <ProjectsSection projects={projects} />

        {/* ═══════════════ SECTION 6: CERTIFICATES ═══════════════ */}
        <section id="certificates" className="fp-section grain">
          <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <div className="text-center mb-14">
              <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Kredensial</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Sertifikasi Profesional</h2>
              <div className="section-line mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {certificates.map((cert) => (
                <div key={cert.id} className="card rounded-xl overflow-hidden flex flex-col sm:flex-row group">
                  <div className="w-full sm:w-2/5 h-44 sm:h-auto overflow-hidden bg-slate-950">
                    <img src={cert.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=870"} alt={cert.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{cert.issuer}</span>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-500 mt-2 transition-colors">{cert.title}</h3>
                    </div>
                    <span className="text-slate-500 text-xs font-medium mt-4">Diterbitkan: {cert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 7: CONTACT ═══════════════ */}
        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} {bio.name}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
