import React, { useState } from 'react';
import { LayoutTemplate, CheckCircle2, ShieldAlert, Printer } from 'lucide-react';
import StudentBulletinPrint from './StudentBulletinPrint';

// Données fictives pour l'étudiant
const mockStudentInfo = {
    firstName: "Jean",
    lastName: "Kasongo",
    classLevel: "7ème",
    schoolYear: "2025 - 2026",
    permanentNumber: "012345678912345",
    section: "Éducation de Base",
    option: "Générale"
};

// Données fictives pour les bulletins selon le format sélectionné
const mockBulletins = {
    '7eme_eb': {
        formatType: '7EME_EB',
        domains: [
            { 
                name: 'Domaine des Sciences', 
                subjects: [
                    { name: 'Mathématiques', max: 50, firstPeriod: 40, secondPeriod: 45, exam: 80 }
                ] 
            }
        ],
        results: {}
    },
    '8eme_eb': {
        formatType: '8EME_EB',
        domains: [
            { 
                name: 'Domaine des Sciences', 
                subjects: [
                    { name: 'Mathématiques', max: 50, firstPeriod: 42, secondPeriod: 38, exam: 75 }
                ] 
            }
        ],
        results: {}
    },
    'humanites': {
        formatType: 'HUMANITES',
        domains: [
            { 
                name: 'Cours Généraux', 
                subjects: [
                    { name: 'Français', max: 50, firstPeriod: 35, secondPeriod: 40, exam: 70 }
                ] 
            }
        ],
        results: {}
    }
};

const BulletinFormatForm = () => {
    const [selectedFormat, setSelectedFormat] = useState('7eme_eb');
    const [selectedLevel, setSelectedLevel] = useState('tous');

    const formatsVisuels = [
        {
            id: '7eme_eb',
            title: "Format 7ème Année (EB)",
            description: "Grille officielle Éducation de Base. Regroupement par Domaines (Sciences, Langues, Développement Humain, Arts) selon la maquette terminale.",
            level: "education_base",
            badge: "Éducation de Base"
        },
        {
            id: '8eme_eb',
            title: "Format 8ème Année (EB)",
            description: "Structure Éducation de Base comprenant les synthèses d'orientation et la colonne certifiée pour le test national TENASOSP.",
            level: "education_base",
            badge: "Éducation de Base"
        },
        {
            id: 'humanites',
            title: "Format Humanités (3e à 6e)",
            description: "Structure standardisée du Secondaire. Répartition stricte avec lignes de Maxima transversales en tête de chaque section de cours.",
            level: "secondaire",
            badge: "Humanités"
        }
    ];

    const filteredFormats = selectedLevel === 'tous' 
        ? formatsVisuels 
        : formatsVisuels.filter(f => f.level === selectedLevel);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Format enregistré définitivement :", selectedFormat);
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8">
                
                {/* EN-TÊTE DE LA PAGE */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <LayoutTemplate size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Configuration des Maquettes
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Sélectionnez le modèle d'impression officiel pour l'établissement.
                            </p>
                        </div>
                    </div>

                    {/* FILTRE DE NIVEAUX */}
                    <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 self-start md:self-center">
                        {['tous', 'education_base', 'secondaire'].map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => setSelectedLevel(lvl)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                    selectedLevel === lvl
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {lvl === 'tous' ? 'Tous' : lvl === 'education_base' ? 'Éduc. Base' : 'Humanités'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SÉLECTEUR DE FORMAT (BOUTONS) */}
                <div className="flex flex-wrap gap-3 print:hidden">
                    {filteredFormats.map((format) => {
                        const isSelected = selectedFormat === format.id;
                        return (
                            <button
                                key={format.id}
                                type="button"
                                onClick={() => setSelectedFormat(format.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
                                    isSelected
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {isSelected && <CheckCircle2 size={16} className="text-emerald-500" />}
                                {format.title}
                            </button>
                        );
                    })}
                </div>

                {/* BLOC D'APERÇU DU RENDU REEL A4 (Mis à jour en temps réel) */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between print:hidden">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aperçu Réel Format National (A4) - {formatsVisuels.find(f => f.id === selectedFormat)?.title}
                        </span>
                    </div>
                    <div className="p-4 sm:p-8 bg-slate-100 dark:bg-slate-900/40 flex justify-center overflow-x-auto">
                        <div className="transform scale-[0.95] origin-top transition-all duration-300">
                            <StudentBulletinPrint 
                                bulletinData={mockBulletins[selectedFormat]} 
                                studentInfo={mockStudentInfo}
                            />
                        </div>
                    </div>
                </div>

                {/* ALERTES ET ACTIONS FINALES */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl text-blue-800 dark:text-blue-300 shadow-sm print:hidden">
                    <div className="flex items-start gap-3">
                        <ShieldAlert size={20} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <div className="text-xs font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5">Norme d'Impression :</span> 
                            Les ombres de surélévation (shadows) et arrière-plans d'aperçu sont automatiquement purgés lors du tirage pour assurer un rendu monochrome ou couleur optimal conforme aux directives du Ministère.
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200"
                    >
                        <Printer size={16} />
                        Sauvegarder & Imprimer
                    </button>
                </div>

            </form>
        </div>
    );
};

export default BulletinFormatForm;