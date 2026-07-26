import React, { useState } from 'react';
import { LayoutTemplate, Flag, ArrowLeft, Settings } from 'lucide-react';
import BulletinFormatForm from './BulletinFormatForm';
import BulletinHeaderForm from './BulletinHeaderForm';

const BulletinHomePage = () => {
    // État pour gérer la navigation interne : 'menu' (hub), 'header' (en-tête), 'format' (maquettes)
    const [activeView, setActiveView] = useState('menu');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            
            {/* VUE PRINCIPALE : LE HUB DE CONFIGURATION */}
            {activeView === 'menu' && (
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* En-tête du Hub */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60">
                        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Settings size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Paramètres des Bulletins
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Gérez l'identité visuelle de l'école et la structure d'évaluation.
                            </p>
                        </div>
                    </div>

                    {/* Cartes de navigation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Option 1 : En-tête Bulletin */}
                        <button 
                            onClick={() => setActiveView('header')}
                            className="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 overflow-hidden text-left w-full"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>
                            <div className="z-10 flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Flag size={40} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                        En-tête Bulletin RDC
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Configurez les logos, le drapeau et les textes officiels du Ministère.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Option 2 : Format / Structure */}
                        <button 
                            onClick={() => setActiveView('format')}
                            className="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 overflow-hidden text-left w-full"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>
                            <div className="z-10 flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <LayoutTemplate size={40} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                        Format Bulletin
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Choisissez la structure de grille (7ème, 8ème ou Humanités).
                                    </p>
                                </div>
                            </div>
                        </button>

                    </div>
                </div>
            )}

            {/* VUE : CONFIGURATION DU FORMAT */}
            {activeView === 'format' && (
                <div className="animate-fadeIn">
                    <button 
                        onClick={() => setActiveView('menu')}
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all"
                    >
                        <ArrowLeft size={16} /> Retour au menu
                    </button>
                    <BulletinFormatForm />
                </div>
            )}

            {/* VUE : CONFIGURATION DE L'EN-TÊTE */}
            {activeView === 'header' && (
                <div className="animate-fadeIn">
                    <button 
                        onClick={() => setActiveView('menu')}
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all"
                    >
                        <ArrowLeft size={16} /> Retour au menu
                    </button>
                    <BulletinHeaderForm />
                </div>
            )}

        </div>
    );
};

export default BulletinHomePage;