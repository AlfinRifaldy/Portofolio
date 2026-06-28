import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bio");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [session, setSession] = useState(null);

  const [portfolio, setPortfolio] = useState({
    bio: { name: "", role: "", about: "", avatar: "", cvUrl: "", about_title: "", about_subtitle: "", stats: [], socials: { github: "", linkedin: "", instagram: "", email: "" } },
    educations: [],
    experiences: [],
    skills: [],
    projects: [],
    certificates: [],
    messages: []
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        navigate("/admin/login");
      } else {
        setSession(currentSession);
        fetchPortfolioData();
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_OUT" || !newSession) {
        navigate("/admin/login");
      } else {
        setSession(newSession);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [bioRes, eduRes, expRes, skillRes, projRes, certRes, msgRes] = await Promise.all([
        supabase.from("bio").select("*").limit(1).single(),
        supabase.from("educations").select("*").order("sort_order", { ascending: true }),
        supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
        supabase.from("skills").select("*").order("sort_order", { ascending: true }),
        supabase.from("projects").select("*").order("sort_order", { ascending: true }),
        supabase.from("certificates").select("*").order("sort_order", { ascending: true }),
        supabase.from("messages").select("*").order("created_at", { ascending: false }),
      ]);

      const bio = bioRes.data || {};
      if (bio.cv_url !== undefined) {
        bio.cvUrl = bio.cv_url;
      }

      // Default fallback stats if empty or not defined
      if (!bio.stats || bio.stats.length === 0) {
        bio.stats = [
          { num: "2+", label: "Tahun Pengalaman", desc: "Web Development" },
          { num: "10+", label: "Proyek Dirilis", desc: "End-to-End" },
          { num: "5+", label: "Sertifikat", desc: "Kompetensi Profesional" },
          { num: "100%", label: "Dedikasi", desc: "Pada Setiap Proyek" }
        ];
      }

      if (!bio.about_title) {
        bio.about_title = "Merancang Produk Digital <br />Dengan <span class=\"text-amber-500\">Standar Tinggi</span>";
      }

      if (!bio.about_subtitle) {
        bio.about_subtitle = "Saya menggabungkan keterampilan backend engineering dengan kepekaan desain frontend untuk membangun produk yang tidak hanya fungsional, tetapi juga memberikan pengalaman pengguna yang luar biasa.";
      }

      // Auto-koreksi jika data sosial masih berisi nilai placeholder/dummy
      const correctSocials = {
        github: "https://github.com/AlfinRifaldy",
        linkedin: "https://www.linkedin.com/in/alfin-rifaldy",
        instagram: "https://www.instagram.com/alfinrifldy?igsh=MWpoejJ2amUxYzF2cA==",
        email: "alfinrifaldy6@gmail.com"
      };

      const currentSocials = bio.socials || {};
      const isDummyLinkedin = !currentSocials.linkedin || currentSocials.linkedin.includes("linkedin.com/in/alfinrifaldy") && !currentSocials.linkedin.includes("alfin-rifaldy");
      const isDummyGithub = !currentSocials.github || currentSocials.github === "https://github.com/alfinrifaldy";
      const isDummyInstagram = !currentSocials.instagram || currentSocials.instagram === "https://instagram.com/alfinrifaldy";

      if (isDummyLinkedin || isDummyGithub || isDummyInstagram) {
        bio.socials = {
          ...currentSocials,
          github: isDummyGithub ? correctSocials.github : currentSocials.github,
          linkedin: isDummyLinkedin ? correctSocials.linkedin : currentSocials.linkedin,
          instagram: isDummyInstagram ? correctSocials.instagram : currentSocials.instagram,
          email: currentSocials.email || correctSocials.email,
        };
        bio.cvUrl = bio.cvUrl || '/cv';

        // Langsung simpan koreksi ke database
        const { data: bioRow } = await supabase.from("bio").select("id").limit(1).single();
        if (bioRow) {
          await supabase.from("bio").update({
            socials: bio.socials,
            cv_url: bio.cvUrl,
          }).eq("id", bioRow.id);
          console.log("✅ Data sosial media berhasil diperbaiki otomatis!");
        }
      }

      setPortfolio({
        bio,
        educations: eduRes.data || [],
        experiences: expRes.data || [],
        skills: skillRes.data || [],
        projects: projRes.data || [],
        certificates: certRes.data || [],
        messages: msgRes.data || [],
      });
    } catch (err) {
      setErrorMsg("Gagal memuat data portofolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Uploader Handler
  const handleFileUpload = async (e, folder, targetField, isBio = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaveLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file ke public bucket 'portfolio' di Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Ambil link publik file yang sudah diupload
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      if (isBio) {
        // Update state React
        setPortfolio(prev => ({
          ...prev,
          bio: { ...prev.bio, [targetField]: publicUrl }
        }));

        // Langsung PATCH ke database Supabase tanpa menunggu state React
        const { data: bioRow } = await supabase.from("bio").select("id").limit(1).single();
        if (bioRow) {
          const patchField = targetField === "cvUrl" ? "cv_url" : targetField;
          await supabase.from("bio").update({ [patchField]: publicUrl }).eq("id", bioRow.id);
        }

        setSuccessMsg("Gambar berhasil diupload & disimpan ke database!");
      } else {
        setFormData(prev => ({
          ...prev,
          [targetField]: publicUrl
        }));
        setSuccessMsg("Gambar berhasil di-upload! Klik Simpan untuk menyimpan data.");
      }
      
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(`Gagal upload: ${err.message}. Pastikan Anda sudah membuat Storage Bucket bernama 'portfolio' di dashboard Supabase Anda.`);
    } finally {
      setSaveLoading(false);
    }
  };

  const savePortfolioData = async (updatedData) => {
    setSaveLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const data = updatedData || portfolio;

      const bioPayload = {
        name: data.bio.name,
        role: data.bio.role,
        about: data.bio.about,
        avatar: data.bio.avatar,
        cv_url: data.bio.cvUrl || "",
        socials: data.bio.socials || {},
        about_title: data.bio.about_title || "",
        about_subtitle: data.bio.about_subtitle || "",
        stats: data.bio.stats || [],
        updated_at: new Date().toISOString(),
      };

      const { data: existingBio } = await supabase.from("bio").select("id").limit(1).single();
      if (existingBio) {
        const { error: updateError } = await supabase.from("bio").update(bioPayload).eq("id", existingBio.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("bio").insert(bioPayload);
        if (insertError) throw insertError;
      }

      const listTables = [
        { table: "educations", data: data.educations || [] },
        { table: "experiences", data: data.experiences || [] },
        { table: "skills", data: data.skills || [] },
        { table: "projects", data: data.projects || [] },
        { table: "certificates", data: data.certificates || [] },
      ];

      for (const { table, data: items } of listTables) {
        await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");

        if (items.length > 0) {
          const rows = items.map((item, index) => {
            const row = { ...item, sort_order: index };
            if (!row.id || typeof row.id !== "string" || !row.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
              delete row.id;
            }
            if (table === "projects" && row.tags && typeof row.tags === "string") {
              row.tags = row.tags.split(",").map(t => t.trim()).filter(Boolean);
            }
            if (row.cvUrl !== undefined) { row.cv_url = row.cvUrl; delete row.cvUrl; }
            delete row.created_at;
            delete row.updated_at;
            return row;
          });

          const { error: insertError } = await supabase.from(table).insert(rows);
          if (insertError) throw insertError;
        }
      }

      setSuccessMsg("Perubahan berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchPortfolioData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatChange = (index, field, value) => {
    setPortfolio((prev) => {
      const newStats = [...(prev.bio.stats || [])];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, bio: { ...prev.bio, stats: newStats } };
    });
  };

  const predefinedSkills = {
    Frontend: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Tailwind CSS", "Bootstrap", "Astro", "SASS/SCSS"],
    Backend: ["Node.js", "Express.js", "NestJS", "PHP", "Laravel", "Python", "Django", "FastAPI", "Go (Golang)"],
    Design: ["Figma", "UI/UX Design", "Adobe Photoshop", "Adobe Illustrator", "Wireframing", "Prototyping"],
    Tools: ["Git", "GitHub", "Docker", "Supabase", "Firebase", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Vercel"]
  };

  const handleToggleSkill = (name, category) => {
    setPortfolio((prev) => {
      const isSelected = (prev.skills || []).some((s) => s.name.toLowerCase() === name.toLowerCase());
      let newSkills;
      if (isSelected) {
        newSkills = (prev.skills || []).filter((s) => s.name.toLowerCase() !== name.toLowerCase());
      } else {
        newSkills = [...(prev.skills || []), { id: "sk_" + Date.now() + Math.random().toString(36).substring(2, 7), name, category, level: 100 }];
      }
      return { ...prev, skills: newSkills };
    });
  };

  const handleMarkMessageRead = async (messageId) => {
    setSaveLoading(true);
    try {
      const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
      if (error) throw error;
      setSuccessMsg("Pesan ditandai sebagai dibaca!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchPortfolioData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menandai pesan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
    setSaveLoading(true);
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw error;
      setSuccessMsg("Pesan berhasil dihapus!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchPortfolioData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menghapus pesan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBioChange = (e, field, subfield = null) => {
    const value = e.target.value;
    setPortfolio((prev) => {
      if (subfield) {
        return { ...prev, bio: { ...prev.bio, socials: { ...prev.bio.socials, [subfield]: value } } };
      }
      return { ...prev, bio: { ...prev.bio, [field]: value } };
    });
  };

  const openModal = (mode, tab, item = null) => {
    setModalMode(mode);
    setEditId(item ? item.id : null);
    if (mode === "edit" && item) {
      setFormData(item);
    } else {
      const blanks = {
        education: { institution: "", degree: "", period: "", description: "" },
        experience: { company: "", role: "", period: "", description: "" },
        skills: { name: "", level: 80, category: "Frontend" },
        projects: { title: "", description: "", image: "", tags: "", github: "", demo: "" },
        certificates: { title: "", issuer: "", date: "", image: "" }
      };
      setFormData(blanks[tab] || {});
    }
    setModalOpen(true);
  };

  const handleFormChange = (e, field) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const tabKeyMap = { education: "educations", experience: "experiences", skills: "skills", projects: "projects", certificates: "certificates" };
    const key = tabKeyMap[activeTab];
    if (!key) return;

    let updatedList = [...portfolio[key]];
    if (modalMode === "add") {
      const newItem = { ...formData, id: activeTab.slice(0, 3) + Date.now() };
      if (activeTab === "projects" && typeof newItem.tags === "string") {
        newItem.tags = newItem.tags.split(",").map(t => t.trim()).filter(Boolean);
      }
      updatedList.push(newItem);
    } else {
      updatedList = updatedList.map((item) => {
        if (item.id === editId) {
          const updatedItem = { ...item, ...formData };
          if (activeTab === "projects" && typeof updatedItem.tags === "string") {
            updatedItem.tags = updatedItem.tags.split(",").map(t => t.trim()).filter(Boolean);
          }
          return updatedItem;
        }
        return item;
      });
    }

    const updatedPortfolio = { ...portfolio, [key]: updatedList };
    setPortfolio(updatedPortfolio);
    setModalOpen(false);
    savePortfolioData(updatedPortfolio);
  };

  const handleDeleteItem = (id, tab) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    const tabKeyMap = { education: "educations", experience: "experiences", skills: "skills", projects: "projects", certificates: "certificates" };
    const key = tabKeyMap[tab];
    if (!key) return;
    const updatedList = portfolio[key].filter((item) => item.id !== id);
    const updatedPortfolio = { ...portfolio, [key]: updatedList };
    setPortfolio(updatedPortfolio);
    savePortfolioData(updatedPortfolio);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <svg className="animate-spin h-10 w-10 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-sm font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm";
  const inputClsMono = "w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all text-xs font-mono";

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans flex flex-col grain">
      {/* Top Header */}
      <header className="nav-blur py-4 px-6 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-white">
            Dashboard <span className="text-amber-500">Admin</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-mono font-semibold">
            Supabase
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5">
            Buka Website
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-slate-850 border border-slate-800 text-slate-450 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer">
            Keluar
          </button>
        </div>
      </header>

      {/* Alerts */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {errorMsg}
            </div>
          )}
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row relative z-10">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/40 p-6 space-y-2">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 px-3">Menu Konten</div>
          {[
            { id: "bio", name: "Bio & Tentang", icon: "👤" },
            { id: "education", name: "Pendidikan", icon: "🎓" },
            { id: "experience", name: "Pengalaman Kerja", icon: "💼" },
            { id: "skills", name: "Keahlian", icon: "⚡" },
            { id: "projects", name: "Proyek", icon: "📂" },
            { id: "certificates", name: "Sertifikasi", icon: "📜" },
            { id: "messages", name: "Pesan Masuk", icon: "✉️" }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === tab.id ? "bg-amber-500/10 text-amber-500 border-l-4 border-amber-500 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"}`}>
              <span>{tab.icon}</span>{tab.name}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full">
          {/* BIO TAB */}
          {activeTab === "bio" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Bio & Informasi Utama</h2>
                  <p className="text-xs text-slate-400 mt-1">Mengelola foto profil, deskripsi, sosial media, dan CV Anda.</p>
                </div>
                <button onClick={() => savePortfolioData()} disabled={saveLoading} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer">
                  {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">Detail Personal</h3>
                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Nama Lengkap</label><input type="text" value={portfolio.bio.name} onChange={(e) => handleBioChange(e, "name")} className={inputCls} /></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Role / Pekerjaan</label><input type="text" value={portfolio.bio.role} onChange={(e) => handleBioChange(e, "role")} className={inputCls} /></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Tentang Saya (Paragraf 1)</label><textarea rows="4" value={portfolio.bio.about} onChange={(e) => handleBioChange(e, "about")} className={`${inputCls} resize-none`}></textarea></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Judul Bagian Tentang (HTML diizinkan)</label><input type="text" value={portfolio.bio.about_title || ""} onChange={(e) => handleBioChange(e, "about_title")} className={inputCls} /></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Deskripsi Tentang (Paragraf 2)</label><textarea rows="3" value={portfolio.bio.about_subtitle || ""} onChange={(e) => handleBioChange(e, "about_subtitle")} className={`${inputCls} resize-none`}></textarea></div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">Aset & Sosial Media</h3>
                  
                  {/* UPLOADER FOR AVATAR */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Foto Profil / Avatar</label>
                    <div className="flex gap-4 items-center mb-2">
                      {portfolio.bio.avatar && (
                        <img src={portfolio.bio.avatar} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, "avatars", "avatar", true)}
                        className="block w-full text-xs text-slate-450 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 file:cursor-pointer"
                      />
                    </div>
                    <input type="text" value={portfolio.bio.avatar} onChange={(e) => handleBioChange(e, "avatar")} className={inputClsMono} placeholder="Atau tempel link URL foto..." />
                  </div>

                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">CV Download URL</label><input type="text" value={portfolio.bio.cvUrl} onChange={(e) => handleBioChange(e, "cvUrl")} className={inputClsMono} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">GitHub</label><input type="text" value={portfolio.bio.socials.github} onChange={(e) => handleBioChange(e, "socials", "github")} className={inputClsMono} /></div>
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">LinkedIn</label><input type="text" value={portfolio.bio.socials.linkedin} onChange={(e) => handleBioChange(e, "socials", "linkedin")} className={inputClsMono} /></div>
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Instagram</label><input type="text" value={portfolio.bio.socials.instagram} onChange={(e) => handleBioChange(e, "socials", "instagram")} className={inputClsMono} /></div>
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400">Email</label><input type="email" value={portfolio.bio.socials.email} onChange={(e) => handleBioChange(e, "socials", "email")} className={inputCls} /></div>
                  </div>
                </div>
              </div>

              {/* STATS SECTION */}
              <div className="border-t border-slate-900 pt-8 mt-6">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-4">Statistik Portofolio (4 Kartu)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(portfolio.bio.stats || []).map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Kartu {i + 1}</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Angka (misal: 2+)</label>
                        <input type="text" value={stat.num || ""} onChange={(e) => handleStatChange(i, "num", e.target.value)} className={inputCls} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Label (misal: Tahun Pengalaman)</label>
                        <input type="text" value={stat.label || ""} onChange={(e) => handleStatChange(i, "label", e.target.value)} className={inputCls} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Sub-label (misal: Web Development)</label>
                        <input type="text" value={stat.desc || ""} onChange={(e) => handleStatChange(i, "desc", e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC LISTS */}
          {activeTab !== "bio" && activeTab !== "messages" && activeTab !== "skills" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 capitalize">Kelola {activeTab === "experience" ? "Pengalaman Kerja" : activeTab === "education" ? "Pendidikan" : activeTab === "projects" ? "Proyek" : "Sertifikasi"}</h2>
                  <p className="text-xs text-slate-400 mt-1">Tambahkan, ubah, atau hapus konten yang muncul di halaman utama.</p>
                </div>
                <button onClick={() => openModal("add", activeTab)} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Tambah Baru
                </button>
              </div>

              <div className="card rounded-2xl overflow-hidden bg-slate-900/40">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/40 text-xs font-bold text-slate-400 uppercase border-b border-slate-900">
                    <tr>
                      {(activeTab === "education" || activeTab === "experience") && (<><th className="px-6 py-4">Lembaga / Perusahaan</th><th className="px-6 py-4">Gelar / Peran</th><th className="px-6 py-4">Periode</th></>)}
                      {activeTab === "projects" && (<><th className="px-6 py-4">Judul Proyek</th><th className="px-6 py-4">Tags</th><th className="px-6 py-4">Link Demo</th></>)}
                      {activeTab === "certificates" && (<><th className="px-6 py-4">Nama Sertifikasi</th><th className="px-6 py-4">Penerbit</th><th className="px-6 py-4">Tanggal Terbit</th></>)}
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 bg-transparent">
                    {activeTab === "education" && portfolio.educations.map((edu) => (
                      <tr key={edu.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 font-semibold text-slate-100">{edu.institution}</td>
                        <td className="px-6 py-4">{edu.degree}</td>
                        <td className="px-6 py-4 text-xs font-mono">{edu.period}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal("edit", "education", edu)} className="text-xs text-amber-500 hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteItem(edu.id, "education")} className="text-xs text-rose-400 hover:underline cursor-pointer">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {activeTab === "experience" && portfolio.experiences.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 font-semibold text-slate-100">{exp.company}</td>
                        <td className="px-6 py-4">{exp.role}</td>
                        <td className="px-6 py-4 text-xs font-mono">{exp.period}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal("edit", "experience", exp)} className="text-xs text-amber-500 hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteItem(exp.id, "experience")} className="text-xs text-rose-400 hover:underline cursor-pointer">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {activeTab === "projects" && portfolio.projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 font-semibold text-slate-100">{proj.title}</td>
                        <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{proj.tags && proj.tags.map((t) => (<span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">{t}</span>))}</div></td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-[150px] truncate">{proj.demo || "-"}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal("edit", "projects", proj)} className="text-xs text-amber-500 hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteItem(proj.id, "projects")} className="text-xs text-rose-400 hover:underline cursor-pointer">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {activeTab === "certificates" && portfolio.certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 font-semibold text-slate-100">{cert.title}</td>
                        <td className="px-6 py-4">{cert.issuer}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{cert.date}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal("edit", "certificates", cert)} className="text-xs text-amber-500 hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteItem(cert.id, "certificates")} className="text-xs text-rose-400 hover:underline cursor-pointer">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {((activeTab === "education" && portfolio.educations.length === 0) ||
                  (activeTab === "experience" && portfolio.experiences.length === 0) ||
                  (activeTab === "projects" && portfolio.projects.length === 0) ||
                  (activeTab === "certificates" && portfolio.certificates.length === 0)) && (
                  <div className="text-center py-10 text-slate-500 font-medium">Tidak ada data ditemukan. Klik &quot;Tambah Baru&quot; untuk menambahkan data.</div>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC CLICKABLE SKILLS SELECTION TAB */}
          {activeTab === "skills" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Kelola Keahlian (Skills)</h2>
                  <p className="text-xs text-slate-400 mt-1">Pilih keahlian yang Anda kuasai dengan mengkliknya. Keahlian terpilih akan langsung muncul di halaman utama.</p>
                </div>
                <button onClick={() => savePortfolioData()} disabled={saveLoading} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer">
                  {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

              <div className="space-y-8">
                {Object.entries(predefinedSkills).map(([cat, list]) => (
                  <div key={cat} className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {list.map((name) => {
                        const isSelected = (portfolio.skills || []).some((s) => s.name.toLowerCase() === name.toLowerCase());
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleToggleSkill(name, cat)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border cursor-pointer ${isSelected ? "bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold shadow-md shadow-amber-500/5" : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES INBOX TAB */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Pesan Masuk (Inbox)</h2>
                  <p className="text-xs text-slate-400 mt-1">Membaca pesan yang dikirimkan oleh pengunjung melalui formulir kontak.</p>
                </div>
              </div>

              <div className="space-y-4">
                {portfolio.messages && portfolio.messages.length > 0 ? (
                  portfolio.messages.map((msg) => (
                    <div key={msg.id} className={`card p-6 rounded-2xl border transition-all ${msg.is_read ? "border-slate-800 bg-slate-900/20 opacity-80" : "border-amber-500/20 bg-slate-900/50 shadow-md shadow-amber-500/5"}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-slate-100 text-sm">{msg.name}</span>
                            <span className="text-xs font-mono text-slate-400">&lt;{msg.email}&gt;</span>
                            {!msg.is_read && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                                Baru
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Diterima: {new Date(msg.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!msg.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkMessageRead(msg.id)}
                              disabled={saveLoading}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-550 hover:text-slate-950 border border-amber-500/20 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Tandai Dibaca
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={saveLoading}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-850 hover:bg-red-500/10 text-slate-450 hover:text-red-400 border border-slate-800 hover:border-red-500/20 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-slate-800/60 pt-4">
                        <h4 className="text-[13px] font-semibold text-slate-300">
                          Subjek: <span className="text-slate-200">{msg.subject}</span>
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-14 card rounded-2xl text-slate-500 font-medium">
                    Tidak ada pesan masuk.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CRUD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 capitalize">
                {modalMode === "add" ? "Tambah Baru" : "Edit"} {activeTab === "skills" ? "Keahlian" : activeTab === "experience" ? "Pengalaman Kerja" : activeTab === "education" ? "Pendidikan" : activeTab === "projects" ? "Proyek" : "Sertifikasi"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {activeTab === "education" && (<>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Nama Lembaga</label><input type="text" required value={formData.institution || ""} onChange={(e) => handleFormChange(e, "institution")} className={inputCls} placeholder="Universitas Sumatera Utara" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Gelar / Bidang Studi</label><input type="text" required value={formData.degree || ""} onChange={(e) => handleFormChange(e, "degree")} className={inputCls} placeholder="S1 Teknik Informatika" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Periode</label><input type="text" required value={formData.period || ""} onChange={(e) => handleFormChange(e, "period")} className={inputCls} placeholder="2020 - 2024" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Deskripsi</label><textarea rows="3" value={formData.description || ""} onChange={(e) => handleFormChange(e, "description")} className={`${inputCls} resize-none`}></textarea></div>
              </>)}
              {activeTab === "experience" && (<>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Perusahaan / Organisasi</label><input type="text" required value={formData.company || ""} onChange={(e) => handleFormChange(e, "company")} className={inputCls} placeholder="Tech Solutions Corp" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Peran / Jabatan</label><input type="text" required value={formData.role || ""} onChange={(e) => handleFormChange(e, "role")} className={inputCls} placeholder="Frontend Developer" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Periode</label><input type="text" required value={formData.period || ""} onChange={(e) => handleFormChange(e, "period")} className={inputCls} placeholder="2024 - Sekarang" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Deskripsi</label><textarea rows="3" value={formData.description || ""} onChange={(e) => handleFormChange(e, "description")} className={`${inputCls} resize-none`}></textarea></div>
              </>)}
              {activeTab === "skills" && (<>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Nama Keahlian</label><input type="text" required value={formData.name || ""} onChange={(e) => handleFormChange(e, "name")} className={inputCls} placeholder="React & Next.js" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Persentase (0-100)</label><input type="number" required min="0" max="100" value={formData.level || 80} onChange={(e) => handleFormChange(e, "level")} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Kategori</label><select value={formData.category || "Frontend"} onChange={(e) => handleFormChange(e, "category")} className={inputCls}><option value="Frontend">Frontend</option><option value="Backend">Backend</option><option value="Design">Design</option><option value="Tools">Tools</option></select></div>
              </>)}
              
              {/* UPLOADER FOR PROJECTS */}
              {activeTab === "projects" && (<>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Judul</label><input type="text" required value={formData.title || ""} onChange={(e) => handleFormChange(e, "title")} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Deskripsi</label><textarea rows="2" required value={formData.description || ""} onChange={(e) => handleFormChange(e, "description")} className={`${inputCls} resize-none`}></textarea></div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Gambar Proyek</label>
                  <div className="flex gap-4 items-center mb-2">
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "projects", "image", false)}
                      className="block w-full text-xs text-slate-450 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 file:cursor-pointer"
                    />
                  </div>
                  <input type="text" value={formData.image || ""} onChange={(e) => handleFormChange(e, "image")} className={inputClsMono} placeholder="Atau tempel link URL gambar..." />
                </div>

                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Tags (koma)</label><input type="text" value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags || ""} onChange={(e) => handleFormChange(e, "tags")} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">GitHub</label><input type="text" value={formData.github || ""} onChange={(e) => handleFormChange(e, "github")} className={inputClsMono} /></div>
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Demo</label><input type="text" value={formData.demo || ""} onChange={(e) => handleFormChange(e, "demo")} className={inputClsMono} /></div>
                </div>
              </>)}
              
              {/* UPLOADER FOR CERTIFICATES */}
              {activeTab === "certificates" && (<>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Nama Sertifikasi</label><input type="text" required value={formData.title || ""} onChange={(e) => handleFormChange(e, "title")} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Penerbit</label><input type="text" required value={formData.issuer || ""} onChange={(e) => handleFormChange(e, "issuer")} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-400">Tanggal</label><input type="text" required value={formData.date || ""} onChange={(e) => handleFormChange(e, "date")} className={inputCls} /></div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Gambar Sertifikat</label>
                  <div className="flex gap-4 items-center mb-2">
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "certificates", "image", false)}
                      className="block w-full text-xs text-slate-450 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 file:cursor-pointer"
                    />
                  </div>
                  <input type="text" value={formData.image || ""} onChange={(e) => handleFormChange(e, "image")} className={inputClsMono} placeholder="Atau tempel link URL gambar..." />
                </div>
              </>)}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-750 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase rounded-xl transition-all cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
