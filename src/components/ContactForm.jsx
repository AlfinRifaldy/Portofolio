import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      // Simpan pesan murni ke database Supabase (Arsip Admin)
      const { error } = await supabase.from("messages").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message || "Gagal mengirim pesan." });
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm";

  return (
    <section id="contact" className="fp-section grain">
      <div className="max-w-4xl mx-auto px-6 w-full relative z-10">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Kontak</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Hubungi Saya</h2>
          <div className="section-line mx-auto mt-4"></div>
          <p className="text-slate-400 mt-4 text-sm max-w-md mx-auto">Ada proyek atau hanya ingin menyapa? Kirim pesan Anda!</p>
        </div>

        <div className="card rounded-2xl p-7 sm:p-10 max-w-2xl mx-auto">
          {status.success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white">Pesan Berhasil Terkirim!</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Terima kasih! Pesan Anda sudah tersimpan di database kami.</p>
              <button onClick={() => setStatus({ loading: false, success: false, error: null })} className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer">Kirim Pesan Lain</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama</label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="Nama Anda" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className={inputCls} placeholder="nama@email.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subjek</label>
                <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange} className={inputCls} placeholder="Subjek pesan" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pesan</label>
                <textarea id="message" name="message" required rows="4" value={formData.message} onChange={handleChange} className={`${inputCls} resize-none`} placeholder="Tulis pesan Anda..." />
              </div>
              {status.error && <p className="text-red-400 text-xs font-semibold">{status.error}</p>}
              <button type="submit" disabled={status.loading} className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[13px] tracking-wide transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20">
                {status.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    Mengirim...
                  </span>
                ) : "Kirim Pesan"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
