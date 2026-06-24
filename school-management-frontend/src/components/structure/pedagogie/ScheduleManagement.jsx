import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, Printer, Filter, ChevronLeft, ChevronRight, Plus, Table } from 'lucide-react';
import GrilleHoraireCursus from './GrilleHoraireCursus';

const ScheduleManagement = () => {
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' ou 'grille'
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const hours = ['08h00', '10h00', '12h00', '14h00', '16h00'];

  // Vue Grille Horaire Officielle
  if (currentView === 'grille') {
    return <GrilleHoraireCursus onBack={() => setCurrentView('calendar')} />;
  }

  // Vue par défaut (Calendrier)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl shadow-inner">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des Horaires</h2>
            <div className="flex items-center gap-4 mt-2">
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Semaine du 20 Avril 2026</span>
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setCurrentView('grille')}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
          >
            <Table size={18} /> Grille Horaire
          </button>
          <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all">
            <Printer size={18} /> Imprimer
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Grille de l'emploi du temps */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden p-2 transition-colors">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-2 transition-colors">
              <div className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center border-r border-slate-100 dark:border-slate-800">Heures</div>
              {days.map(day => (
                <div key={day} className="p-4 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-center">{day}</div>
              ))}
            </div>

            {hours.map((time, i) => (
              <div key={i} className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800/50 last:border-none transition-colors">
                <div className="p-6 text-xs font-black text-slate-400 dark:text-slate-500 text-center bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-center border-r border-slate-50 dark:border-slate-800 italic">{time}</div>
                {days.map((_, j) => (
                  <div key={j} className="p-2 min-h-[120px] group cursor-pointer hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all relative">
                    {(i === 0 && j === 0) || (i === 2 && j === 3) ? (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 text-white shadow-md">
                        <p className="text-[9px] font-black uppercase opacity-70">MATH101</p>
                        <p className="text-[11px] font-bold mt-1 leading-tight">Calcul Intégral</p>
                        <p className="text-[9px] mt-2 font-medium opacity-80">Local: Salle 04</p>
                        <p className="text-[9px] font-black mt-1 uppercase tracking-tighter">M. Vianney</p>
                      </div>
                    ) : (
                      <div className="h-full w-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                        <Plus size={14} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-300 dark:group-hover:text-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;