import React from 'react';
import { Plus, Trash2, Clock, Edit2 } from 'lucide-react';

const DAYS = [
  { key: 'LUNDI', label: 'LUNDI' },
  { key: 'MARDI', label: 'MARDI' },
  { key: 'MERCREDI', label: 'MERCREDI' },
  { key: 'JEUDI', label: 'JEUDI' },
  { key: 'VENDREDI', label: 'VENDREDI' },
  { key: 'SAMEDI', label: 'SAMEDI' }
];

const ScheduleCalendar = ({ 
  scheduleData = [], 
  onCellClick, 
  onDeleteSlot, 
  onEditSlot, 
  hours = [], 
  onAddHourRequest,
  onEditHour,
  onDeleteHour,
  isReadOnly = false,
  variant = 'proviseur' // 'proviseur' | 'teacher'
}) => {

  // Recherche du cours pour un jour et un créneau donné
  const getSlotData = (dayKey, hourSlotId) => {
    return scheduleData.find(slot => slot.dayOfWeek === dayKey && slot.hourSlotId === hourSlotId);
  };

  // Nom de l'enseignant
  const getTeacherDisplayName = (slot) => {
    if (slot.teacherName) return slot.teacherName;
    if (slot.teacherFullName) return slot.teacherFullName;
    if (slot.teacherFirstName || slot.teacherLastName) {
      return `${slot.teacherFirstName || ''} ${slot.teacherLastName || ''}`.trim();
    }
    return '';
  };

  // Matricule de l'enseignant (Remplace le simple ID de la BD)
  const getTeacherMatriculeDisplay = (slot) => {
    const matricule = slot.teacherMatricule || slot.teacherRegistrationNumber || slot.teacherCode;
    if (matricule) {
      return `MAT: ${matricule}`;
    }
    // Fallback si pas de matricule disponible
    if (slot.teacherId) return `ID: ${slot.teacherId}`;
    return '';
  };

  // =========================================================================
  // RENDU 1 : MODE ENSEIGNANT (Vue Enseignant)
  // =========================================================================
  if (variant === 'teacher') {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {hours && hours.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0f172a] text-white border-b border-slate-800">
                  <th rowSpan="2" className="p-3 text-xs font-black uppercase tracking-wider text-center border-r border-slate-800 w-28">
                    HEURE
                  </th>
                  <th colSpan="12" className="p-2 text-xs font-black uppercase tracking-widest text-center border-b border-slate-800 text-blue-200">
                    JOURS & CLASSES
                  </th>
                </tr>
                <tr className="bg-[#0f172a] text-blue-100 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  {DAYS.map(day => (
                    <React.Fragment key={day.key}>
                      <th className="p-2.5 text-center border-r border-slate-800 w-[11%]">
                        {day.label}
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-800 text-blue-400 bg-blue-950/40 w-[5%]">
                        CLASSE
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {hours.map((hour, index) => (
                  <tr key={hour.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* Colonne Tranche Horaire */}
                    <td className="p-3 text-center font-bold bg-slate-50/80 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800">
                      <div className="font-black text-slate-800 dark:text-slate-200">
                        {hour.slotNumber || (index + 1)}ᵉ heure
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                        {hour.label}
                      </div>
                    </td>

                    {/* Jours et Classes Jumelés */}
                    {DAYS.map((day) => {
                      const slot = getSlotData(day.key, hour.id);

                      return (
                        <React.Fragment key={`${day.key}-${hour.id}`}>
                          {/* Colonne Matière */}
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center font-extrabold text-blue-700 dark:text-blue-300">
                            {slot ? (
                              <span className="font-black text-[11px] uppercase tracking-wide">
                                {slot.subjectCode || slot.subjectName}
                              </span>
                            ) : null}
                          </td>

                          {/* Colonne Classe */}
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold bg-slate-50/30 dark:bg-slate-800/20">
                            {slot?.classroomName ? (
                              <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-[10px] px-2 py-1 rounded font-black border border-blue-200 dark:border-blue-800/50">
                                {slot.classroomName}
                              </span>
                            ) : null}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Clock size={32} className="text-blue-600 mb-2" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune heure de cours configurée</h4>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDU 2 : MODE PROVISEUR / CONFIGURATION (Inclus du Lundi au Samedi)
  // =========================================================================
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1100px]">
        {hours && hours.length > 0 ? (
          <table className="w-full border-collapse text-left rounded-2xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-[#0f172a] text-white text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 text-center w-14 border-r border-slate-800">N°</th>
                <th className="p-3.5 text-center w-44 border-r border-slate-800">HEURES</th>
                {DAYS.map(day => (
                  <th key={day.key} className="p-3.5 text-center border-r border-slate-800">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs bg-white dark:bg-slate-900">
              {hours.map((hour, index) => (
                <tr key={hour.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  
                  {/* Numéro de tranche */}
                  <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                    {hour.slotNumber || (index + 1)}
                  </td>

                  {/* Horaire + Boutons d'édition et suppression de l'heure */}
                  <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 group relative">
                    <div className="flex items-center justify-between px-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400 italic text-[11px] mx-auto">
                        {hour.label}
                      </span>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditHour && (
                            <button
                              onClick={() => onEditHour(hour)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Modifier la tranche horaire"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {onDeleteHour && (
                            <button
                              onClick={() => onDeleteHour(hour.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Supprimer la tranche horaire"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Cases par jour de la semaine (Lundi -> Samedi) */}
                  {DAYS.map(day => {
                    const slot = getSlotData(day.key, hour.id);
                    const teacherName = slot ? getTeacherDisplayName(slot) : '';
                    const teacherMatricule = slot ? getTeacherMatriculeDisplay(slot) : '';

                    return (
                      <td key={`${day.key}-${hour.id}`} className="p-2 border-r border-slate-100 dark:border-slate-800 text-center align-middle">
                        {slot ? (
                          /* Carte Sombre du cours programmé */
                          <div className="bg-[#1e293b] text-white p-3 rounded-2xl text-left relative shadow-md border border-slate-700/50 group">
                            {/* Boutons d'action sur le cours */}
                            {!isReadOnly && (
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                {onEditSlot && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onEditSlot(slot); }}
                                    className="p-1 text-slate-300 hover:text-white transition-colors"
                                    title="Modifier le cours"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                )}
                                {onDeleteSlot && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteSlot(slot.id); }}
                                    className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                                    title="Supprimer le cours"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Nom de la matière */}
                            <h5 className="font-extrabold text-xs text-white pr-8 leading-snug">
                              {slot.subjectName || slot.subjectCode}
                            </h5>

                            {/* Enseignant */}
                            {teacherName && (
                              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wide mt-1.5 leading-tight">
                                {teacherName}
                              </p>
                            )}

                            {/* Matricule de l'Enseignant (Affichage MAT au lieu de ID) */}
                            {teacherMatricule && (
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                {teacherMatricule}
                              </p>
                            )}
                          </div>
                        ) : (
                          /* Case vide pointillée avec bouton + */
                          !isReadOnly && onCellClick && (
                            <button
                              onClick={() => onCellClick(day.key, hour.id, hour.slotNumber || (index + 1), hour.label)}
                              className="w-full h-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-300 hover:text-blue-600 transition-all group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Clock size={32} className="text-blue-600 mb-2" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune tranche horaire définie</h4>
            {!isReadOnly && onAddHourRequest && (
              <button
                onClick={onAddHourRequest}
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus size={16} /> Ajouter une tranche horaire
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;