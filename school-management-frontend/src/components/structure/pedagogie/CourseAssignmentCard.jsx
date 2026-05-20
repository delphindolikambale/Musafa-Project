import React from 'react';
import { User, UserPlus, Trash2, Clock, ShieldCheck, Star, Pencil } from 'lucide-react';

const CourseAssignmentCard = ({ courseConfig, assignment, onAssign, onUnassign, onEdit }) => {
    const isAssigned = !!assignment;

    return (
        <div className={`group rounded-[2rem] p-6 border transition-all duration-500 flex flex-col h-full relative ${
            isAssigned 
            ? 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100' 
            : 'bg-slate-50/50 border-dashed border-slate-200 hover:border-blue-200'
        }`}>

            {/* Badge de Domaine & Points Totaux */}
            <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest w-fit break-words ${
                        isAssigned ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {courseConfig.domainName || 'GÉNÉRAL'}
                    </div>
                    {courseConfig.subDomainName && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter px-1 leading-tight">
                            {courseConfig.subDomainName}
                        </span>
                    )}
                </div>
                
                <div className="text-right shrink-0 bg-slate-50 px-3 py-1 rounded-2xl border border-slate-100">
                    <p className={`text-lg font-black leading-none ${isAssigned ? 'text-slate-800' : 'text-slate-300'}`}>
                        {courseConfig.maxTotal}
                    </p>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Pts Max</span>
                </div>
            </div>

            {/* Titre du cours */}
            <h4 className={`font-black text-base mb-4 leading-tight h-10 line-clamp-2 ${isAssigned ? 'text-slate-800' : 'text-slate-500'}`} title={courseConfig.subjectName}>
                {courseConfig.subjectName}
            </h4>
            
            {/* Grille d'affichage des Maxima */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="grid grid-cols-2 gap-1 bg-slate-50/80 rounded-xl p-1.5 border border-slate-100">
                    <div className="flex flex-col items-center justify-center border-r border-slate-200">
                        <span className="text-[7px] text-slate-400 font-bold uppercase">P1</span>
                        <span className="text-[11px] font-black text-slate-700">{courseConfig.maxP1}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[7px] text-slate-400 font-bold uppercase">P2</span>
                        <span className="text-[11px] font-black text-slate-700">{courseConfig.maxP2}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-blue-50/50 rounded-xl p-1.5 border border-blue-50">
                    <div className="flex flex-col items-center justify-center border-r border-blue-100">
                        <span className="text-[7px] text-blue-400 font-bold uppercase">EX1</span>
                        <span className="text-[11px] font-black text-blue-700">{courseConfig.maxExam1}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[7px] text-blue-400 font-bold uppercase">S1</span>
                        <span className="text-[11px] font-black text-blue-700">{courseConfig.maxS1}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-slate-50/80 rounded-xl p-1.5 border border-slate-100">
                    <div className="flex flex-col items-center justify-center border-r border-slate-200">
                        <span className="text-[7px] text-slate-400 font-bold uppercase">P3</span>
                        <span className="text-[11px] font-black text-slate-700">{courseConfig.maxP3}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[7px] text-slate-400 font-bold uppercase">P4</span>
                        <span className="text-[11px] font-black text-slate-700">{courseConfig.maxP4}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-blue-50/50 rounded-xl p-1.5 border border-blue-50">
                    <div className="flex flex-col items-center justify-center border-r border-blue-100">
                        <span className="text-[7px] text-blue-400 font-bold uppercase">EX2</span>
                        <span className="text-[11px] font-black text-blue-700">{courseConfig.maxExam2}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[7px] text-blue-400 font-bold uppercase">S2</span>
                        <span className="text-[11px] font-black text-blue-700">{courseConfig.maxS2}</span>
                    </div>
                </div>
            </div>

            {/* NOUVEAU : Barre d'actions (Modifier / Supprimer) placée sous les maxima */}
            {isAssigned && (
                <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <button 
                        onClick={() => onEdit(courseConfig, assignment)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-blue-600 shadow-sm"
                    >
                        <Pencil size={12} /> Modifier
                    </button>
                    <button 
                        onClick={() => onUnassign(assignment.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all border border-slate-100 hover:border-red-500 shadow-sm"
                        title="Supprimer l'affectation"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
            
            <div className="mt-auto pt-5 border-t border-slate-100">
                {isAssigned ? (
                    <div className="flex items-center gap-4">
                        {/* Avatar / Icon */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                            <User size={20} />
                        </div>

                        {/* Info Enseignant - Maintenant sur toute la largeur restante */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest shrink-0">Enseignant</p>
                                {assignment.isClassMaster && (
                                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[7px] font-black uppercase shrink-0">
                                        <Star size={7} className="fill-amber-700" /> Titulaire
                                    </div>
                                )}
                            </div>
                            {/* Suppression du truncate pour que le nom soit pleinement visible */}
                            <p className="text-[13px] font-black text-slate-800 leading-tight break-words" title={assignment.teacherFullName}>
                                {assignment.teacherFullName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock size={10}/> {assignment.weeklyHours}h / semaine
                            </p>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => onAssign(courseConfig)}
                        className="w-full py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        <UserPlus size={16} /> Affecter un enseignant
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseAssignmentCard;