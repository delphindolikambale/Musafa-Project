import React, { useState } from 'react';
import { LayoutTemplate, CheckCircle2, ShieldAlert, Eye, Signature, Printer } from 'lucide-react';
import StudentBulletinPrint from './StudentBulletinPrint';

const BulletinFormatForm = () => {
    const [selectedFormat, setSelectedFormat] = useState('7eme_eb');
    const [selectedLevel, setSelectedLevel] = useState('tous');
    const [previewMode, setPreviewMode] = useState('structure');

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

    // Générateur de fausses données synchronisé à 100% avec les exigences de BulletinBody et BulletinHeader
    const generateMockDataForPrint = () => {
        const uppercaseFormat = selectedFormat.toUpperCase();

        const studentInfo = {
            lastName: "MUSAFA",
            postName: "BANZA",
            firstName: "Dieudonné",
            gender: "M",
            birthPlace: "GOMA",
            birthDate: "12/04/2011",
            classLevel: selectedFormat === 'humanites' ? "1ère ANNEE HUMANITES" : `${selectedFormat === '7eme_eb' ? '7ème' : '8ème'} ANNEE CTEB`,
            section: selectedFormat === 'humanites' ? "ELECTRONIQUE GENERALE" : "CYCLE TERMINAL DE BASE",
            option: selectedFormat === 'humanites' ? "ELECTRICITE GENERALE" : "ORDINAIRE",
            schoolYear: "2024 - 2025",
            matricule: "RDC2024MUSAFA8839",
            permanentNumber: "093821039"
        };

        const bulletinData = {
            formatType: uppercaseFormat,
            domains: selectedFormat === 'humanites' ? [
                {
                    name: "A. COURS GENERAUX",
                    maxPeriod: 10, maxExam: 20, maxTotalSem: 40, maxTotalAnnual: 80,
                    subjects: [
                        { subjectName: "Religion", p1: 8, p2: 7, exam1: 15, totalS1: 30, p3: 9, p4: 8, exam2: 14, totalS2: 31, totalAnnuel: 61 },
                        { subjectName: "Education à la Vie", p1: 9, p2: 9, exam1: 18, totalS1: 36, p3: 8, p4: 9, exam2: 17, totalS2: 34, totalAnnuel: 70 },
                        { subjectName: "Ed. civ. & morale", p1: 7, p2: 6, exam1: 12, totalS1: 25, p3: 7, p4: 7, exam2: 13, totalS2: 27, totalAnnuel: 52 }
                    ]
                },
                {
                    name: "B. COURS DE SQUELETTE TECHNIQUE",
                    maxPeriod: 20, maxExam: 40, maxTotalSem: 80, maxTotalAnnual: 160,
                    subjects: [
                        { subjectName: "Anglais", p1: 15, p2: 14, exam1: 32, totalS1: 61, p3: 16, p4: 17, exam2: 30, totalS2: 63, totalAnnuel: 124 },
                        { subjectName: "Électronique Numérique", p1: 18, p2: 19, exam1: 36, totalS1: 73, p3: 17, p4: 18, exam2: 35, totalS2: 70, totalAnnuel: 143 }
                    ]
                }
            ] : [
                {
                    name: "DOMAINE DES SCIENCES",
                    subMaxPeriod: 80, subP1: 65, subP2: 62, subExam1: 118, subTotalS1: 245, subP3: 63, subP4: 64, subExam2: 120, subTotalS2: 247, subTotalAnnuel: 492, subTenasosp: 65,
                    subjects: [
                        { subjectName: "Arithmétique", maxPeriod: 10, p1: 8, p2: 9, exam1: 16, totalS1: 33, p3: 7, p4: 8, exam2: 18, totalS2: 33, totalAnnuel: 66, tenasosp: 8 },
                        { subjectName: "Géométrie", maxPeriod: 20, p1: 15, p2: 13, exam1: 28, totalS1: 56, p3: 14, p4: 16, exam2: 30, totalS2: 60, totalAnnuel: 116, tenasosp: 15 },
                        { subjectName: "Algèbre", maxPeriod: 40, p1: 32, p2: 31, exam1: 58, totalS1: 121, p3: 34, p4: 31, exam2: 54, totalS2: 119, totalAnnuel: 240, tenasosp: 34 }
                    ]
                },
                {
                    name: "DOMAINE DES LANGUES",
                    subMaxPeriod: 40, subP1: 31, subP2: 29, subExam1: 54, subTotalS1: 114, subP3: 30, subP4: 32, subExam2: 56, subTotalS2: 118, subTotalAnnuel: 232, subTenasosp: 30,
                    subjects: [
                        { subjectName: "Français", maxPeriod: 30, p1: 22, p2: 21, exam1: 40, totalS1: 83, p3: 21, p4: 24, exam2: 42, totalS2: 87, totalAnnuel: 170, tenasosp: 22 },
                        { subjectName: "Anglais", maxPeriod: 10, p1: 9, p2: 8, exam1: 14, totalS1: 31, p3: 9, p4: 8, exam2: 14, totalS2: 31, totalAnnuel: 62, tenasosp: 8 }
                    ]
                }
            ],
            results: {
                maxTotalPeriod: selectedFormat === 'humanites' ? '-' : 120,
                maxS1_P1: selectedFormat === 'humanites' ? 70 : 120,
                maxS1_P2: selectedFormat === 'humanites' ? 70 : 120,
                maxS1_Ex: selectedFormat === 'humanites' ? 140 : 240,
                maxS1_Tot: selectedFormat === 'humanites' ? 280 : 480,
                maxS2_P3: selectedFormat === 'humanites' ? 70 : 120,
                maxS2_P4: selectedFormat === 'humanites' ? 70 : 120,
                maxS2_Ex: selectedFormat === 'humanites' ? 140 : 240,
                maxS2_Tot: selectedFormat === 'humanites' ? 280 : 480,
                totalGeneralMax: selectedFormat === 'humanites' ? 560 : 960,
                maxTenasospTot: "80",
                obtS1_P1: selectedFormat === 'humanites' ? 56 : 96,
                obtS1_P2: selectedFormat === 'humanites' ? 52 : 91,
                obtS1_Ex: selectedFormat === 'humanites' ? 111 : 172,
                totalObtainedS1: selectedFormat === 'humanites' ? 219 : 359,
                obtS2_P3: selectedFormat === 'humanites' ? 57 : 93,
                obtS2_P4: selectedFormat === 'humanites' ? 58 : 96,
                obtS2_Ex: selectedFormat === 'humanites' ? 109 : 176,
                totalObtainedS2: selectedFormat === 'humanites' ? 224 : 365,
                totalObtainedAnnual: selectedFormat === 'humanites' ? 443 : 724,
                obtTenasosp: "62",
                pctS1_P1: "78.2", pctS1_P2: "75.4", pctS1_Ex: "77.1", percentageS1: "76.9",
                pctS2_P3: "79.1", pctS2_P4: "80.2", pctS2_Ex: "76.5", percentageS2: "78.4",
                percentageAnnual: "77.6", pctTenasosp: "77.5",
                placeS1_P1: "2e", placeS1_P2: "4e", placeS1_Ex: "2e", placeS1: "2e",
                placeS2_P3: "3e", placeS2_P4: "2e", placeS2_Ex: "3e", placeS2: "3e",
                placeAnnual: "3e", placeTenasosp: "5e",
                decision: "PASSE SANS CONTRAINTE"
            },
            behavior: {
                appP1: "B", appP2: "TB", appP3: "B", appP4: "B",
                condP1: "TB", condP2: "TB", condP3: "A", condP4: "TB"
            }
        };

        return { studentInfo, bulletinData };
    };

    const filteredFormats = selectedLevel === 'tous' 
        ? formatsVisuels 
        : formatsVisuels.filter(f => f.level === selectedLevel);

    const handleSaveFormat = (e) => {
        e.preventDefault();
        alert(`Le modèle "${selectedFormat}" est désormais configuré par défaut.`);
    };

    const { studentInfo, bulletinData } = generateMockDataForPrint();

    return (
        <form onSubmit={handleSaveFormat} className="space-y-6 max-w-5xl mx-auto p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <LayoutTemplate size={18} className="text-pink-600" />
                        Modèles Nationaux de Bulletins (RDC)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Validation géométrique conforme aux directives d'évaluation de l'Éducation Nationale.</p>
                </div>
                
                <div className="flex gap-2 bg-slate-200 p-1 rounded-xl shrink-0">
                    {['tous', 'education_base', 'secondaire'].map((lvl) => (
                        <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedLevel(lvl)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedLevel === lvl ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {lvl === 'tous' ? 'Tous' : lvl === 'education_base' ? 'Éd. de Base (7e - 8e)' : 'Humanités (3e - 6e)'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredFormats.map((format) => {
                    const isSelected = selectedFormat === format.id;
                    return (
                        <div
                            key={format.id}
                            onClick={() => setSelectedFormat(format.id)}
                            className={`cursor-pointer group flex flex-col justify-between p-4 bg-white border-2 rounded-2xl transition-all hover:shadow-sm ${isSelected ? 'border-pink-600 ring-2 ring-pink-600/10' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${format.level === 'education_base' ? 'bg-pink-50 text-pink-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                        {format.badge}
                                    </span>
                                    {isSelected && <CheckCircle2 size={16} className="text-pink-600 shrink-0" />}
                                </div>
                                <h3 className="text-sm font-black text-slate-900 group-hover:text-pink-600 transition-colors">{format.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{format.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Eye size={14} className="text-slate-400" /> Modérateur Visuel de Rendu
                    </div>
                    <div className="flex bg-slate-200 p-0.5 rounded-lg text-[11px] font-black shadow-inner">
                        <button
                            type="button"
                            onClick={() => setPreviewMode('structure')}
                            className={`px-3 py-1 rounded-md transition-all ${previewMode === 'structure' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Aperçu Rapide
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewMode('print_render')}
                            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${previewMode === 'print_render' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Printer size={12} /> Rendu Réel A4 (Moteur React)
                        </button>
                    </div>
                </div>

                {previewMode === 'structure' ? (
                    <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                        Squelette architectural synchronisé : <span className="font-bold text-slate-800 uppercase">[{selectedFormat}]</span>. Basculez sur le mode "Rendu Réel A4" pour voir le moteur d'impression final compiler les données.
                    </div>
                ) : (
                    <div className="bg-slate-300 p-4 rounded-xl max-h-[620px] overflow-y-auto shadow-inner flex justify-center bg-radial">
                        <div className="scale-[0.8] origin-top my-[-20px]">
                            <StudentBulletinPrint 
                                bulletinData={bulletinData} 
                                studentInfo={studentInfo} 
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800">
                <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs font-medium leading-relaxed">
                    <span className="font-bold">Norme d'Impression :</span> Les composants de rendu sont régis par les requêtes `@media print` CSS. Lors de l'ordre d'impression réel, les ombres de surélévation (shadows) et les arrière-plans d'aperçu sont automatiquement purgés pour assurer un tirage monochrome parfait.
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                    type="submit"
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-pink-600/10 transition-all hover:-translate-y-0.5"
                >
                    Sauvegarder et Appliquer le modèle
                </button>
            </div>
        </form>
    );
};

export default BulletinFormatForm;