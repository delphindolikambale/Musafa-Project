import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";
import ActivationForm from "./errors/ActivationForm";
import ChangeCredentialsForm from "./ChangeCredentialsForm"; // ✅ IMPORT DE LA NOUVELLE VUE
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ NÉCESSITE: npm install jwt-decode
import { 
  User, Lock, ArrowRight, Loader2, Home, 
  Eye, EyeOff, CheckCircle2, XCircle, 
  Sun, Moon, Globe, ShieldAlert 
} from "lucide-react";

// Dictionnaire de traduction intégré
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
  
  // Gestion de la langue et du thème unifiée
  const [lang, setLang] = useState(localStorage.getItem("app-lang") || "FR");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("app-theme") === "dark");

  // Dialogues de notification personnalisés
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });
  
  // Écran barrière d'interception (CREDENTIALS, EXPIRED, UNCONFIGURED)
  const [barrier, setBarrier] = useState({ active: false, type: "" }); 

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ show: false, type: "", title: "", text: "" });

    try {
      const userData = await AuthService.login(username, password);
      const userRoles = userData.roles || [];
      
      // ✅ LECTURE DU TOKEN POUR VÉRIFIER LE FLAG D'ONBOARDING
      let mustChangePassword = false;
      if (userData.token) {
        try {
          const decoded = jwtDecode(userData.token);
          mustChangePassword = decoded.mustChangePassword === true;
        } catch (err) {
          console.error("Erreur de décodage du token", err);
        }
      }

      const updatedUser = { 
        ...userData, 
        schoolId: userData.schoolId,
        schoolCode: userData.schoolCode,
        isSubscriptionActive: userData.isSubscriptionActive ?? userData.subscriptionActive,
        isSchoolConfigured: userData.isSchoolConfigured ?? userData.schoolConfigured,
        mustChangePassword: mustChangePassword // Ajout à l'objet local pour le routage futur
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));

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

      // ✅ BARRIÈRE 1 : CHANGEMENT DE MOT DE PASSE OBLIGATOIRE (L'emporte sur tout le reste)
      if (mustChangePassword) {
        setBarrier({ active: true, type: "CREDENTIALS" });
        setLoading(false);
        return;
      }

      // ✅ BARRIÈRE 2 : RESTRICTION SAAS POUR LES NON-ADMINS
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

      // Notification Succès si tout est valide ou si l'utilisateur est admin autorisé à configurer/réactiver
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
          // ✅ BARRIÈRE 3 : RESTRICTION SAAS POUR L'ADMIN LOCAL (Affichage du formulaire d'activation)
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
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const currentUserRoles = currentUser.roles || [];
      const isSuperAdminFallback = currentUserRoles.includes("ROLE_SUPER_ADMIN_SYSTEM") || currentUserRoles.includes("SUPER_ADMIN_SYSTEM");
      const isLocalAdminFallback = !isSuperAdminFallback && (currentUserRoles.includes("ROLE_ADMIN_SYSTEM") || currentUserRoles.includes("ADMIN_SYSTEM") || currentUserRoles.includes("ADMIN") || currentUserRoles.includes("ROLE_ADMIN"));

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
      <div className={`h-screen w-screen flex flex-col items-center justify-center font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-slate-900 text-white"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_70%)] animate-pulse"></div>
        
        {/* ✅ ÉCRAN D'ONBOARDING 1 : Changement des identifiants */}
        {barrier.type === "CREDENTIALS" ? (
          <ChangeCredentialsForm 
            currentUsername={currentUser.username || username}
            darkMode={darkMode}
            lang={lang}
            onCancel={handleLogoutCancel}
            onSuccess={() => {
              // Après succès du changement, on force la déconnexion pour se reconnecter proprement avec les nouveaux identifiants
              handleLogoutCancel();
            }}
          />
        ) : 
        /* ✅ ÉCRAN D'ONBOARDING 2 : Activation de licence (réservé aux admins locaux) */
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
          /* ✅ ÉCRAN DE BLOCAGE STANDARD : Pour les simples utilisateurs si l'école est suspendue */
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
    <div 
      className={`h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-900"}`}
      style={{ backgroundImage: "url('/images/bg-school.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className={`absolute inset-0 backdrop-blur-md ${darkMode ? "bg-slate-950/85" : "bg-slate-900/75"}`}></div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <button onClick={() => setDarkMode(!darkMode)} className="text-white hover:text-blue-400 transition-colors p-1">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="h-4 w-[1px] bg-white/20"></div>
        <button onClick={() => setLang(lang === "FR" ? "EN" : "FR")} className="text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
          <Globe size={16} /> {lang}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col justify-center h-full sm:h-auto">
        <div className={`rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-slate-800 text-white shadow-black/50" : "bg-white border-white/20 text-slate-900"}`}>
          
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-900 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white text-xl font-black transition-transform hover:scale-105">
              M
            </Link>
            <Link to="/" className={`transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-blue-600"}`}>
              <Home size={16} /> {t.home}
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight mb-1">{t.title}</h2>
            <p className={`font-medium text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.userLabel}</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  placeholder={t.userInput}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-2xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3
                ${loading ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" : "bg-gradient-to-r from-blue-600 to-indigo-900 hover:from-blue-700 hover:to-indigo-950 text-white shadow-xl shadow-blue-500/10"}
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
              <Link to="/register" className="ml-2 text-blue-500 font-black hover:text-blue-600 transition-colors">
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