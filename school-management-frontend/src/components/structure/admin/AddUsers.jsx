import React, { useState } from "react";
import { UserPlus, X, Shield, Mail, Key, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import UserService from "../../../services/user.service";

const AddUsers = ({ isOpen, onClose, onUserAdded, rolesList }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "ROLE_ELEVE",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ text: "", type: "" });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ text: "", type: "" });

    try {
      // Configuration du payload attendu par votre backend Spring Boot
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roles: [formData.role],
      };

      // ✅ CORRECTION : Appel direct de la méthode de création du service (POST)
      await UserService.createUser(payload);

      setNotification({ text: "Utilisateur créé avec succès !", type: "success" });
      setFormData({ username: "", email: "", password: "", role: "ROLE_ELEVE" });
      
      // Rafraîchir la table après la création
      setTimeout(() => {
        onUserAdded();
        onClose();
        setNotification({ text: "", type: "" });
      }, 2000);
    } catch (error) {
      console.error(error);
      setNotification({ 
        text: error.response?.data || "Échec de la création de l'utilisateur.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <UserPlus className="text-indigo-600 dark:text-indigo-400" size={22} />
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Ajouter un utilisateur</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* NOTIFICATION INTERNE */}
        {notification.text && (
          <div className={`m-6 p-4 rounded-xl flex items-center gap-3 text-xs font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {notification.text}
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><UserPlus size={16} /></span>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Ex: jean_doe"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Adresse Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="adresse@ecole.com"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mot de passe</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Rôle initial</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Shield size={16} /></span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all cursor-pointer appearance-none"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r} className="dark:bg-slate-900">
                    {r.replace("ROLE_", "")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUsers;