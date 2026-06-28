import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau Password salah!");
        setLoading(false);
        return;
      }

      if (data.session) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] grain flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow Backdrops - Amber Gold Theme */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-amber-500 transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Portofolio
          </Link>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white">
            Portal <span className="text-amber-500">Admin</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk mengelola data website portofolio Anda.
          </p>
        </div>

        <div className="card rounded-2xl p-8 shadow-xl bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                placeholder="admin@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm tracking-wide transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Login menggunakan akun Supabase Auth yang sudah didaftarkan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
