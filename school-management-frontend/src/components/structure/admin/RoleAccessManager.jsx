import React, { useState, useEffect } from "react";
import { Shield, User, Search, Save, CheckCircle, AlertCircle, Loader2, KeyRound, Link as LinkIcon } from "lucide-react";
import UserService from "../../../services/user.service";
// ✅ CORRECTION : On importe ton instance api au lieu d'axios classique
import api from "../../../services/api";

const RoleAccessManager = () => {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]); // Liste des enseignants physiques
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [pendingChanges, setPendingChanges] = useState({}); 

  const rolesList = [
    "ROLE_ELEVE", "ROLE_ENSEIGNANT", "ROLE_CAISSIER", "ROLE_COMPTABLE", 
    "ROLE_PROVISEUR", "ROLE_PREFET", "ROLE_ADMIN_BUDGET", "ROLE_ADMIN_SYSTEM"
  ];

  useEffect(() => {
    fetchUsers();
    fetchActiveTeachers(); // Chargement des enseignants au montage
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setMessage({ text: "Erreur de connexion au serveur.", type: "error" });
      setLoading(false);
    }
  };

  // Récupération des enseignants actifs depuis l'API
  const fetchActiveTeachers = async () => {
    try {
      // ✅ CORRECTION : Utilisation de l'instance 'api' qui gère déjà l'URL de base et le token
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

  const handleSave = async (userId) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    try {
      const payload = {};
      if (changes.role) payload.roles = [changes.role];
      if (changes.password) payload.password = changes.password;
      if (changes.teacherId !== undefined) payload.teacherId = changes.teacherId; // Envoi de l'ID pour la liaison

      await UserService.updateUser(userId, payload);
      
      setMessage({ text: "Mise à jour et liaison réussies !", type: "success" });
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchUsers(); 
      fetchActiveTeachers(); // Rafraîchir également la liste des enseignants pour mettre à jour les liaisons
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "Échec de l'enregistrement.", type: "error" });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-emerald-400" size={28} />
              <h1 className="text-3xl font-black tracking-tight">Rôles & Accès</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Gestion dynamique des accès. Modifiez les rôles, associez les comptes aux fiches du personnel ou réinitialisez les mots de passe.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></span>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-bounce ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                <th className="p-6">Utilisateur</th>
                <th className="p-6">Email</th>
                <th className="p-6">Nouveau Mot de Passe</th>
                <th className="p-6 text-right">Rôle & Liaison</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
              ) : filteredUsers.map((user) => {
                const currentRole = pendingChanges[user.id]?.role || user.roles?.[0]?.name || "ROLE_ELEVE";
                const isModified = pendingChanges[user.id];

                // RECHERCHE DE LA LIAISON EXISTANTE DURCIE
                // On utilise en priorité l'ID fourni nativement par le backend, sinon on effectue une recherche de secours
                const existingTeacherId = user.teacherId || teachers.find(t => t.user?.id === user.id || t.userId === user.id)?.id || "";
                
                // Détermination de la valeur sélectionnée (modifications en cours > liaison existante en base > vide)
                const currentTeacherId = pendingChanges[user.id]?.teacherId !== undefined 
                  ? pendingChanges[user.id].teacherId 
                  : (existingTeacherId || "");

                return (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="font-bold text-slate-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-6 text-slate-500">{user.email}</td>
                    <td className="p-6">
                      <div className="relative max-w-[150px]">
                        <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="password"
                          placeholder="Modifier..."
                          value={pendingChanges[user.id]?.password || ""}
                          onChange={(e) => handleLocalChange(user.id, "password", e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          <select 
                            value={currentRole}
                            onChange={(e) => handleLocalChange(user.id, "role", e.target.value)}
                            className={`text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-lg border-2 outline-none appearance-none cursor-pointer
                              ${currentRole === 'ROLE_ADMIN_SYSTEM' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                          >
                            {rolesList.map(r => <option key={r} value={r}>{r.replace("ROLE_", "")}</option>)}
                          </select>
                          
                          <button 
                            onClick={() => handleSave(user.id)}
                            disabled={!isModified}
                            className={`p-2 rounded-lg transition-all ${isModified ? 'bg-indigo-600 text-white shadow-lg hover:scale-110' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                            <Save size={18} />
                          </button>
                        </div>

                        {/* Affichage du select si le rôle est ENSEIGNANT */}
                        {currentRole === 'ROLE_ENSEIGNANT' && (
                          <div className="flex items-center gap-2 mt-1 w-full max-w-[250px]">
                            <LinkIcon size={12} className={currentTeacherId ? "text-emerald-500" : "text-slate-400"} />
                            <select
                              value={currentTeacherId}
                              onChange={(e) => handleLocalChange(user.id, "teacherId", e.target.value)}
                              className={`text-[10px] uppercase font-bold py-1.5 px-2 rounded-md border w-full outline-none transition-all
                                ${currentTeacherId 
                                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 focus:border-emerald-500" 
                                  : "border-slate-200 bg-slate-50 text-slate-600 focus:border-indigo-500"
                                }`}
                            >
                              <option value="">-- Lier à une fiche prof --</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>
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
    </div>
  );
};

export default RoleAccessManager;