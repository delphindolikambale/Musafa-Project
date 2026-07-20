import React from 'react';
import { Plus, Trash2, Clock, Edit2 } from 'lucide-react';

const DAYS = [
  { key: 'LUNDI', label: 'Lundi' },
  { key: 'MARDI', label: 'Mardi' },
  { key: 'MERCREDI', label: 'Mercredi' },
  { key: 'JEUDI', label: 'Jeudi' },
  { key: 'VENDREDI', label: 'Vendredi' },
  { key: 'SAMEDI', label: 'Samedi' }
];

const ScheduleCalendar = ({ 
  scheduleData, 
  onCellClick, 
  onDeleteSlot, 
  onEditSlot, 
  hours, 
  onAddHourRequest,
  isReadOnly = false // ✅ AJOUT : Mode lecture seule (par défaut à false pour le gestionnaire)
}) => {

  const getSlotData = (dayKey, hourSlotId) => {
    return scheduleData.find(slot => slot.dayOfWeek === dayKey && slot.hourSlotId === hourSlotId);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* En-tête des jours */}
        <div className="grid grid-cols-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl mb-2 transition-colors shadow-lg border border-blue-900/30">
          <div className="p-4 text-[10px] font-black text-blue-200/70 uppercase tracking-widest text-center border-r border-blue-800/40">
            N°
          </div>
          <div className="p-4 text-[10px] font-black text-blue-200/70 uppercase tracking-widest text-center border-r border-blue-800/40">
            Heures
          </div>
          {DAYS.map(day => (
            <div key={day.key} className="p-4 text-[10px] font-black text-blue-100 uppercase tracking-widest text-center">
              {day.label}
            </div>
          ))}
        </div>

        {/* Lignes du tableau */}
        {hours && hours.length > 0 ? (
          hours.map((hour, index) => (
            <div key={hour.id} className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800/50 last:border-none transition-colors">
              
              {/* Colonne : Numéro d'ordre du créneau */}
              <div className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 text-center bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center border-r border-slate-50 dark:border-slate-800">
                {hour.slotNumber || (index + 1)}
              </div>

              {/* Colonne des heures */}
              <div className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 text-center bg-slate-50/10 dark:bg-slate-800/10 flex items-center justify-center border-r border-slate-50 dark:border-slate-800 italic">
                {hour.label}
              </div>
              
              {/* Les jours de la semaine */}
              {DAYS.map((day) => {
                const slotContent = getSlotData(day.key, hour.id);

                return (
                  <div key={`${day.key}-${hour.id}`} className="p-2 min-h-[120px] relative group transition-all">
                    {slotContent ? (
                      // CELLULE REMPLIE : Thème Bleu de Nuit
                      <div className="h-full w-full bg-gradient-to-br from-slate-800 to-blue-950 border border-blue-900/50 rounded-xl p-3 text-white shadow-md relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black text-blue-200 uppercase opacity-90">{slotContent.subjectCode || ''}</p>
                          
                          {/* ✅ MODIFICATION : On affiche les boutons d'édition uniquement si NON read-only */}
                          {!isReadOnly && (
                            <div className="flex items-center gap-2 z-10">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEditSlot(slotContent); }}
                                className="text-white/50 hover:text-blue-300 transition-colors"
                                title="Modifier ce cours"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSlot(slotContent.id); }}
                                className="text-white/50 hover:text-red-400 transition-colors"
                                title="Supprimer ce cours"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[12px] font-bold mt-1 text-blue-50 leading-tight line-clamp-2">{slotContent.subjectName}</p>
                        
                        <p className="text-[10px] font-black mt-3 uppercase tracking-tighter text-blue-300 flex flex-col">
                          <span>{slotContent.teacherFullName || slotContent.teacherName || 'Enseignant inconnu'}</span>
                          {slotContent.teacherMatricule && (
                            <span className="text-[9px] opacity-60 font-semibold mt-0.5 tracking-wider text-blue-200">
                              ID: {slotContent.teacherMatricule}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : (
                      // CELLULE VIDE
                      isReadOnly ? (
                        // ✅ MODIFICATION : Mode lecture seule -> Cellule vide neutre, sans hover, sans clic
                        <div className="h-full w-full border border-dashed border-slate-100 dark:border-slate-800/30 rounded-xl flex items-center justify-center bg-slate-50/10 dark:bg-slate-800/10 opacity-40">
                        </div>
                      ) : (
                        // Mode Gestionnaire -> Cellule cliquable pour ajouter un cours
                        <div 
                          onClick={() => onCellClick(day.key, hour.id, hour.slotNumber || (index + 1), hour.label)}
                          className="h-full w-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800/5 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                        >
                          <Plus size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // ÉTAT VIDE
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mt-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full mb-4">
              <Clock size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune tranche horaire configurée</h4>
            
            {isReadOnly ? (
              // ✅ MODIFICATION : Message pour l'élève si l'école n'a pas encore configuré les heures
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
                Votre emploi du temps n'est pas encore disponible. La direction n'a pas encore configuré les horaires de cours.
              </p>
            ) : (
              // Message et bouton pour le gestionnaire
              <>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
                  Pour commencer à programmer des cours dans la grille, vous devez d'abord définir les heures de cours de votre établissement.
                </p>
                <button
                  onClick={onAddHourRequest}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  <Plus size={16} /> Créer ma première heure de cours
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;