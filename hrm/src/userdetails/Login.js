// src/userdetails/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { initCsrf } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

/**
 * Login Component - Optimized Professional & Compact
 * 
 * Final Fixes:
 * - Locked h-screen to prevent any scrolling.
 * - Balanced professional scaling (no oversized elements).
 * - Premium interactive states & persistent "Remember Me".
 */
export default function Login({
  illustrationSrc = process.env.PUBLIC_URL + "/login-clean.jpg",
  status,
  serverErrors = [],
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setUser, login: ctxLogin } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    const payload = {
      email: String(email).trim().toLowerCase(),
      password: String(password).trim(),
      remember,
    };

    try {
      await initCsrf();
      if (remember) {
        localStorage.setItem("rememberedEmail", payload.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      if (typeof ctxLogin === "function") {
        await ctxLogin(payload.email, payload.password, payload.remember);
        navigate("/dashboard", { replace: true });
        return;
      }

      const res = await api.post("/auth/login", payload);
      const u = res?.data?.user;
      if (!u) throw new Error("Login failure.");
      setUser(u);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors([err?.response?.data?.message || err?.message || "Request failed."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-white font-['Outfit',sans-serif] selection:bg-red-50 text-slate-800 overflow-hidden">

      <style>{`
        .glass-bg {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .animate-in-fade {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Left: Professional Compact Form */}
      <div className="w-full md:w-[45%] h-full flex items-center justify-center p-8 lg:p-12 xl:p-16 glass-bg border-r border-slate-100">
        <div className="w-full max-w-md animate-in-fade">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Welcome back<span className="text-[#ef4444]">.</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              Sign in to your enterprise HRM workspace.
            </p>
          </div>

          {status && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {status}
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-medium rounded-xl border border-rose-100">
              <ul className="space-y-1">
                {errors.map((msg, i) => <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  {msg}
                </li>)}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Official Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-[#ef4444] outline-none transition-all duration-200 text-sm font-semibold placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" title="Enter password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-[#ef4444] outline-none transition-all duration-200 text-sm font-semibold placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#ef4444] transition-colors p-1"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff strokeWidth={2.5} size={20} />
                  ) : (
                    <Eye strokeWidth={2.5} size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center ml-1">
              <label className="flex items-center cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${remember ? 'bg-[#ef4444] border-[#ef4444]' : 'bg-white border-slate-200 group-hover:border-[#ef4444]/50'}`}>
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                <span className="ml-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Remember Session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ef4444] text-white font-black py-4 rounded-xl hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 transition-all duration-300 shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 text-sm tracking-widest"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>SIGN IN →</span>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              &copy; 2024 HRM Excellence System
            </p>
          </footer>
        </div>
      </div>

      {/* Right: Immersive Branding Pane */}
      <div className="hidden md:flex w-[55%] h-full bg-white flex-col items-center justify-center p-12 lg:p-20 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="w-full max-w-lg space-y-8 text-center relative z-10 animate-in-fade" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Simplifying the Complex.
            </h2>
            <p className="max-w-xs mx-auto text-slate-400 font-medium text-sm">
              Unified workforce management for elite enterprises.
            </p>
          </div>

          <div className="relative inline-block mt-4 group">
            <div className="absolute inset-0 bg-red-100/30 rounded-full blur-[60px] group-hover:bg-red-200/40 transition-all duration-700"></div>
            <img
              src={illustrationSrc}
              alt="HRM Workspace"
              className="relative w-full h-auto max-h-[40vh] object-contain drop-shadow-2xl brightness-[1.02]"
            />
          </div>

          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center group px-4">
              <p className="text-sm font-black text-[#ef4444]">Realtime</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-0.5 group-hover:text-slate-500 transition-colors">Reporting</p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="text-center group px-4">
              <p className="text-sm font-black text-[#ef4444 text-slate-800]">Secure</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-0.5 group-hover:text-slate-500 transition-colors">Database</p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="text-center group px-4">
              <p className="text-sm font-black text-[#ef4444]">Global</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-0.5 group-hover:text-slate-500 transition-colors">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
