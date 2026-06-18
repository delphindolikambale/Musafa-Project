import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { 
  User, Mail, Lock, Loader2, Home, 
  Eye, EyeOff, CheckCircle2, XCircle, 
  Sun, Moon, Globe 
} from "lucide-react";

// Dictionnaire de traduction intégré
const translations = {
  FR: {
    title: "Inscription",
    subtitle: "Configurez votre espace personnel Élève.",
    userLabel: "Nom d'utilisateur",
    emailLabel: "Adresse Email",
    passLabel: "Mot de passe",
    confirmLabel: "Confirmation",
    submitBtn: "Valider l'inscription",
    loadingBtn: "Création en cours...",
    hasAccount: "Vous avez déjà un compte ?",
    loginLink: "Se Connecter",
    home: "Accueil",
    passMismatch: "Les mots de passe ne correspondent pas.",
    successTitle: "Inscription Réussie",
    successText: "Compte Élève créé avec succès ! Préparation de l'authentification...",
    errorTitle: "Échec de l'inscription"
  },
  EN: {
    title: "Registration",
    subtitle: "Set up your personal Student space.",
    userLabel: "Username",
    emailLabel: "Email Address",
    passLabel: "Password",
    confirmLabel: "Confirm Password",
    submitBtn: "Complete Registration",
    loadingBtn: "Creating Account...",
    hasAccount: "Already have an account?",
    loginLink: "Sign In",
    home: "Home",
    passMismatch: "Passwords do not match.",
    successTitle: "Registration Successful",
    successText: "Student account created successfully! Preparing login...",
    errorTitle: "Registration Failed"
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ELEVE"
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Utilisation unifiée des clés de stockage globales du système (app-lang et app-theme)
  const [lang, setLang] = useState(localStorage.getItem("app-lang") || "FR");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("app-theme") === "dark");

  // Fenêtres de notification modales unifiées
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });

  const navigate = useNavigate();
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("app-theme", darkMode ? "dark" : "light");
    localStorage.setItem("app-lang", lang);
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode, lang]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setNotification({ show: false, type: "", title: "", text: "" });

    if (formData.password !== formData.confirmPassword) {
      setNotification({
        show: true,
        type: "error",
        title: t.errorTitle,
        text: t.passMismatch
      });
      return;
    }

    loading(true);
    try {
      await AuthService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );

      setNotification({
        show: true,
        type: "success",
        title: t.successTitle,
        text: t.successText
      });

      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      const resMessage = (error.response && error.response.data && error.response.data.message) || 
                         (lang === "FR" ? "Erreur lors de l'inscription." : "An error occurred during registration.");
      setNotification({
        show: true,
        type: "error",
        title: t.errorTitle,
        text: resMessage
      });
      setLoading(false);
    }
  };

  return (
    <div 
      className={`h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-900"}`}
      style={{ backgroundImage: "url('/images/bg-school.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className={`absolute inset-0 backdrop-blur-md ${darkMode ? "bg-slate-950/85" : "bg-slate-900/75"}`}></div>

      {/* Barre d'utilitaires supérieure : Thème et Langue */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <button onClick={() => setDarkMode(!darkMode)} className="text-white hover:text-blue-400 transition-colors p-1">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="h-4 w-[1px] bg-white/20"></div>
        <button onClick={() => setLang(lang === "FR" ? "EN" : "FR")} className="text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
          <Globe size={16} /> {lang}
        </button>
      </div>

      {/* Conteneur principal adapté à la hauteur sans dépassement */}
      <div className="relative z-10 w-full max-w-xl p-4 flex flex-col justify-center h-full sm:h-auto">
        <div className={`rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-slate-800 text-white shadow-black/50" : "bg-white border-white/20 text-slate-900"}`}>
          
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-900 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white text-xl font-black transition-transform hover:scale-105">
              M
            </Link>
            <Link to="/" className={`transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-blue-600"}`}>
              <Home size={16} /> {t.home}
            </Link>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight mb-0.5">{t.title}</h2>
            <p className={`font-medium text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.subtitle}</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div className="sm:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.userLabel}</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><User size={16} /></span>
                <input 
                  name="username" type="text" placeholder="ex: jean.mukendi"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-xs ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                  onChange={handleChange} value={formData.username} required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.emailLabel}</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><Mail size={16} /></span>
                <input 
                  name="email" type="email" placeholder="eleve@musafa.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-xs ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                  onChange={handleChange} value={formData.email} required
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.passLabel}</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><Lock size={16} /></span>
                <input 
                  name="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className={`w-full pl-11 pr-10 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-xs ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                  onChange={handleChange} value={formData.password} required
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="col-span-1">
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.confirmLabel}</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><Lock size={16} /></span>
                <input 
                  name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                  className={`w-full pl-11 pr-10 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-xs ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                  onChange={handleChange} value={formData.confirmPassword} required
                />
                <button 
                  type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 mt-3">
              <button 
                type="submit" disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                  ${loading ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" : "bg-gradient-to-r from-blue-600 to-indigo-900 hover:from-blue-700 hover:to-indigo-950 text-white shadow-xl shadow-blue-500/10"}
                `}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t.loadingBtn}</> : t.submitBtn}
              </button>
            </div>
          </form>

          <div className={`mt-5 text-center border-t pt-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <p className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.hasAccount}
              <Link to="/login" className="ml-2 text-blue-500 font-black hover:text-blue-600 transition-colors">
                {t.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {notification.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`max-w-sm w-full p-6 rounded-3xl border shadow-2xl transform scale-100 transition-all text-center ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"}`}>
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4">
              {notification.type === "success" ? (
                <CheckCircle2 size={48} className="text-green-500 animate-pulse" />
              ) : (
                <XCircle size={48} className="text-red-500 animate-pulse" />
              )}
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">{notification.title}</h3>
            <p className={`text-sm font-medium mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{notification.text}</p>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-[0.97] ${notification.type === "success" ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-red-600 text-white shadow-lg shadow-red-600/20"}`}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;