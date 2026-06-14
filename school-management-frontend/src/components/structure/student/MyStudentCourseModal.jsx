import React from 'react';
import { X, User, Clock, Award, BookOpen, Layers, BarChart2 } from 'lucide-react';

const MyStudentCourseModal = ({ isOpen, onClose, course }) => {
    if (!isOpen || !course) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                {/* En-tête du Modal */}
                <div className="bg-gradient-to-r from-emerald-600 to-slate-900 p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{course.name}</h2>
                            <p className="text-emerald-100/80 text-sm">Détails de l'affectation pédagogique</p>
                        </div>
                    </div>
                </div>

                {/* Corps du Modal */}
                <div className="p-6 space-y-6">
                    {/* Infos Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <User className="text-emerald-500" size={20} />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Enseignant</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{course.teacherFullName || 'Non attribué'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <Clock className="text-blue-500" size={20} />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Volume Horaire</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{course.weeklyHours} h / semaine</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Maxima */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart2 className="text-orange-500" size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Configuration des Maxima</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {[ 
                                { label: 'P1', val: course.maxP1 },
                                { label: 'P2', val: course.maxP2 },
                                { label: 'Ex. 1', val: course.maxExam1 },
                                { label: 'P3', val: course.maxP3 },
                                { label: 'P4', val: course.maxP4 },
                                { label: 'Ex. 2', val: course.maxExam2 }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold">{item.label}</p>
                                    <p className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Totaux */}
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Total S1</p>
                                <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">{course.maxS1}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Total S2</p>
                                <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">{course.maxS2}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">TOTAL GÉN.</p>
                                <p className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-300">{course.maxTotal}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyStudentCourseModal;