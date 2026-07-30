import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";
import ActivationForm from "./errors/ActivationForm";
import ChangeCredentialsForm from "./ChangeCredentialsForm";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { 
  User, Lock, ArrowRight, Loader2, Home, 
  Eye, EyeOff, CheckCircle2, XCircle, 
  Sun, Moon, Globe, ShieldAlert, GraduationCap, BookOpen
} from "lucide-react";

const translations = {
  FR: {
    title: "Connexion",
    subtitle: "Veuillez saisir vos identifiants pour continuer.",
    userLabel: "Utilisateur",
    userInput: "Nom d'utilisateur",
    passLabel: "Mot de passe",
    forgot: "Oublié ?",
    submitBtn: "Se Connecter",
    loadingBtn: "Authentification...",
    noAccount: "Vous n'avez pas de compte ?",
    registerLink: "Créer un compte",
    home: "Accueil",
    successTitle: "Connexion Réussie",
    successText: "Ravi de vous revoir ! Redirection vers votre tableau de bord...",
    errorTitle: "Échec de connexion",
    barrierExpiredTitle: "Accès Bloqué - Abonnement Expiré",
    barrierExpiredText: "L'abonnement SaaS de votre établissement a expiré. Veuillez contacter le Super Admin du système pour renouveler la souscription.",
    barrierConfigTitle: "Établissement Non Configuré",
    barrierConfigText: "Cette école n'est pas encore entièrement configurée sur la plateforme. Veuillez patienter ou contacter l'administration.",
    barrierBtn: "Retour à l'accueil",
    noSchoolError: "Accès refusé : Votre compte n'est lié à aucun établissement enregistré sur la plateforme."
  },
  EN: {
    title: "Sign In",
    subtitle: "Please enter your credentials to continue.",
    userLabel: "Username",
    userInput: "Username",
    passLabel: "Password",
    forgot: "Forgot?",
    submitBtn: "Sign In",
    loadingBtn: "Authenticating...",
    noAccount: "Don't have an account?",
    registerLink: "Create an account",
    home: "Home",
    successTitle: "Login Successful",
    successText: "Welcome back! Redirecting to your dashboard...",
    errorTitle: "Login Failed",
    barrierExpiredTitle: "Access Blocked - Subscription Expired",
    barrierExpiredText: "Your institution's SaaS subscription has expired. Please contact the system Super Admin to renew the contract.",
    barrierConfigTitle: "Institution Not Configured",
    barrierConfigText: "This school is not fully configured on the platform yet. Please try again later or contact support.",
    barrierBtn: "Back to Home",
    noSchoolError: "Access denied: Your account is not linked to any registered institution on the platform."
  }
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [systemConfig, setSystemConfig] = useState(() => {
    const storedLogo = localStorage.getItem("system-logo") || localStorage.getItem("systemLogoPath") || null;
    const storedName = localStorage.getItem("system-name") || localStorage.getItem("systemAppName") || "MyAcademia";
    return { logoUrl: storedLogo, systemName: storedName };
  });
  
  const [lang, setLang] = useState(localStorage.getItem("app-lang") || "FR");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("app-theme") === "dark");

  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });
  const [barrier, setBarrier] = useState({ active: false, type: "" }); 

  const navigate = useNavigate();
  const t = translations[lang] || translations["FR"];

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

  useEffect(() => {
    const loadSystemConfig = async () => {
      try {
        if (typeof AuthService.getPublicConfig === "function") {
          const response = await AuthService.getPublicConfig();
          if (response?.data) {
            const data = response.data;
            const rawLogo = data.globalLogoPath || data.logoUrl || data.logo || null;
            const name = data.applicationName || data.systemName || data.name || "MyAcademia";

            let fullLogoUrl = null;
            if (rawLogo) {
              if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')) {
                fullLogoUrl = rawLogo;
              } else {
                const backendHost = window.location.origin.includes('localhost') 
                  ? 'http://localhost:8080' 
                  : window.location.origin;
                fullLogoUrl = `${backendHost}/${rawLogo.replace(/^\/+/, '')}`;
              }
            }

            setSystemConfig({ logoUrl: fullLogoUrl, systemName: name });

            if (rawLogo) {
              localStorage.setItem("systemLogoPath", rawLogo);
              localStorage.setItem("system-logo", fullLogoUrl);
            }
            if (name) {
              localStorage.setItem("systemAppName", name);
              localStorage.setItem("system-name", name);
            }
          }
        }
      } catch (error) {
        console.warn("Impossible de récupérer la configuration globale automatiquement.", error);
      }
    };

    loadSystemConfig();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ show: false, type: "", title: "", text: "" });

    try {
      const userData = await AuthService.login(username, password);
      const userRoles = userData.roles || [];
      
      let mustChangePassword = false;
      if (userData.token) {
        try {
          const decoded = jwtDecode(userData.token);
          mustChangePassword = decoded.mustChangePassword === true;
        } catch (err) {
          console.error("Erreur de décodage du token", err);
        }
      }

      // ✅ MODIFICATION ICI : On intègre academicYearId proprement
      const updatedUser = { 
        ...userData, 
        schoolId: userData.schoolId,
        schoolCode: userData.schoolCode,
        academicYearId: userData.academicYearId, // Injection de la nouvelle donnée du Backend
        isSubscriptionActive: userData.isSubscriptionActive ?? userData.subscriptionActive,
        isSchoolConfigured: userData.isSchoolConfigured ?? userData.schoolConfigured,
        mustChangePassword: mustChangePassword
      };
      
      // On sauvegarde l'utilisateur
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // ✅ AJOUT ESSENTIEL : On sauvegarde l'année académique dans des clés individuelles 
      // pour que tous les composants (comme l'horaire de l'enseignant) le trouvent tout de suite.
      if (userData.academicYearId) {
        localStorage.setItem("academicYearId", userData.academicYearId);
        localStorage.setItem("currentAcademicYearId", userData.academicYearId);
      }

      const isSuperAdmin = userRoles.includes("ROLE_SUPER_ADMIN_SYSTEM") || userRoles.includes("SUPER_ADMIN_SYSTEM");
      const isLocalAdmin = !isSuperAdmin && (userRoles.includes("ROLE_ADMIN_SYSTEM") || userRoles.includes("ADMIN_SYSTEM") || userRoles.includes("ADMIN") || userRoles.includes("ROLE_ADMIN"));

      if (isLocalAdmin && !updatedUser.schoolId) {
        setNotification({
          show: true,
          type: "error",
          title: t.errorTitle,
          text: t.noSchoolError
        });
        setLoading(false);
        localStorage.removeItem("user");
        return;
      }

      if (mustChangePassword) {
        setBarrier({ active: true, type: "CREDENTIALS" });
        setLoading(false);
        return;
      }

      if (!isSuperAdmin && !isLocalAdmin && updatedUser.schoolId) {
        if (updatedUser.isSubscriptionActive === false) {
          setBarrier({ active: true, type: "EXPIRED" });
          setLoading(false);
          return;
        }
        if (updatedUser.isSchoolConfigured === false) {
          setBarrier({ active: true, type: "UNCONFIGURED" });
          setLoading(false);
          return;
        }
      }

      setNotification({
        show: true,
        type: "success",
        title: t.successTitle,
        text: t.successText
      });

      setTimeout(() => {
        if (isSuperAdmin) {
          navigate("/super-admin/dashboard");
        } else if (isLocalAdmin) {
          if (updatedUser.isSubscriptionActive === false) {
            setNotification({ show: false, type: "", title: "", text: "" });
            setBarrier({ active: true, type: "EXPIRED" });
          } else if (updatedUser.isSchoolConfigured === false) {
            setNotification({ show: false, type: "", title: "", text: "" });
            setBarrier({ active: true, type: "UNCONFIGURED" });
          } else {
            navigate("/dashboard");
          }
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
      }, 2000);

    } catch (error) {
      const backendError = error.response?.data?.error || error.response?.data?.message;
      
      if (backendError && (backendError.toLowerCase().includes("abonnement expiré") || backendError.toLowerCase().includes("suspendu"))) {
        setBarrier({ active: true, type: "EXPIRED" });
      } else if (error.response?.data?.status === "SUBSCRIPTION_EXPIRED") {
        setBarrier({ active: true, type: "EXPIRED" });
      } else {
        setNotification({
          show: true,
          type: "error",
          title: t.errorTitle,
          text: backendError || (lang === "FR" ? "Identifiants incorrects ou serveur injoignable." : "Invalid credentials or server unreachable.")
        });
      }
      setLoading(false);
    }
  };

  const handleLogoutCancel = () => {
    localStorage.clear();
    setBarrier({ active: false, type: "" });
    setUsername("");
    setPassword("");
  };

  if (barrier.active) {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const currentUserRoles = currentUser.roles || [];
    const isSuperAdminFallback = currentUserRoles.includes("ROLE_SUPER_ADMIN_SYSTEM") || currentUserRoles.includes("SUPER_ADMIN_SYSTEM");
    const isLocalAdmin = !isSuperAdminFallback && (currentUserRoles.includes("ROLE_ADMIN_SYSTEM") || currentUserRoles.includes("ADMIN_SYSTEM") || currentUserRoles.includes("ADMIN") || currentUserRoles.includes("ROLE_ADMIN"));

    return (
      <div className={`min-h-screen w-screen flex flex-col items-center justify-center font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-slate-900 text-white"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_70%)] animate-pulse"></div>
        
        {barrier.type === "CREDENTIALS" ? (
          <ChangeCredentialsForm 
            currentUsername={currentUser.username || username}
            darkMode={darkMode}
            lang={lang}
            onCancel={handleLogoutCancel}
            onSuccess={() => {
              handleLogoutCancel();
            }}
          />
        ) : 
        isLocalAdmin ? (
          <ActivationForm 
            type={barrier.type}
            schoolId={currentUser.schoolId}
            onCancel={handleLogoutCancel}
            onSuccess={() => {
              if (barrier.type === "EXPIRED") currentUser.isSubscriptionActive = true;
              if (barrier.type === "UNCONFIGURED") currentUser.isSchoolConfigured = true;
              localStorage.setItem("user", JSON.stringify(currentUser));
              setBarrier({ active: false, type: "" });
              navigate("/dashboard");
            }}
            darkMode={darkMode}
            lang={lang}
          />
        ) : (
          <div className="relative z-10 max-w-xl text-center p-8 bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-[2.5rem] shadow-2xl shadow-red-950/50 mx-4">
            <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
              <ShieldAlert size={48} className="text-red-500 animate-bounce" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-4">
              {barrier.type === "EXPIRED" ? t.barrierExpiredTitle : t.barrierConfigTitle}
            </h1>
            <p className="text-slate-300 font-medium mb-8 text-base leading-relaxed">
              {barrier.type === "EXPIRED" ? t.barrierExpiredText : t.barrierConfigText}
            </p>
            <button 
              onClick={handleLogoutCancel}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-xl shadow-red-900/30"
            >
              {t.barrierBtn}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative font-sans transition-colors duration-300 ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50" : "bg-gradient-to-br from-[#f3f4ff] via-[#eef2ff] to-[#f0f9ff]"}`}>
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 text-indigo-300/20 dark:text-indigo-500/[0.03] transform -rotate-12 scale-[12] sm:scale-[15]">
          <BookOpen size={64} strokeWidth={1.5} />
        </div>
        <div className="absolute top-[10%] right-[10%] text-purple-300/20 dark:text-purple-500/[0.03] transform rotate-12 scale-[6] sm:scale-[8]">
          <GraduationCap size={64} strokeWidth={1.5} />
        </div>
        {darkMode && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]"></div>
        )}
      </div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-indigo-100/50 dark:border-white/10">
        <button onClick={() => setDarkMode(!darkMode)} className={`transition-colors p-1 ${darkMode ? "text-white hover:text-blue-400" : "text-slate-600 hover:text-indigo-600"}`} aria-label="Toggle theme">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className={`h-4 w-[1px] ${darkMode ? "bg-white/20" : "bg-slate-300"}`}></div>
        <button onClick={() => setLang(lang === "FR" ? "EN" : "FR")} className={`transition-colors flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${darkMode ? "text-white hover:text-blue-400" : "text-slate-600 hover:text-indigo-600"}`}>
          <Globe size={16} /> {lang}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col justify-center my-auto">
        <div className={`rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-slate-800/80 text-white shadow-black/40" : "bg-white/95 backdrop-blur-sm border-white text-slate-900 shadow-indigo-900/5"}`}>
          
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="group flex items-center gap-2">
              {systemConfig.logoUrl ? (
                <img 
                  src={systemConfig.logoUrl} 
                  alt={systemConfig.systemName} 
                  className="w-12 h-12 object-contain rounded-2xl bg-white p-1 shadow-sm border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    setSystemConfig(prev => ({ ...prev, logoUrl: null }));
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm text-indigo-500 dark:text-indigo-400 transition-transform group-hover:scale-105">
                  <BookOpen size={24} />
                </div>
              )}
            </Link>
            
            <Link to="/" className={`transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-indigo-600"}`}>
              <Home size={16} /> {t.home}
            </Link>
          </div>

          <div className="mb-6">
            <h2 className={`text-2xl font-black tracking-tight mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}>{t.title}</h2>
            <p className={`font-medium text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.userLabel}</label>
              <div className="relative group">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-slate-400 group-focus-within:text-indigo-400" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  placeholder={t.userInput}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:bg-slate-950 text-white" : "bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800"}`}
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.passLabel}</label>
                <a href="#" className="text-[11px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider transition-colors">{t.forgot}</a>
              </div>
              <div className="relative group">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-slate-400 group-focus-within:text-indigo-400" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-2xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:bg-slate-950 text-white" : "bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800"}`}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                ${loading ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700" : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25"}
              `}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {t.loadingBtn}</>
                ) : (
                  <>{t.submitBtn} <ArrowRight size={18} /></>
                )}
              </button>
            </form>

          <div className={`mt-6 text-center border-t pt-5 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.noAccount}
              <Link to="/register" className="ml-2 text-indigo-500 font-black hover:text-indigo-600 transition-colors">
                {t.registerLink}
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

export default Login;