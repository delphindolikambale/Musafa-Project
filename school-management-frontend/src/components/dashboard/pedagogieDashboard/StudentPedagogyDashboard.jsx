import React from "react";
import { GraduationCap, Calendar, FileText, CheckCircle, ArrowUpRight, Clock } from "lucide-react";

const StudentPedagogyDashboard = () => {
  const stats = [
    { label: "Moyenne Annuelle", value: "74.2%", icon: <GraduationCap />, color: "from-indigo-600 to-blue-600" },
    { label: "Taux de Présence", value: "96%", icon: <CheckCircle />, color: "from-emerald-500 to-teal-600" },
    { label: "TP en Attente", value: "03", icon: <FileText />, color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* BIENVENUE SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-5xl font-black mb-4">Content de vous revoir !</h1>
          <p className="text-indigo-200 max-w-md text-lg opacity-90">Consultez vos horaires d'examens et n'oubliez pas de remettre vos TP avant l'échéance.</p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 -skew-x-12 transform translate-x-10"></div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {React.cloneElement(stat.icon, { size: 28 })}
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* HORAIRE & BULLETIN PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prochains Cours */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-black text-slate-800 flex items-center gap-2"><Clock className="text-indigo-600" /> Horaire du jour</h2>
            <button className="text-indigo-600 text-sm font-bold hover:underline">Voir l'horaire complet</button>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="text-xs font-black text-indigo-600 bg-white px-3 py-2 rounded-lg shadow-sm italic">08:00</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Mathématiques</h4>
                    <p className="text-xs text-slate-500 font-medium">Local 102 • Prof. Kasereka</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Derniers Résultats */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-black text-slate-800 flex items-center gap-2"><GraduationCap className="text-emerald-500" /> Résultats Récents</h2>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Télécharger Bulletin</button>
          </div>
          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="pb-4">Branche</th>
                  <th className="pb-4">Période 1</th>
                  <th className="pb-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-50">
                  <td className="py-4 font-bold text-slate-700">Informatique de Gestion</td>
                  <td className="py-4 font-black text-indigo-600">18/20</td>
                  <td className="py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Réussi</span></td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-slate-700">Anglais Technique</td>
                  <td className="py-4 font-black text-indigo-600">14/20</td>
                  <td className="py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Réussi</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPedagogyDashboard;