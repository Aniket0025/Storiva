import { useState, useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { cloudAccountService } from "./services/cloudAccountService";
import { FileExplorer } from "./components/FileExplorer";
import {
  LogOut,
  ShieldCheck,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  HardDrive,
  Plus,
  Trash2,
  CheckCircle2,
  User,
} from "lucide-react";

function App() {
  const { user, isAuthenticated, loading, error, checkAuth, login, register, logout } =
    useAuthStore();

  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [connectNotification, setConnectNotification] = useState(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectStatus = params.get("connect");
    const connectedEmail = params.get("email");

    if (connectStatus === "success") {
      setConnectNotification(`Successfully connected Google Drive account: ${connectedEmail}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (connectStatus === "error") {
      setConnectNotification(`Connection failed: ${params.get("message")}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const data = await cloudAccountService.getAccounts();
      setAccounts(data.data.accounts || []);
    } catch (err) {
      console.error("Failed to load cloud accounts:", err);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await cloudAccountService.initiateGoogleConnect();
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert("Failed to initiate Google connection. Please check backend configuration.");
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await cloudAccountService.disconnectAccount(accountId);
      fetchAccounts();
    } catch (err) {
      alert("Failed to disconnect account.");
    }
  };

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
          <span className="font-medium">Initializing Storiva...</span>
        </div>
      </main>
    );
  }

  const totalCapacity = accounts.reduce((acc, a) => acc + (a.storage?.total || 0), 0);
  const totalUsed = accounts.reduce((acc, a) => acc + (a.storage?.used || 0), 0);
  const totalAvailable = accounts.reduce((acc, a) => acc + (a.storage?.available || 0), 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white font-sans">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 rounded-full uppercase">
            Phase 14 — Dashboard & File Explorer Active
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Storiva
          </h1>
          <p className="text-sm text-slate-400">All Your Storage. One Place.</p>
        </div>

        {connectNotification && (
          <div className="p-4 bg-cyan-950/80 border border-cyan-700/60 rounded-xl text-cyan-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{connectNotification}</span>
          </div>
        )}

        {/* Authenticated Dashboard */}
        {isAuthenticated && user ? (
          <div className="space-y-6">
            {/* User Profile Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400 font-bold text-lg">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="hidden sm:flex px-3 py-1 text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Logged In
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 py-2 px-3 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-semibold rounded-xl text-xs transition duration-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Aggregate Storage Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  Unified Storage Summary
                </h3>
                <button
                  onClick={handleConnectGoogle}
                  className="flex items-center space-x-1.5 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg transition duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Google Drive</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Total Capacity</span>
                  <span className="text-base font-bold text-white font-mono">{formatBytes(totalCapacity)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Used Space</span>
                  <span className="text-base font-bold text-indigo-400 font-mono">{formatBytes(totalUsed)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Available</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{formatBytes(totalAvailable)}</span>
                </div>
              </div>
            </div>

            {/* Interactive File Explorer Component */}
            <FileExplorer onStorageChange={fetchAccounts} />

            {/* Connected Accounts List Drawer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Connected Cloud Accounts ({accounts.length})
              </h3>

              {accountsLoading ? (
                <p className="text-xs text-slate-400">Loading connected accounts...</p>
              ) : accounts.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400">No cloud accounts connected yet.</p>
                  <button
                    onClick={handleConnectGoogle}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    Connect your first Google Drive
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <span className="font-bold text-white block truncate">{acc.email}</span>
                        <p className="text-[10px] text-slate-500">
                          {formatBytes(acc.storage?.available)} free of {formatBytes(acc.storage?.total)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDisconnect(acc.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Auth Form Card */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-md mx-auto">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsLoginView(true)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  isLoginView ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  !isLoginView ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
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
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
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
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
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
          Storiva Modular Monolith • Dashboard & File Explorer Active
        </p>
      </div>
    </main>
  );
}

export default App;