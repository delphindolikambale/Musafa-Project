import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { User, Mail, Lock, Loader2, Home } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ELEVE"
  });
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(""); 

    if (formData.password !== formData.confirmPassword) {
      return setMessage("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);
    try {
      await AuthService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );

      setMessage("Compte Élève créé avec succès ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      const resMessage = (error.response && error.response.data && error.response.data.message) || "Erreur lors de l'inscription.";
      setMessage(resMessage);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center font-sans py-10"
      style={{ backgroundImage: "url('/images/bg-school.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg p-4 sm:p-8">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-white/20">
          
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-900 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 text-white text-xl font-black transition-transform hover:scale-105">
              M
            </Link>
            <Link to="/" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Home size={16} /> Accueil
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Inscription</h2>
            <p className="text-slate-500 font-medium text-sm">Configurez votre espace personnel Élève.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Nom d'utilisateur</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><User size={18} /></span>
                <input 
                  name="username" type="text" placeholder="ex: jean.mukendi"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.username} required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Adresse Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={18} /></span>
                <input 
                  name="email" type="email" placeholder="eleve@musafa.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.email} required
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Mot de passe</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></span>
                <input 
                  name="password" type="password" placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.password} required
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Confirmation</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></span>
                <input 
                  name="confirmPassword" type="password" placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.confirmPassword} required
                />
              </div>
            </div>

            <div className="sm:col-span-2 mt-2">
              <button 
                type="submit" disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                  ${loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-slate-900 hover:from-blue-700 hover:to-black text-white shadow-xl shadow-blue-900/20"}
                `}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Création...</> : "Valider l'inscription"}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-6 p-4 border rounded-2xl text-sm font-semibold flex items-center gap-3
              ${message.includes("succès") ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"}`}>
              <span className="text-xl">{message.includes("succès") ? "✅" : "⚠️"}</span> {message}
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm font-medium">
              Vous avez déjà un compte ? 
              <Link to="/login" className="ml-2 text-blue-600 font-black hover:text-blue-800 transition-colors">
                Se Connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;