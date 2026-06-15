import React from 'react';
import { X, User, Clock, BookOpen, BarChart2 } from 'lucide-react';

const MyStudentCourseModal = ({ isOpen, onClose, course }) => {
    if (!isOpen || !course) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            {/* Conteneur principal avec hauteur maximale pour éviter le débordement sur mobile */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                
                {/* En-tête du Modal (Reste fixe) */}
                <div className="bg-gradient-to-r from-emerald-600 to-slate-900 dark:from-emerald-500 dark:to-slate-900 p-6 text-white relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        title="Fermer"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 pr-8">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <BookOpen size={32} />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{course.name}</h2>
                            <p className="text-emerald-100/80 text-sm font-medium mt-1">Détails de l'affectation pédagogique</p>
                        </div>
                    </div>
                </div>

                {/* Corps du Modal (Scrollable sur mobile) */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                    {/* Infos Principales : Enseignant & Heures */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                <User size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Enseignant Titulaire</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 truncate">{course.teacherFullName || 'Non attribué'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Volume Horaire</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{course.weeklyHours || 0} h / semaine</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Maxima */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart2 className="text-orange-500" size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Configuration des Maxima
                            </h3>
                        </div>
                        
                        {/* Grille détaillée des Périodes et Examens */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                            {[ 
                                { label: 'P1', val: course.maxP1, color: 'slate' },
                                { label: 'P2', val: course.maxP2, color: 'slate' },
                                { label: 'EXAM 1', val: course.maxExam1, color: 'blue' },
                                { label: 'P3', val: course.maxP3, color: 'slate' },
                                { label: 'P4', val: course.maxP4, color: 'slate' },
                                { label: 'EXAM 2', val: course.maxExam2, color: 'blue' }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-2 sm:p-3 rounded-xl border text-center ${
                                    item.color === 'blue' 
                                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' 
                                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50'
                                }`}>
                                    <p className={`text-[9px] sm:text-[10px] font-bold ${item.color === 'blue' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {item.label}
                                    </p>
                                    <p className={`text-base sm:text-lg font-mono font-black mt-0.5 ${item.color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.val || 0}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Synthèse des Totaux */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total S1</p>
                                <p className="text-xl font-mono font-black text-slate-800 dark:text-white mt-1">{course.maxS1 || 0}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total S2</p>
                                <p className="text-xl font-mono font-black text-slate-800 dark:text-white mt-1">{course.maxS2 || 0}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl border border-emerald-400 shadow-md text-center text-white relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2">
                                    <BarChart2 size={60} />
                                </div>
                                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest relative z-10">Total Général</p>
                                <p className="text-2xl font-mono font-black text-white mt-1 relative z-10">{course.maxTotal || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyStudentCourseModal;