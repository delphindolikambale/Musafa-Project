import React, { useState } from "react";
import AuthService from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Loader2, Home } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const userData = await AuthService.login(username, password);
      
      const userRoles = userData.roles || [];
      
      // LOGIQUE DE REDIRECTION CONSERVÉE INTACTE
      if (userRoles.includes("ROLE_ADMIN_SYSTEM") || userRoles.includes("ADMIN")) {
        navigate("/dashboard");
      } else if (userRoles.includes("ROLE_PREFET") || userRoles.includes("PREFET")) {
        navigate("/prefet/dashboard");
      } else if (userRoles.includes("ROLE_PROVISEUR") || userRoles.includes("PROVISEUR")) {
        navigate("/proviseur/dashboard");
      } else if (userRoles.includes("ROLE_CAISSIER") || userRoles.includes("CAISSIER")) {
        navigate("/caissier/dashboard");
      } else if (userRoles.includes("ROLE_ENSEIGNANT") || userRoles.includes("ENSEIGNANT")) {
        navigate("/enseignant/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Identifiants incorrects ou serveur injoignable.";
      setMessage(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/images/bg-school.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-4 sm:p-8">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-white/20">
          
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-900 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 text-white text-xl font-black transition-transform hover:scale-105">
              M
            </Link>
            <Link to="/" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Home size={16} /> Accueil
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Connexion</h2>
            <p className="text-slate-500 font-medium text-sm">Veuillez saisir vos identifiants pour continuer.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Utilisateur</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </span>
                <input 
                  type="text" 
                  placeholder="Nom d'utilisateur"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Mot de passe</label>
                <a href="#" className="text-[11px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider transition-colors">Oublié ?</a>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </span>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 tracking-widest"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 mt-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                ${loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-slate-900 hover:from-blue-700 hover:to-black text-white shadow-xl shadow-blue-900/20"}
              `}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Authentification...</>
              ) : (
                <>Se Connecter <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-3">
              <span className="text-xl">⚠️</span> {message}
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm font-medium">
              Vous n'avez pas de compte ? 
              <Link to="/register" className="ml-2 text-blue-600 font-black hover:text-blue-800 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;