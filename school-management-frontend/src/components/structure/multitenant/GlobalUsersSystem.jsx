import React, { useState, useEffect } from 'react';
import { Users, Building2, Eye, Search, ShieldCheck, UserCheck, X } from 'lucide-react';
import SuperAdminSystemService from '../../../services/multitenantService/SuperAdminSystemService';

const GlobalUsersSystem = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  
  // Simulation d'utilisateurs liés au tenant (Renvoyé normalement par un appel API dédié)
  const [tenantUsers, setTenantUsers] = useState([]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminSystemService.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUsers = (school) => {
    setSelectedSchool(school);
    
    // Simuler le chargement des utilisateurs spécifiques de cette école
    setTenantUsers([
      { id: 1, name: "Jean-Pierre Kabulo", email: "jp.kabulo@musafa.com", role: "ADMIN", active: true },
      { id: 2, name: "Marie Muhindo", email: "m.muhindo@musafa.com", role: "PROVISEUR", active: true },
      { id: 3, name: "David Paluku", email: "d.paluku@musafa.com", role: "CAISSIER", active: true },
      { id: 4, name: "Sarah Masika", email: "s.masika@musafa.com", role: "PREFET", active: false }
    ]);
    
    setShowUsersModal(true);
  };

  const filteredSchools = schools.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-white">
      {/* Head */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black">Utilisateurs Globaux par Tenant</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cartographie des comptes d'accès créés au sein des différents établissements.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Rechercher une entité..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Code</th>
                <th className="p-4">Nom de l'Établissement</th>
                <th className="p-4">Localisation</th>
                <th className="p-4 text-center">Statut Système</th>
                <th className="p-4 text-right">Comptes Utilisateurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Cartographie en cours...</td></tr>
              ) : filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-black text-xs"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{school.code}</span></td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{school.name}</td>
                  <td className="p-4 text-slate-500">{school.city}, {school.province}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${school.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                      {school.active ? 'Opérationnel' : 'Verrouillé'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenUsers(school)}
                      className="inline-flex items-center gap-1 text-xs font-black bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
                    >
                      <Eye size={14} /> Utilisateurs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : Liste des utilisateurs du tenant sélectionné */}
      {showUsersModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 rounded-2xl shadow-xl animate-scale-up flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2"><UserCheck className="text-blue-500" /> Comptes d'Accès Créés</h3>
                <p className="text-xs text-slate-400">Établissement autonome : <span className="font-bold text-slate-700 dark:text-slate-300">{selectedSchool.name}</span></p>
              </div>
              <button onClick={() => setShowUsersModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {tenantUsers.map((u) => (
                <div key={u.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm">{u.name}</h4>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-black tracking-wider uppercase">
                      {u.role}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-400'}`} title={u.active ? "Actif" : "Désactivé"}></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button onClick={() => setShowUsersModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold">
                Fermer la vue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalUsersSystem;