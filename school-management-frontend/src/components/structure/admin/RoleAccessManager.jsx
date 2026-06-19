import React, { useState, useEffect } from "react";
import { Shield, Search, Save, CheckCircle, AlertCircle, Loader2, KeyRound, Link as LinkIcon, UserPlus, Trash2, HelpCircle } from "lucide-react";
import UserService from "../../../services/user.service";
import api from "../../../services/api";
import AddUsers from "./AddUsers"; // ✅ INCLUSION DU NOUVEAU COMPOSANT EN TOUTE SÉCURITÉ

const RoleAccessManager = () => {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [pendingChanges, setPendingChanges] = useState({}); 
  
  // Contrôle de l'état d'ouverture de notre modale externe
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Équipement de la boîte de dialogue informative/confirmation globale
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "info", // info, success, danger
    title: "",
    message: "",
    onConfirm: null
  });

  const rolesList = [
    "ROLE_ELEVE", "ROLE_ENSEIGNANT", "ROLE_CAISSIER", "ROLE_COMPTABLE", 
    "ROLE_PROVISEUR", "ROLE_PREFET", "ROLE_ADMIN_BUDGET", "ROLE_ADMIN_SYSTEM"
  ];

  useEffect(() => {
    fetchUsers();
    fetchActiveTeachers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      setUsers(response.data);
      loading && setLoading(false);
    } catch (error) {
      setMessage({ text: "Erreur de connexion au serveur.", type: "error" });
      setLoading(false);
    }
  };

  const fetchActiveTeachers = async () => {
    try {
      const response = await api.get("/teachers/active");
      setTeachers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des enseignants", error);
    }
  };

  const handleLocalChange = (userId, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  // Déclencheur informatif pour l'action d'enregistrement
  const triggerSaveConfirm = (userId) => {
    setDialog({
      isOpen: true,
      type: "info",
      title: "Confirmer les modifications",
      message: "Êtes-vous sûr de vouloir enregistrer les modifications apportées aux accès de cet utilisateur ?",
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        await handleSave(userId);
      }
    });
  };

  const handleSave = async (userId) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    try {
      const payload = {};
      if (changes.role) payload.roles = [changes.role];
      if (changes.password) payload.password = changes.password;
      if (changes.teacherId !== undefined) payload.teacherId = changes.teacherId;

      await UserService.updateUser(userId, payload);
      
      setMessage({ text: "Mise à jour et liaison réussies !", type: "success" });
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchUsers(); 
      fetchActiveTeachers(); 
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "Échec de l'enregistrement.", type: "error" });
    }
  };

  // Déclencheur informatif pour l'action de suppression
  const triggerDeleteConfirm = (userId, username) => {
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Suppression définitive",
      message: `Êtes-vous absolument sûr de vouloir supprimer définitivement l'utilisateur "${username}" ? Cette action est irréversible.`,
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        await handleDelete(userId);
      }
    });
  };

  const handleDelete = async (userId) => {
    try {
      await UserService.deleteUser(userId);
      setMessage({ text: "Utilisateur supprimé avec succès !", type: "success" });
      fetchUsers();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "Erreur lors de la suppression de l'utilisateur.", type: "error" });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* HEADER AVEC INTEGRATION DU BOUTON RESPONSIVE */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-emerald-400" size={28} />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Rôles & Accès</h1>
            </div>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Gestion dynamique des accès. Modifiez les rôles, associez les comptes aux fiches du personnel ou réinitialisez les mots de passe.
            </p>
          </div>

          {/* SECTION RECHERCHE & BOUTON ACTION */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-64 xl:w-72">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></span>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
            >
              <UserPlus size={18} />
              <span>Ajouter Utilisateur</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOX DE DIALOGUE INFORMATIVE DE RETOUR IMMÉDIAT */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-pulse shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* TABLEAU COMPATIBLE THÈME SOMBRE ET 100% RESPONSIVE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black">
                <th className="p-6">Utilisateur</th>
                <th className="p-6">Email</th>
                <th className="p-6">Nouveau Mot de Passe</th>
                <th className="p-6 text-right">Rôle & Liaison / Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 dark:text-indigo-400" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => {
                const currentRole = pendingChanges[user.id]?.role || user.roles?.[0]?.name || "ROLE_ELEVE";
                const isModified = pendingChanges[user.id];

                const existingTeacherId = user.teacherId || teachers.find(t => t.user?.id === user.id || t.userId === user.id)?.id || "";
                const currentTeacherId = pendingChanges[user.id]?.teacherId !== undefined 
                  ? pendingChanges[user.id].teacherId 
                  : (existingTeacherId || "");

                return (
                  <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-all group">
                    <td className="p-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black">
                          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-6 text-slate-500 dark:text-slate-400 whitespace-nowrap">{user.email}</td>
                    <td className="p-6">
                      <div className="relative min-w-[140px] max-w-[180px]">
                        <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="password"
                          placeholder="Modifier..."
                          value={pendingChanges[user.id]?.password || ""}
                          onChange={(e) => handleLocalChange(user.id, "password", e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <select 
                            value={currentRole}
                            onChange={(e) => handleLocalChange(user.id, "role", e.target.value)}
                            className={`text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-lg border-2 outline-none appearance-none cursor-pointer transition-all
                              ${currentRole === 'ROLE_ADMIN_SYSTEM' 
                                ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-400' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                          >
                            {rolesList.map(r => <option key={r} value={r} className="dark:bg-slate-900">{r.replace("ROLE_", "")}</option>)}
                          </select>
                          
                          <button 
                            onClick={() => triggerSaveConfirm(user.id)}
                            disabled={!isModified}
                            className={`p-2 rounded-lg transition-all ${isModified ? 'bg-indigo-600 text-white shadow-lg hover:scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                          >
                            <Save size={18} />
                          </button>

                          <button 
                            onClick={() => triggerDeleteConfirm(user.id, user.username)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* AFFAIRE LIAISON PROF COMPATIBLE DARK MODE */}
                        {currentRole === 'ROLE_ENSEIGNANT' && (
                          <div className="flex items-center gap-2 mt-1 w-full max-w-[250px]">
                            <LinkIcon size={12} className={currentTeacherId ? "text-emerald-500" : "text-slate-400"} />
                            <select
                              value={currentTeacherId}
                              onChange={(e) => handleLocalChange(user.id, "teacherId", e.target.value)}
                              className={`text-[10px] uppercase font-bold py-1.5 px-2 rounded-md border w-full outline-none transition-all
                                ${currentTeacherId 
                                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                            >
                              <option value="" className="dark:bg-slate-900">-- Lier à une fiche prof --</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id} className="dark:bg-slate-900">
                                  {t.firstName} {t.lastName} ({t.schoolRegistrationNumber})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE INJECTÉE AVEC LA LISTE DES RÔLES ET LE DÉCLENCHEUR DE RECHARGEMENT */}
      <AddUsers 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onUserAdded={fetchUsers} 
        rolesList={rolesList} 
      />

      {/* MODAL RESPONSIVE EXCLUSIF DE DIALOGUE ET DE CONFIRMATION DE SÉCURITÉ */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center transform transition-all scale-100 duration-200">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${dialog.type === 'danger' ? 'bg-red-50 dark:bg-red-950/30 text-red-500' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'}`}>
                {dialog.type === 'danger' ? <Trash2 size={28} /> : <HelpCircle size={28} />}
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
              {dialog.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                className="w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Annuler
              </button>
              <button
                onClick={dialog.onConfirm}
                className={`w-1/2 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  dialog.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/10' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleAccessManager;