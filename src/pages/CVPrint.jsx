import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CVPrint() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCVData() {
      const [bioRes, eduRes, expRes, skillRes, certRes] = await Promise.all([
        supabase.from("bio").select("*").limit(1).single(),
        supabase.from("educations").select("*").order("sort_order", { ascending: true }),
        supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
        supabase.from("skills").select("*").order("sort_order", { ascending: true }),
        supabase.from("certificates").select("*").order("sort_order", { ascending: true }),
      ]);

      const bio = bioRes.data || {};
      if (bio.cv_url !== undefined) {
        bio.cvUrl = bio.cv_url;
      }

      setData({
        bio,
        educations: eduRes.data || [],
        experiences: expRes.data || [],
        skills: skillRes.data || [],
        certificates: certRes.data || [],
      });
      setLoading(false);
    }
    fetchCVData();
  }, []);

  // Otomatis trigger print setelah data termuat (opsional)
  useEffect(() => {
    if (!loading && data) {
      // Beri jeda sedikit agar render HTML selesai sebelum print dialog muncul
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <svg className="animate-spin h-8 w-8 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium">Menyusun CV Dinamis Anda...</p>
        </div>
      </div>
    );
  }

  const { bio, educations, experiences, skills, certificates } = data;

  return (
    <div className="min-h-screen bg-neutral-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
      
      {/* Tombol Aksi di atas halaman (Akan disembunyikan saat di-print ke PDF) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <a href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5">
          ← Kembali ke Website
        </a>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Kertas A4 Resume */}
      <div className="max-w-4xl mx-auto bg-white text-slate-800 p-12 shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 min-h-[297mm]">
        
        {/* HEADER: Nama & Kontak */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">{bio.name}</h1>
          <p className="text-amber-600 font-bold text-sm tracking-wide mt-1 uppercase">{bio.role}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-[11px] text-slate-500">
            {bio.socials?.email && (
              <span className="flex items-center gap-1.5">
                📧 {bio.socials.email}
              </span>
            )}
            {bio.socials?.linkedin && (
              <a href={bio.socials.linkedin} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5">
                🔗 LinkedIn
              </a>
            )}
            {bio.socials?.github && (
              <a href={bio.socials.github} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5">
                💻 GitHub
              </a>
            )}
            {bio.socials?.instagram && (
              <span className="flex items-center gap-1.5">
                📸 @{bio.socials.instagram.split("/").pop()}
              </span>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-6">
          
          {/* Tentang Saya */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Profil Ringkas</h2>
            <p className="text-xs leading-relaxed text-slate-600">{bio.about}</p>
          </div>

          {/* Pengalaman Kerja */}
          {experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Pengalaman Kerja</h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{exp.role} — <span className="text-slate-500 font-normal">{exp.company}</span></span>
                      <span className="text-slate-500 font-mono text-[10px]">{exp.period}</span>
                    </div>
                    <p className="text-slate-650 mt-1 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendidikan */}
          {educations.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Pendidikan</h2>
              <div className="space-y-3">
                {educations.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{edu.degree} — <span className="text-slate-500 font-normal">{edu.institution}</span></span>
                      <span className="text-slate-500 font-mono text-[10px]">{edu.period}</span>
                    </div>
                    <p className="text-slate-650 mt-1 leading-relaxed">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid: Keahlian & Sertifikat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Keahlian */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Keahlian</h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill.id} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {skill.name} ({skill.level}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sertifikat */}
            {certificates.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Sertifikasi Terbaru</h2>
                <ul className="space-y-2">
                  {certificates.map((cert) => (
                    <li key={cert.id} className="text-xs flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-slate-800">{cert.title}</span>
                        <span className="text-slate-500 block text-[10px]">{cert.issuer}</span>
                      </div>
                      <span className="text-slate-550 text-[10px] font-mono whitespace-nowrap">{cert.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
