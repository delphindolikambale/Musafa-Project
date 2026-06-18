import React from 'react';
import { Building2, Activity, AlertCircle, Users } from 'lucide-react';

const SuperAdminSystemDashboard = () => {
  const stats = [
    { title: "Écoles Abonnées", value: "0", icon: <Building2 size={24} />, color: "from-blue-500 to-blue-700" },
    { title: "Écoles Actives", value: "0", icon: <Activity size={24} />, color: "from-emerald-500 to-emerald-700" },
    { title: "Utilisateurs Globaux", value: "0", icon: <Users size={24} />, color: "from-orange-500 to-orange-700" },
    { title: "Abonnements Expirés", value: "0", icon: <AlertCircle size={24} />, color: "from-red-500 to-red-700" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Vue Globale SaaS</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Supervision de l'ensemble des établissements connectés.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                <h3 className="text-4xl font-black text-slate-800 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder pour les graphiques futurs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <Activity size={32} className="text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Activité Réseau (À venir)</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">L'historique des connexions et la consommation des ressources par établissement s'afficheront ici prochainement.</p>
      </div>
    </div>
  );
};

export default SuperAdminSystemDashboard;