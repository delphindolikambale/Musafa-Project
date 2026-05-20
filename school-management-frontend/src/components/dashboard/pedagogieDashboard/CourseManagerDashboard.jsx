import React from 'react';
import { BookOpen, GraduationCap, TrendingUp, ShieldCheck } from 'lucide-react';

const CourseManagerDashboard = () => {
  return (
    <div className="space-y-4 mb-4">
      {/* Hero Banner Ultra-Compact */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[1.5rem] p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
        {/* Décoration discrète */}
        <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none hidden md:block">
          <BookOpen size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <GraduationCap size={24} className="text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                Configuration Pédagogique
              </h1>
              <p className="text-blue-100/80 text-[10px] md:text-xs max-w-xl line-clamp-1 md:line-clamp-none">
                Gérez le catalogue des matières et configurez la grille des cours par classe.
              </p>
            </div>
          </div>

          {/* Stats intégrées au Hero pour gagner de l'espace */}
          <div className="flex gap-3 border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Catalogue Actif</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Conformité OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagerDashboard;