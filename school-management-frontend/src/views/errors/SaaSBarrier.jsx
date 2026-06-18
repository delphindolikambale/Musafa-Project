import React, { useState } from "react";
import { ShieldAlert, LogOut } from "lucide-react";
import ActivationForm from "./ActivationForm";

const SaaSBarrier = ({ type, theme = "light", lang = "FR" }) => {
  const isDark = theme === "dark";
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userRoles = user.roles || [];
  
  // ✅ Vérification si l'utilisateur connecté possède les privilèges d'administration système
  const isLocalAdmin = userRoles.includes("ROLE_ADMIN_SYSTEM") || userRoles.includes("ADMIN") || userRoles.includes("ROLE_ADMIN");
  
  const [activated, setActivated] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const translations = {
    FR: {
      expiredTitle: "Accès Bloqué - Abonnement Expiré",
      expiredText: "L'abonnement annuel de votre établissement sur MyAcademia a expiré ou n'a pas encore été réglé. Veuillez contacter l'administration de l'école.",
      configTitle: "Établissement Non Configuré",
      configText: "Les paramètres essentiels de votre établissement (Année scolaire active, classes, options) n'ont pas encore été configurés par la direction.",
      btn: "Déconnexion"
    },
    EN: {
      expiredTitle: "Access Blocked - Subscription Expired",
      expiredText: "Your institution's annual subscription on MyAcademia has expired or has not yet been paid. Please contact your school administration.",
      configTitle: "Institution Not Configured",
      configText: "The essential settings for your institution (Active academic year, classes, options) have not yet been configured by the management.",
      btn: "Log Out"
    }
  };

  const t = translations[lang] || translations["FR"];

  if (activated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center font-sans overflow-hidden ${isDark ? "bg-slate-950 text-white" : "bg-slate-900 text-white"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12),transparent_70%)] animate-pulse"></div>
      
      {/* ✅ Si l'utilisateur est un ADMIN_SYSTEM, on lui affiche le formulaire d'activation au lieu de l'écran bloquant */}
      {isLocalAdmin ? (
        <ActivationForm 
          type={type}
          schoolId={user.schoolId}
          onCancel={handleLogout}
          onSuccess={() => {
            if (type === "EXPIRED") user.isSubscriptionActive = true;
            if (type === "UNCONFIGURED") user.isSchoolConfigured = true;
            localStorage.setItem("user", JSON.stringify(user));
            setActivated(true);
          }}
          darkMode={isDark}
          lang={lang}
        />
      ) : (
        <div className="relative z-10 max-w-md w-full text-center p-8 bg-slate-900/40 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] shadow-2xl mx-4 animate-fade-in">
          <div className="w-20 h-20 bg-red-500/10 border border-red-400/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <ShieldAlert size={40} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-3">
            {type === "EXPIRED" ? t.expiredTitle : t.configTitle}
          </h1>

          <p className="text-slate-300 font-medium mb-6 text-sm leading-relaxed">
            {type === "EXPIRED" ? t.expiredText : t.configText}
          </p>

          <button 
            onClick={handleLogout}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> {t.btn}
          </button>
        </div>
      )}
    </div>
  );
};

export default SaaSBarrier;