import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, ClipboardList, LayoutTemplate, PenTool, Layers } from 'lucide-react';
import EvaluationCarnetPage from './EvaluationCarnetPage';
import GradeSheetPage from './GradeSheetPage';

const ClassWorkspace = ({ assignment, activeYear, onBack }) => {
    const [currentSection, setCurrentSection] = useState('DASHBOARD'); // DASHBOARD, COURS, PLAN, CARNET_DE_NOTES, FICHE_DE_NOTES

    // Nettoyage de la tautologie sur le nom de la matière au niveau du Workspace principal
    const cleanedSubjectName = assignment?.subjectName && assignment?.classroomName
        ? assignment.subjectName
            .replace(assignment.classroomName, '')
            .replace(/\s*-\s*$/, '')
            .replace(/\s*\(\s*\)\s*$/, '')
            .trim()
        : assignment?.subjectName;

    // Rendu conditionnel des sous-interfaces professionnelles autonomes et hautement qualifiées
    if (currentSection === 'CARNET_DE_NOTES') {
        return (
            <EvaluationCarnetPage 
                assignment={assignment} 
                activeYear={activeYear} 
                onBack={() => setCurrentSection('DASHBOARD')} 
            />
        );
    }

    if (currentSection === 'FICHE_DE_NOTES') {
        return (
            <GradeSheetPage 
                assignment={assignment} 
                activeYear={activeYear} 
                onBack={() => setCurrentSection('DASHBOARD')} 
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header d'identification de la classe */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
                        title="Retour aux cours"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                            {assignment?.classroomName}
                        </span>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
                            {cleanedSubjectName || assignment?.subjectName}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Contenu principal : Tableau de bord interne ou Modules */}
            {currentSection === 'DASHBOARD' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Carte 1 : Carnet de Notes */}
                    <button
                        onClick={() => setCurrentSection('CARNET_DE_NOTES')}
                        className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                    >
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <PenTool size={20} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">
                                    Disponible
                                </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Carnet de Notes
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                                Saisissez les notes au quotidien, gérez vos évaluations et interrogations de la période.
                            </p>
                        </div>
                    </button>

                    {/* Carte 2 : Fiche de Notes */}
                    <button
                        onClick={() => setCurrentSection('FICHE_DE_NOTES')}
                        className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                    >
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <FileText size={20} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">
                                    Disponible
                                </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Fiche de Notes
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                                Consultez la grille matricielle globale des résultats, les totaux semestriels et synthèses de la classe.
                            </p>
                        </div>
                    </button>

                    {/* Carte 3 : Contenu de Cours */}
                    <button
                        onClick={() => setCurrentSection('COURS')}
                        className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                    >
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                    Bientôt
                                </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Contenu de Cours
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                                Préparez et organisez la matière théorique ainsi que les travaux pratiques.
                            </p>
                        </div>
                    </button>

                    {/* Carte 4 : Planification / Progression */}
                    <button
                        onClick={() => setCurrentSection('PLAN')}
                        className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                    >
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <LayoutTemplate size={20} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                    Bientôt
                                </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                Planification & Journal
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                                Suivez la progression des chapitres et gérez le journal de classe numérique.
                            </p>
                        </div>
                    </button>
                </div>
            ) : (
                /* Module de remplacement en attente (COURS / PLAN) */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 text-center max-w-2xl mx-auto shadow-sm animate-fade-in">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Layers size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Module de Planification</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                        Préparez et organisez la matière théorique ainsi que les travaux pratiques que vous allez dispenser pour la matière <strong className="text-slate-800 dark:text-white">{cleanedSubjectName || assignment?.subjectName}</strong>. Ce module sera bientôt disponible dans votre espace de travail.
                    </p>
                    <button
                        onClick={() => setCurrentSection('DASHBOARD')}
                        className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Retour au Tableau de bord
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClassWorkspace;