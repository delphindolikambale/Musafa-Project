import React, { useState } from "react";
import SuperAdminSystemService from "../../services/multitenantService/SuperAdminSystemService"; 
import { KeyRound, Building2, Loader2, CheckCircle2, XCircle } from "lucide-react";

const translations = {
  FR: {
    titleExpired: "Renouvellement de l'Abonnement",
    titleConfig: "Activation de l'Établissement",
    subtitleExpired: "Espace Administration — Saisissez le code de votre établissement et le code d'activation annuel fourni par MyAcademia pour rétablir les accès.",
    subtitleConfig: "Espace Administration — Saisissez le code de votre établissement et le code de licence initial pour débloquer sa configuration sur la plateforme.",
    schoolCodePlaceholder: "Code de l'établissement (ex: CSM)",
    schoolCodeLabel: "Identifiant de l'École",
    activationPlaceholder: "Code d'activation (ex: ACT-XXXX-XXXX)",
    activationLabel: "Code Secret d'Activation",
    submitBtn: "Valider l'activation",
    loadingBtn: "Vérification en cours...",
    cancelBtn: "Déconnexion / Annuler",
    successTitle: "Activation Réussie !",
    successText: "Le code secret est valide. Les accès de l'établissement ont été configurés et restaurés avec succès.",
    errorTitle: "Échec de l'activation",
    errorText: "Informations invalides, expirées ou déjà utilisées. Saisie refusée."
  },
  EN: {
    titleExpired: "Subscription Renewal",
    titleConfig: "Institution Activation",
    subtitleExpired: "Administration Panel — Enter your institution code and the annual activation code provided by MyAcademia to restore access.",
    subtitleConfig: "Administration Panel — Enter your institution code and the initial license code to unlock its configuration on the platform.",
    schoolCodePlaceholder: "Institution code (e.g., CSM)",
    schoolCodeLabel: "School Identifier",
    activationPlaceholder: "Activation code (e.g., ACT-XXXX-XXXX)",
    activationLabel: "Secret Activation Code",
    submitBtn: "Confirm Activation",
    loadingBtn: "Verifying...",
    cancelBtn: "Log Out / Cancel",
    successTitle: "Activation Successful!",
    successText: "The secret code is valid. Institution access has been successfully configured and restored.",
    errorTitle: "Activation Failed",
    errorText: "Invalid, expired, or already used information. Action denied."
  }
};

const ActivationForm = ({ type, onCancel, onSuccess, darkMode = true, lang = "FR" }) => {
  // ✅ NOUVEAU : Ajout de l'état pour capturer le code de l'école directement via le formulaire
  const [schoolCode, setSchoolCode] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });

  const t = translations[lang] || translations["FR"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activationCode.trim() || !schoolCode.trim()) return;

    setLoading(true);
    setNotification({ show: false, type: "", title: "", text: "" });

    try {
      // Appel du service en utilisant les valeurs saisies dans le formulaire
      await SuperAdminSystemService.activateSchool(schoolCode.trim(), activationCode.trim());
      
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
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.error || t.errorText;
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
    <div className="relative z-10 w-full max-w-xl p-4 flex flex-col justify-center animate-fade-in mx-auto">
      <div className={`rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-slate-800 text-white shadow-black/50" : "bg-white border-slate-200 text-slate-900"}`}>
        
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/5 mx-auto">
          <KeyRound size={32} className="text-blue-500 animate-pulse" />
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">
            {type === "EXPIRED" ? t.titleExpired : t.titleConfig}
          </h2>
          <p className={`font-medium text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {type === "EXPIRED" ? t.subtitleExpired : t.subtitleConfig}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ✅ NOUVEAU : Champ pour le Code de l'établissement */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.schoolCodeLabel}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Building2 size={16} />
              </span>
              <input 
                type="text"
                placeholder={t.schoolCodePlaceholder}
                className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl outline-none transition-all font-semibold text-xs tracking-wider uppercase ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800"}`}
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Champ pour le Code d'Activation */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.activationLabel}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <KeyRound size={16} />
              </span>
              <input 
                type="text"
                placeholder={t.activationPlaceholder}
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