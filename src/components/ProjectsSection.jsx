import { useState } from "react";

export default function ProjectsSection({ projects }) {
  const allTags = ["Semua", ...new Set(projects.flatMap((p) => p.tags || []))];
  const [selectedTag, setSelectedTag] = useState("Semua");
  const filtered = selectedTag === "Semua" ? projects : projects.filter((p) => p.tags?.includes(selectedTag));

  return (
    <section id="projects" className="fp-section grain">
      <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Portofolio</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Proyek Pilihan</h2>
          <div className="section-line mx-auto mt-4"></div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase border transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-amber-500 text-slate-950 border-transparent font-bold shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-amber-500/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {filtered.map((project) => (
            <div key={project.id} className="card overflow-hidden group">
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={project.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=870"}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{project.title}</h3>
                <p className="text-slate-400 mt-1.5 text-xs leading-relaxed line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags?.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800/50">
                  {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>Repo</a>}
                  {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors ml-auto flex items-center gap-1.5">Demo<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
