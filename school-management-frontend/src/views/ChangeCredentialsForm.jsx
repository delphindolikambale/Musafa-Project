import React, { useState } from "react";
import axios from "axios";
import { BACKEND_BASE } from "../services/api"; // Assurez-vous que le chemin vers api.js est correct
import { UserPlus, Lock, Loader2, ArrowRight, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

const translations = {
  FR: {
    title: "Configuration de sécurité requise",
    subtitle: "Avant de continuer, vous devez personnaliser vos identifiants d'administration initiaux.",
    newUserLabel: "Nouveau nom d'utilisateur",
    newPassLabel: "Nouveau mot de passe",
    confirmPassLabel: "Confirmer le mot de passe",
    submitBtn: "Enregistrer mes accès",
    loadingBtn: "Mise à jour...",
    successTitle: "Mise à jour réussie !",
    successText: "Vos identifiants ont été mis à jour avec succès. Veuillez vous reconnecter.",
    errorTitle: "Échec de la mise à jour",
    passMismatch: "Les deux mots de passe ne correspondent pas.",
    cancelBtn: "Déconnexion"
  },
  EN: {
    title: "Security Configuration Required",
    subtitle: "Before continuing, you must personalize your initial administration credentials.",
    newUserLabel: "New Username",
    newPassLabel: "New Password",
    confirmPassLabel: "Confirm Password",
    submitBtn: "Save my credentials",
    loadingBtn: "Updating...",
    successTitle: "Update Successful!",
    successText: "Your credentials have been updated successfully. Please log in again.",
    errorTitle: "Update Failed",
    passMismatch: "The two passwords do not match.",
    cancelBtn: "Logout"
  }
};

const ChangeCredentialsForm = ({ currentUsername, onCancel, onSuccess, darkMode = true, lang = "FR" }) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", title: "", text: "" });

  const t = translations[lang] || translations["FR"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setNotification({ show: true, type: "error", title: t.errorTitle, text: t.passMismatch });
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: "", title: "", text: "" });

    try {
      // ✅ Appel direct à l'endpoint que nous avons créé dans le backend
      const response = await axios.post(`${BACKEND_BASE}/api/auth/change-credentials`, {
        currentUsername: currentUsername,
        newUsername: newUsername,
        newPassword: newPassword
      });

      setNotification({
        show: true,
        type: "success",
        title: t.successTitle,
        text: response.data.message || t.successText
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", title: "", text: "" });
        onSuccess();
      }, 3000);

    } catch (error) {
      const serverMsg = error.response?.data?.error || error.response?.data?.message || "Erreur de connexion au serveur.";
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
    <div className="relative z-10 w-full max-w-md p-4 flex flex-col justify-center animate-fade-in mx-auto">
      <div className={`rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border transition-all duration-300 ${darkMode ? "bg-slate-900/95 border-orange-500/30 text-white shadow-black/50" : "bg-white border-orange-200 text-slate-900"}`}>
        
        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-orange-500/5 mx-auto">
          <ShieldAlert size={32} className="text-orange-500" />
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-black tracking-tight mb-2">{t.title}</h2>
          <p className={`font-medium text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.newUserLabel}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <UserPlus size={16} />
              </span>
              <input 
                type="text"
                placeholder="Nouveau nom d'utilisateur"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-orange-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-orange-500 focus:bg-white text-slate-800"}`}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.newPassLabel}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-orange-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-orange-500 focus:bg-white text-slate-800"}`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {t.confirmPassLabel}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-sm ${darkMode ? "bg-slate-950/50 border-slate-800 focus:border-orange-500 focus:bg-slate-950 text-white" : "bg-slate-50 border-slate-200 focus:border-orange-500 focus:bg-white text-slate-800"}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
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
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl shadow-orange-500/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>{t.submitBtn} <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      {notification.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md rounded-[2.5rem]">
          <div className={`max-w-xs w-full p-6 rounded-3xl border shadow-2xl text-center ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"}`}>
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
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
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

export default ChangeCredentialsForm;