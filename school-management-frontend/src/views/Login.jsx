import React, { useState } from "react";
import AuthService from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";

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
      
      // LOGIQUE DE REDIRECTION MISE À JOUR
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] border border-slate-100">
        
        {/* SECTION GAUCHE : VISUELLE */}
        <div className="hidden lg:flex lg:w-5/12 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-400/20">M</div>
              <h2 className="text-white font-black tracking-tight text-xl uppercase">C.S. Musafa</h2>
            </Link>
            <h1 className="text-4xl font-black text-white leading-[1.1] mb-6">
              Content de vous <br /> 
              <span className="text-blue-400">revoir.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Accédez à votre espace sécurisé pour consulter vos horaires, résultats et gérer vos activités académiques.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-slate-300 font-medium text-sm italic leading-relaxed">
              "L'éducation est la clé qui ouvre la porte en or de la liberté."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">DM</div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Direction Musafa</p>
            </div>
          </div>
        </div>

        {/* SECTION DROITE : FORMULAIRE */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="mb-10 lg:hidden flex flex-col items-center">
            <Link to="/" className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20 text-white text-3xl font-black">M</Link>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">C.S. MUSAFA</h2>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Connexion</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Veuillez saisir vos identifiants pour continuer.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto lg:mx-0 w-full">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Utilisateur</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </span>
                <input 
                  type="text" 
                  placeholder="Nom d'utilisateur"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Mot de passe</label>
                <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">Oublié ?</a>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </span>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 tracking-widest"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                ${loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10"}
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
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-3 max-w-md mx-auto lg:mx-0 w-full">
              <span className="text-xl">⚠️</span> {message}
            </div>
          )}

          <div className="mt-10 text-center lg:text-left max-w-md mx-auto lg:mx-0 w-full">
            <p className="text-slate-500 text-sm font-medium">
              Vous n'avez pas de compte ? 
              <Link to="/register" className="ml-2 text-blue-600 font-black hover:text-blue-800 transition-colors">
                Créer un compte Élève
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;