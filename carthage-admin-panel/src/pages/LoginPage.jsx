import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiService } from "../api";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "../config/appConfig";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("admin@carthagetravel.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiService.login({ email, password });
      login({ token: data.token, user: data.user });
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/10 blur-[130px] pointer-events-none" />

      {/* Main glassmorphic wrapper */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl transition-all hover:border-white/15">
        
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#CC1422] to-amber-500 shadow-xl shadow-[#CC1422]/20 animate-pulse">
            <span className="text-2xl font-black text-white">CT</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Carthage Travel</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Administration Panel</p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Email</label>
            <div className="relative">
              <input
                className="w-full bg-white/5 border border-white/10 focus:border-[#CC1422] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-4 focus:ring-[#CC1422]/10 transition-all font-medium placeholder-slate-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@carthagetravel.com"
                required
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                className="w-full bg-white/5 border border-white/10 focus:border-[#CC1422] rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-4 focus:ring-[#CC1422]/10 transition-all font-medium placeholder-slate-500"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="w-full py-3.5 bg-gradient-to-r from-[#CC1422] to-red-600 hover:from-red-700 hover:to-red-650 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default LoginPage;
