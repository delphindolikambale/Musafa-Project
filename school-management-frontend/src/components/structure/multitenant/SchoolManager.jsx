import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, CheckCircle2, XCircle, ShieldCheck, Mail, Key } from 'lucide-react';
import Swal from 'sweetalert2'; // ✅ NÉCESSITE: npm install sweetalert2
import api from '../../../services/api'; // Appel direct à votre intercepteur configuré

const SchoolManager = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // ✅ ADAPTATION : Ajout de 'contactEmail' dans l'état initial
  const [formData, setFormData] = useState({ name: "", code: "", province: "", city: "", contactEmail: "" });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      // ✅ Appel à l'API protégée par le rôle SuperAdminSystem
      const response = await api.get('/system-admin/schools');
      setSchools(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des écoles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/system-admin/schools', formData);
      setSchools([...schools, response.data]);
      setShowForm(false);
      
      // ✅ ADAPTATION : Notification complète affichant les accès générés
      const schoolCode = response.data.code.toLowerCase();
      const defaultUsername = `admin_${schoolCode}`;
      const defaultPassword = `Admin@${response.data.code.toUpperCase()}2026!`;

      Swal.fire({
        title: "Établissement Enregistré !",
        html: `
          <div class="text-left p-3">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
              <p class="text-sm text-blue-800 font-semibold mb-2">Un compte Administrateur a été généré automatiquement :</p>
              <ul class="list-none space-y-1 text-sm text-blue-900">
                <li><strong>Utilisateur :</strong> <span class="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">${defaultUsername}</span></li>
                <li><strong>Mot de passe :</strong> <span class="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">${defaultPassword}</span></li>
              </ul>
            </div>
            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <p class="text-sm text-amber-800 font-semibold">⚠️ Étape suivante requise :</p>
              <p class="text-xs text-amber-700 mt-1">L'école est actuellement bloquée. Rendez-vous dans l'onglet <strong>Abonnements</strong> pour enregistrer le paiement initial et générer la clé de licence d'activation.</p>
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "J'ai compris",
        confirmButtonColor: "#059669",
        width: '32em'
      });

      // Réinitialisation incluant le champ email
      setFormData({ name: "", code: "", province: "", city: "", contactEmail: "" });
    } catch (error) {
      Swal.fire({
        title: "Erreur",
        text: error.response?.data?.message || error.response?.data?.error || error.message,
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  const toggleSchoolStatus = async (id, currentStatus) => {
    try {
      const response = await api.put(`/system-admin/schools/${id}/toggle?active=${!currentStatus}`);
      setSchools(schools.map(s => s.id === id ? response.data : s));
    } catch (error) {
      console.error("Erreur toggle statut:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Gestion des Écoles</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ajoutez et administrez les établissements clients.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {showForm ? <XCircle size={18} /> : <Plus size={18} />}
          {showForm ? "Annuler" : "Nouvelle École"}
        </button>
      </div>

      {/* Formulaire de création conditionnel */}
      {showForm && (
        <form onSubmit={handleCreateSchool} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={20} /> Enregistrer un nouvel établissement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom Complet</label>
              <input type="text" required placeholder="Ex: C.S. Musafa" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Code Court (10 max)</label>
              <input type="text" required maxLength={10} placeholder="Ex: CSM" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-white" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email de l'Administrateur</label>
              <input type="email" required placeholder="Ex: admin@csmusafa.com" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-white" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Province</label>
              <input type="text" placeholder="Ex: Nord-Kivu" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-white" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ville</label>
              <input type="text" placeholder="Ex: Goma" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors">
              Sauvegarder l'école
            </button>
          </div>
        </form>
      )}

      {/* Liste des Écoles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white">Établissements Enregistrés</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Nom & Code</th>
                <th className="p-4 font-bold">Contact & Accès</th>
                <th className="p-4 font-bold">Localisation</th>
                <th className="p-4 font-bold text-center">Statut</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Chargement des données...</td></tr>
              ) : schools.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aucune école enregistrée pour le moment.</td></tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{school.name}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                        Code: {school.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                          <Mail size={12} /> {school.contactEmail || 'Non renseigné'}
                        </div>
                        {/* ✅ ADAPTATION : Le code d'activation s'affiche avec un style d'alerte s'il existe et que l'école n'est pas encore active */}
                        {school.activationCode ? (
                          <div className={`flex items-center gap-1.5 font-mono text-xs font-bold mt-1 px-2 py-1 rounded ${school.currentSubscriptionStatus === 'EN_ATTENTE_ACTIVATION' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'text-slate-500'}`}>
                            <Key size={12} /> Clé: {school.activationCode}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs italic mt-1">
                            <Key size={12} /> Paiement en attente
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{school.city}, {school.province}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${school.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {school.active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {school.active ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleSchoolStatus(school.id, school.active)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${school.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:hover:bg-orange-900/30' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/30'}`}
                      >
                        {school.active ? 'Suspendre' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchoolManager;