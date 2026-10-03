import { useState, useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { User, LogOut, ShieldCheck, Mail, Lock, UserPlus, LogIn } from "lucide-react";

function App() {
  const { user, isAuthenticated, loading, error, checkAuth, login, register, logout } =
    useAuthStore();

  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoginView) {
      await login({ email: formData.email, password: formData.password });
    } else {
      await register(formData);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center space-x-3 text-cyan-400">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">Initializing Storiva Auth...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 rounded-full uppercase">
            Phase 2 — Authentication Active
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Storiva
          </h1>
          <p className="text-sm text-slate-400">All Your Storage. One Place.</p>
        </div>

        {/* User Logged In Card */}
        {isAuthenticated && user ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400 font-bold text-lg">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Authenticated
              </span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Storiva Account ID:</span>
                <span className="font-mono text-slate-300">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Verified:</span>
                <span className="text-indigo-400 font-semibold">{user.emailVerified ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Member Since:</span>
                <span className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-semibold rounded-xl transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Storiva</span>
            </button>
          </div>
        ) : (
          /* Authentication Form Card */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsLoginView(true)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  isLoginView
                    ? "bg-cyan-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  !isLoginView
                    ? "bg-cyan-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginView && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Alex Developer"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="alex@storiva.io"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition duration-200 text-sm mt-2"
              >
                {isLoginView ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Storiva</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Storiva Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <p className="text-xs text-center text-slate-500">
          Storiva Modular Monolith • Auth Module Active
        </p>
      </div>
    </main>
  );
}

export default App;