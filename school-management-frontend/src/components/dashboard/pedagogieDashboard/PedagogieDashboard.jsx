import React from 'react';
import { Users, BookOpen, Clock, Activity, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>{icon}</div>
      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black">
        <ArrowUpRight size={12} /> {trend}
      </div>
    </div>
    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);

const PedagogieDashboard = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Vue d'ensemble Pédagogique</h1>
          <p className="text-slate-400 font-bold text-sm mt-1">Gérez le capital intellectuel de l'établissement.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Semaine Actuelle</span>
          <span className="text-sm font-bold text-blue-600">Semaine du 20 au 26 Avril 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Enseignants Actifs" value="48" icon={<Users />} color="bg-gradient-to-br from-blue-600 to-blue-400" trend="+2.4%" />
        <StatCard title="Cours Disponibles" value="124" icon={<BookOpen />} color="bg-gradient-to-br from-indigo-600 to-indigo-400" trend="+5.1%" />
        <StatCard title="Heures Prestations" value="340h" icon={<Clock />} color="bg-gradient-to-br from-violet-600 to-violet-400" trend="+1.2%" />
        <StatCard title="Taux de Présence" value="96.8%" icon={<Activity />} color="bg-gradient-to-br from-emerald-600 to-emerald-400" trend="+0.5%" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Performance des Enseignants</h3>
          <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold italic">
            [ Graphique de Performance Analytique ]
          </div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Dernières Alertes</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <div className="w-2 h-10 bg-orange-500 rounded-full" />
                <div>
                  <p className="text-sm font-black text-slate-800">Absence non justifiée</p>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase italic">M. Jean-Paul (Physique)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedagogieDashboard;