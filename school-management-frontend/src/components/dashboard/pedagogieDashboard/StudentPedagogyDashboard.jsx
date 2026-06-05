import React, { useContext } from "react";
import { GraduationCap, Calendar, CheckCircle, ArrowUpRight, Clock, FileText } from "lucide-react";
import { LanguageContext } from "../../../App";

const StudentPedagogyDashboard = () => {
  const { language } = useContext(LanguageContext);

  const stats = [
    { 
      label: language === "FR" ? "Moyenne Annuelle" : "Annual Grade Average", 
      value: "74.2%", 
      icon: <GraduationCap />, 
      color: "from-blue-600 to-indigo-600" 
    },
    { 
      label: language === "FR" ? "Taux de Présence" : "Attendance Rate", 
      value: "96%", 
      icon: <CheckCircle />, 
      color: "from-emerald-500 to-teal-600" 
    },
    { 
      label: language === "FR" ? "TP en Attente" : "Pending Assignments", 
      value: "03", 
      icon: <FileText />, 
      color: "from-orange-500 to-red-600" 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* BIENVENUE SECTION (Image_6a7b45.jpg) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight">
            {language === "FR" ? "Content de vous revoir !" : "Welcome back!"}
          </h1>
          <p className="text-indigo-200 max-w-md text-sm lg:text-base font-medium opacity-90 leading-relaxed">
            {language === "FR" 
              ? "Consultez vos horaires d'examens et n'oubliez pas de remettre vos TP avant l'échéance." 
              : "Check your exam schedule and remember to submit your assignments before the deadline."}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 -skew-x-12 transform translate-x-10 pointer-events-none"></div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}>
              {React.cloneElement(stat.icon, { size: 26 })}
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* HORAIRE & BULLETIN PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PROCHAINS COURS */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> {language === "FR" ? "Horaire du jour" : "Today's Schedule"}
            </h2>
            <button className="text-blue-600 text-xs font-black uppercase hover:underline">
              {language === "FR" ? "Voir tout" : "View all"}
            </button>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm italic border dark:border-slate-700">08:00</div>
                  <div>
                    <h4 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">Mathématiques</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Local 102 • Prof. Kasereka</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* DERNIERS RÉSULTATS */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="text-emerald-500" size={18} /> {language === "FR" ? "Résultats Récents" : "Recent Grades"}
            </h2>
            <button className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase hover:underline">
              {language === "FR" ? "Télécharger" : "Download"}
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b dark:border-slate-800">
                  <th className="pb-3">{language === "FR" ? "Branche" : "Subject"}</th>
                  <th className="pb-3">Période 1</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-slate-700 dark:text-slate-300">
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="py-4 font-black text-slate-800 dark:text-white uppercase tracking-wide">Informatique de Gestion</td>
                  <td className="py-4 font-black text-blue-600 dark:text-blue-400">18/20</td>
                  <td className="py-4"><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase">{language === "FR" ? "Réussi" : "Passed"}</span></td>
                </tr>
                <tr>
                  <td className="py-4 font-black text-slate-800 dark:text-white uppercase tracking-wide">Anglais Technique</td>
                  <td className="py-4 font-black text-blue-600 dark:text-blue-400">14/20</td>
                  <td className="py-4"><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase">{language === "FR" ? "Réussi" : "Passed"}</span></td>
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