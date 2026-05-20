import React from 'react';
import { Edit, Trash2, Plus, Settings2, AlertCircle, BookOpen } from 'lucide-react';

const ActionButton = ({ onClick, icon: Icon, label, colorClass, iconSize = 14 }) => (
  <div className="group/tip relative flex justify-center items-center">
    <button 
      onClick={onClick} 
      className={`p-2 rounded-lg transition-all ${colorClass}`}
    >
      <Icon size={iconSize}/>
    </button>
    <span className="absolute bottom-full mb-2 hidden group-hover/tip:block bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
      {label}
    </span>
  </div>
);

const CourseGridDisplay = ({ 
  hierarchyTree, isLoading, 
  onAddDomain, onEditDomain, onDeleteDomain,
  onAddSubDomain, onEditSubDomain, onDeleteSubDomain,
  onAddCourse, onEditCourse, onDeleteCourse,
  onConfigureMaxima,
  isPrinting = false // Nouvelle prop
}) => {

  if (isLoading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse text-slate-400 font-black text-xs uppercase tracking-widest">Chargement de la structure...</p>
      </div>
    );
  }

  if (hierarchyTree.length === 0) {
    return (
      <div className="p-8 sm:p-16 text-center bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4">
        <AlertCircle size={48} className="text-slate-200" />
        <p className="text-slate-500 font-bold text-sm sm:text-base">Aucune configuration trouvée pour cette classe.</p>
        {!isPrinting && (
          <button onClick={onAddDomain} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">Créer un Domaine</button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white ${isPrinting ? '' : 'rounded-[2rem] shadow-2xl border border-slate-100'} overflow-hidden w-full`}>
      <div className="overflow-x-auto custom-scrollbar w-full">
        <table className={`w-full text-left border-collapse ${isPrinting ? 'min-w-full' : 'min-w-[1200px]'}`}>
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[25%]">Structure Pédagogique</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-slate-400 uppercase">P1</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-slate-400 uppercase">P2</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-blue-600 uppercase bg-blue-50/50">Ex 1</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-indigo-600 uppercase bg-indigo-50/50">Total S1</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-slate-400 uppercase">P3</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-slate-400 uppercase">P4</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-blue-600 uppercase bg-blue-50/50">Ex 2</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-indigo-600 uppercase bg-indigo-50/50">Total S2</th>
              <th className="px-3 py-5 text-center text-[10px] font-black text-emerald-600 uppercase bg-emerald-50/50">Total Gén..</th>
              {!isPrinting && <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase w-[12%]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {hierarchyTree.map((domain) => (
              <React.Fragment key={`dom-${domain.id}`}>
                <tr className={`${isPrinting ? 'bg-slate-800' : 'bg-slate-900'} text-white group`}>
                  <td className="px-8 py-3">
                    {/* Structure modifiée pour inclure la spécialité sous le nom du domaine */}
                    <div className="flex flex-col gap-1.5">
                      <div className="text-xs font-black uppercase flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div> 
                        <span>{domain.name}</span>
                      </div>
                      {domain.requiredSpecialityName && (
                        <div className="pl-5 flex items-center">
                          <span className="px-2 py-0.5 bg-slate-800 text-blue-300 text-[9px] rounded uppercase tracking-widest font-bold border border-slate-700/50">
                            Spécialité : {domain.requiredSpecialityName}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td colSpan={isPrinting ? 9 : 9}></td> 
                  {!isPrinting && (
                    <td className="px-8 py-4 align-middle">
                      <div className="flex justify-end gap-1.5 transition-all">
                        <ActionButton 
                          onClick={() => onAddCourse(domain, null)} 
                          icon={BookOpen} 
                          label="Ajouter Cours Direct" 
                          colorClass="bg-blue-600 hover:bg-blue-700"
                        />
                        <ActionButton 
                          onClick={() => onAddSubDomain(domain)} 
                          icon={Plus} 
                          label="Nouveau Sous-Domaine" 
                          colorClass="bg-white/10 hover:bg-blue-500"
                        />
                        <ActionButton 
                          onClick={() => onEditDomain(domain)} 
                          icon={Edit} 
                          label="Modifier Domaine" 
                          colorClass="bg-white/10 hover:bg-amber-500"
                        />
                        <ActionButton 
                          onClick={() => onDeleteDomain(domain.id)} 
                          icon={Trash2} 
                          label="Supprimer" 
                          colorClass="bg-white/10 hover:bg-red-500"
                        />
                      </div>
                    </td>
                  )}
                </tr>

                {domain.subDomains.map((subDomain) => {
                  const isTechnicalSubDomain = subDomain.name.trim().toLowerCase() === domain.name.trim().toLowerCase();
                  
                  return (
                    <React.Fragment key={`sub-${subDomain.id}`}>
                      {!isTechnicalSubDomain && (
                        <tr className="bg-slate-100/80 border-b border-slate-200 group">
                          <td className="px-12 py-3 text-[11px] font-bold text-slate-600 uppercase italic flex items-center gap-2 whitespace-nowrap">
                            <div className="w-4 h-[1px] bg-slate-400"></div> <span>{subDomain.name}</span>
                          </td>
                          <td className="px-3 py-3 text-center text-xs font-black text-slate-700">{subDomain.totals.p1}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-slate-700">{subDomain.totals.p2}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-blue-600 bg-blue-100/30">{subDomain.totals.ex1}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-indigo-600 bg-indigo-100/30">{subDomain.totals.s1}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-slate-700">{subDomain.totals.p3}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-slate-700">{subDomain.totals.p4}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-blue-600 bg-blue-100/30">{subDomain.totals.ex2}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-indigo-600 bg-indigo-100/30">{subDomain.totals.s2}</td>
                          <td className="px-3 py-3 text-center text-xs font-black text-emerald-600 bg-emerald-100/30">{subDomain.totals.totalGen}</td>
                          {!isPrinting && (
                            <td className="px-8 py-2">
                              <div className="flex justify-end gap-1.5 transition-all">
                                <ActionButton 
                                  onClick={() => onAddCourse(domain, subDomain)} 
                                  icon={Plus} 
                                  label="Ajouter un Cours" 
                                  colorClass="text-blue-600 hover:bg-blue-100"
                                  iconSize={13}
                                />
                                <ActionButton 
                                  onClick={() => onEditSubDomain(subDomain)} 
                                  icon={Edit} 
                                  label="Éditer Sous-Domaine" 
                                  colorClass="text-slate-500 hover:bg-slate-200"
                                  iconSize={13}
                                />
                                <ActionButton 
                                  onClick={() => onDeleteSubDomain(subDomain.id)} 
                                  icon={Trash2} 
                                  label="Supprimer" 
                                  colorClass="text-red-400 hover:bg-red-100"
                                  iconSize={13}
                                />
                              </div>
                            </td>
                          )}
                        </tr>
                      )}

                      {subDomain.subjects.map((course) => (
                        <tr key={`crs-${course.id}`} className="hover:bg-blue-50/30 transition-colors group border-b border-slate-50">
                          <td className={`${isTechnicalSubDomain ? 'px-12' : 'px-16'} py-3.5 text-sm font-semibold text-slate-700 flex items-center gap-2 whitespace-nowrap`}>
                             <div className={`w-1 h-1 ${isTechnicalSubDomain ? 'bg-blue-400' : 'bg-slate-300'} rounded-full`}></div> 
                             <span className={isTechnicalSubDomain ? 'font-bold text-slate-800' : ''}>{course.name}</span>
                          </td>
                          {course.assignment ? (
                            <>
                              <td className="px-3 py-3.5 text-center text-sm font-bold text-slate-600">{course.assignment.maxP1}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-bold text-slate-600">{course.assignment.maxP2}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-black text-blue-700 bg-blue-50/30">{course.assignment.maxExam1}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-black text-indigo-700 bg-indigo-50/30">{course.assignment.maxS1}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-bold text-slate-600">{course.assignment.maxP3}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-bold text-slate-600">{course.assignment.maxP4}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-black text-blue-700 bg-blue-50/30">{course.assignment.maxExam2}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-black text-indigo-700 bg-indigo-50/30">{course.assignment.maxS2}</td>
                              <td className="px-3 py-3.5 text-center text-sm font-black text-emerald-700 bg-emerald-50/30">{course.assignment.maxTotal}</td>
                            </>
                          ) : (
                            <td colSpan={9} className="px-3 py-3.5 text-center text-[10px] font-bold text-amber-500 bg-amber-50/30 uppercase tracking-widest">Non configuré</td>
                          )}
                          {!isPrinting && (
                            <td className="px-8 py-3.5">
                              <div className="flex justify-end gap-1.5 transition-all">
                                <ActionButton 
                                  onClick={() => onConfigureMaxima(course)} 
                                  icon={Settings2} 
                                  label="Configurer Maxima" 
                                  colorClass="text-white bg-blue-500 hover:bg-blue-600 shadow-md"
                                />
                                <ActionButton 
                                  onClick={() => onEditCourse(course, domain, subDomain)} 
                                  icon={Edit} 
                                  label="Modifier Libellé" 
                                  colorClass="text-slate-500 hover:bg-slate-100"
                                />
                                <ActionButton 
                                  onClick={() => onDeleteCourse(course.id)} 
                                  icon={Trash2} 
                                  label="Supprimer" 
                                  colorClass="text-red-500 hover:bg-red-50"
                                />
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseGridDisplay;