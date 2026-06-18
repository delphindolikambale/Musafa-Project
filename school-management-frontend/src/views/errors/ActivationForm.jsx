import React, { useState } from "react";
import AuthService from "../../services/auth.service";
import { KeyRound, Loader2, CheckCircle2, XCircle } from "lucide-react";

// Dictionnaire de traduction intégré pour correspondre à la charte internationale de l'application
const translations = {
  FR: {
    titleExpired: "Renouvellement de l'Abonnement",
    titleConfig: "Activation de l'Établissement",
    subtitleExpired: "Espace Administration — Saisissez le code d'activation annuel fourni par MyAcademia pour rétablir les accès de l'école.",
    subtitleConfig: "Espace Administration — Votre établissement requiert un code de licence initial pour débloquer sa configuration sur la plateforme.",
    placeholder: "Code d'activation (ex: MUSAFA-XXXX-XXXX)",
    label: "Code Secret d'Activation (ROLE_ADMIN_SYSTEM)",
    submitBtn: "Valider l'activation",
    loadingBtn: "Vérification du code...",
    cancelBtn: "Déconnexion / Annuler",
    successTitle: "Activation Réussie !",
    successText: "Le code secret est valide. Les accès de l'établissement ont été configurés et restaurés avec succès.",
    errorTitle: "Échec de l'activation",
    errorText: "Code secret invalide, expiré ou déjà utilisé. Saisie refusée."
  },
  EN: {
    titleExpired: "Subscription Renewal",
    titleConfig: "Institution Activation",
    subtitleExpired: "Administration Panel — Enter the annual activation code provided by MyAcademia to restore school access.",
    subtitleConfig: "Administration Panel — Your institution requires an initial license code to unlock its configuration on the platform.",
    placeholder: "Activation code (e.g., MUSAFA-XXXX-XXXX)",
    label: "Secret Activation Code (ROLE_ADMIN_SYSTEM)",
    submitBtn: "Confirm Activation",
    loadingBtn: "Verifying code...",
    cancelBtn: "Log Out / Cancel",
    successTitle: "Activation Successful!",
    successText: "The secret code is valid. Institution access has been successfully configured and restored.",
    errorTitle: "Activation Failed",
    errorText: "Invalid, expired, or already used secret code. Action denied."
  }
};

const ActivationForm = ({ type, schoolId, onCancel, onSuccess, darkMode = true, lang = "FR" }) => {
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });

  const t = translations[lang] || translations["FR"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    setLoading(true);
    setNotification({ show: false, type: "", title: "", text: "" });

    try {
      await AuthService.activateSchool(schoolId, activationCode.trim());
      
      setNotification({
        show: true,
        type: "success",
        title: t.successTitle,
        text: t.successText
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", title: "", text: "" });
        onSuccess();
      }, 2500);

    } catch (error) {
      const serverMsg = error.response?.data?.message || t.errorText;
      setNotification({
        show: true,
        type: "error",
        title: t.errorTitle,
        text: serverMsg
      });
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-xl p-4 flex flex-col justify-center animate-fade-in">
      <div className={`rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-slate-800 text-white shadow-black/50" : "bg-white border-slate-200 text-slate-900"}`}>
        
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/5">
          <KeyRound size={32} className="text-blue-500 animate-pulse" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight mb-2">
            {type === "EXPIRED" ? t.titleExpired : t.titleConfig}
          </h2>
          <p className={`font-medium text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {type === "EXPIRED" ? t.subtitleExpired : t.subtitleConfig}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.label}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <KeyRound size={16} />
              </span>
              <input 
                type="text"
                placeholder={t.placeholder}
                className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl outline-none transition-all font-semibold text-xs tracking-wider uppercase ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] border ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
            >
              {t.cancelBtn}
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-900 hover:from-blue-700 hover:to-indigo-950 text-white shadow-xl shadow-blue-500/10"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> {t.loadingBtn}</> : t.submitBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Boîte de Notification Interne */}
      {notification.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm rounded-[2.5rem]">
          <div className={`max-w-sm w-full p-6 rounded-3xl border shadow-2xl text-center ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"}`}>
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4">
              {notification.type === "success" ? (
                <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
              ) : (
                <XCircle size={48} className="text-red-500 animate-bounce" />
              )}
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">{notification.title}</h3>
            <p className={`text-sm font-medium mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{notification.text}</p>
            {notification.type !== "success" && (
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationForm;