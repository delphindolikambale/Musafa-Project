import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { User, Mail, Lock, Loader2, GraduationCap } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ELEVE" // RÔLE PAR DÉFAUT MODIFIÉ ICI
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[650px] border border-slate-100">
        
        {/* SECTION GAUCHE : VISUELLE */}
        <div className="hidden lg:flex lg:w-5/12 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-indigo-400/20">M</div>
              <h2 className="text-white font-black tracking-tight text-xl uppercase">C.S. Musafa</h2>
            </Link>
            <h1 className="text-4xl font-black text-white leading-[1.1] mb-6">
              Rejoignez <br /> 
              <span className="text-indigo-400">l'excellence.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Créez votre compte Élève pour accéder à vos notes, vos devoirs et votre emploi du temps numérisé.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-4 text-indigo-300">
              <GraduationCap size={24} />
              <span className="font-bold text-sm tracking-widest uppercase">Portail Élève</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              L'inscription est réservée aux étudiants régulièrement inscrits au complexe scolaire.
            </p>
          </div>
        </div>

        {/* SECTION DROITE : FORMULAIRE */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Inscription</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Configurez votre espace personnel.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto lg:mx-0 w-full">
            
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Nom d'utilisateur</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><User size={18} /></span>
                <input 
                  name="username" type="text" placeholder="ex: jean.mukendi"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.username} required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Adresse Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Mail size={18} /></span>
                <input 
                  name="email" type="email" placeholder="eleve@musafa.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.email} required
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Mot de passe</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Lock size={18} /></span>
                <input 
                  name="password" type="password" placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.password} required
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Confirmation</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Lock size={18} /></span>
                <input 
                  name="confirmPassword" type="password" placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                  onChange={handleChange} value={formData.confirmPassword} required
                />
              </div>
            </div>

            <div className="sm:col-span-2 mt-4">
              <button 
                type="submit" disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                  ${loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20"}
                `}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Création...</> : "Valider l'inscription"}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-6 p-4 border rounded-2xl text-sm font-semibold flex items-center gap-3 max-w-xl mx-auto lg:mx-0 w-full
              ${message.includes("succès") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"}`}>
              <span className="text-xl">{message.includes("succès") ? "✅" : "⚠️"}</span> {message}
            </div>
          )}

          <div className="mt-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0 w-full">
            <p className="text-slate-500 text-sm font-medium">
              Vous avez déjà un compte ? 
              <Link to="/login" className="ml-2 text-indigo-600 font-black hover:text-indigo-800 transition-colors">
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