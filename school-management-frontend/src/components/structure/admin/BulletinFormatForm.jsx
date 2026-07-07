import React, { useState, useEffect } from 'react';
import { LayoutTemplate, CheckCircle2, ShieldAlert, Printer, Loader2 } from 'lucide-react';
import BulletinApercuContainer from './BulletinApercuContainer';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";
import { getClassesForProviseur, getBulletinInitData } from "../../../services/admin/bulletinService";
import academicYearService from "../../../services/academicYearService";

// 🔴 CORRECTION : Données par défaut vidées pour éviter l'affichage de fausses informations
const mockStudentInfo = {
    firstName: "",
    lastName: "",
    postName: "",
    gender: "",
    birthPlace: "",
    birthDate: "",
    classLevel: "..........",
    schoolYear: "..........",
    permanentNumber: "",
    section: "",
    option: ""
};

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
        standaloneSubjects: [
            { name: 'Français', max: 50, firstPeriod: 35, secondPeriod: 40, exam: 70 }
        ],
        results: {}
    }
};

const BulletinFormatForm = () => {
    const [selectedFormat, setSelectedFormat] = useState('7eme_eb');
    const [selectedLevel, setSelectedLevel] = useState('tous');
    
    const [headerData, setHeaderData] = useState(null);
    const [loadingHeader, setLoadingHeader] = useState(true);

    // États pour la gestion dynamique des classes
    const [classes, setClasses] = useState([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [bulletinInitData, setBulletinInitData] = useState(null);
    const [loadingInit, setLoadingInit] = useState(false);
    
    // État pour l'année académique active
    const [activeYear, setActiveYear] = useState(null);

    // TODO: À lier au Contexte d'Authentification (Extraction du JWT)
    const currentSchoolId = 1; 

    const formatsVisuels = [
        {
            id: '7eme_eb',
            title: "Format 7ème Année (EB)",
            description: "Grille officielle Éducation de Base. Regroupement par Domaines (Sciences, Langues, Développement Humain, Arts) selon la maquette terminale.",
            level: "education_base",
            badge: "Éducation de Base",
            formatType: '7EME_EB'
        },
        {
            id: '8eme_eb',
            title: "Format 8ème Année (EB)",
            description: "Structure Éducation de Base comprenant les synthèses d'orientation et la colonne certifiée pour le test national TENASOSP.",
            level: "education_base",
            badge: "Éducation de Base",
            formatType: '8EME_EB'
        },
        {
            id: 'humanites',
            title: "Format Humanités (3e à 6e)",
            description: "Structure standardisée du Secondaire. Répartition stricte avec lignes de Maxima transversales en tête de chaque section de cours.",
            level: "secondaire",
            badge: "Humanités",
            formatType: 'HUMANITES'
        }
    ];

    const filteredFormats = selectedLevel === 'tous' 
        ? formatsVisuels 
        : formatsVisuels.filter(f => f.level === selectedLevel);

    // 1. Récupération de l'en-tête et de l'année active (Requêtes découplées pour la robustesse)
    useEffect(() => {
        const fetchInitialData = async () => {
            // Requête 1 : En-tête
            try {
                const headerRes = await BulletinHeaderService.getHeader();
                setHeaderData(headerRes);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'en-tête du bulletin:", error);
            }

            // Requête 2 : Année Active
            try {
                const yearRes = await academicYearService.getActiveYear();
                // Gestion sécurisée selon le format de retour de l'API (avec ou sans .data)
                const yearData = yearRes.data ? yearRes.data : yearRes;
                setActiveYear(yearData);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'année active:", error);
            } finally {
                setLoadingHeader(false);
            }
        };
        fetchInitialData();
    }, []);

    // 2. Récupération des classes de l'école (Multi-Tenant)
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getClassesForProviseur(currentSchoolId);
                setClasses(data);
            } catch (error) {
                console.error("Erreur chargement classes:", error);
            }
        };
        fetchClasses();
    }, [currentSchoolId]);

    // 3. Chargement de l'initialisation du bulletin lors du choix d'une classe
    useEffect(() => {
        // La condition !activeYear a été retirée pour éviter le blocage global de l'interface
        if (!selectedClassroomId) {
            setBulletinInitData(null);
            return;
        }
        const fetchInitData = async () => {
            setLoadingInit(true);
            try {
                // Fallback sécurisé : si l'année active n'est pas chargée, on utilise 1 par défaut
                const yearId = activeYear ? activeYear.id : 1;
                const data = await getBulletinInitData(selectedClassroomId, yearId, currentSchoolId);
                setBulletinInitData(data);
            } catch (error) {
                console.error("Erreur chargement données d'initialisation:", error);
            } finally {
                setLoadingInit(false);
            }
        };
        fetchInitData();
    }, [selectedClassroomId, activeYear, currentSchoolId]);

    // Réinitialiser la sélection de classe si l'utilisateur change de format de bulletin
    useEffect(() => {
        setSelectedClassroomId('');
    }, [selectedFormat]);

    // Filtrage dynamique des classes pour le <select> selon le format choisi
    const filteredDropdownClasses = classes.filter(c => {
        const classNameStr = c.name.toLowerCase();
        if (selectedFormat === '7eme_eb') {
            return classNameStr.includes('7ème') || classNameStr.includes('7eme');
        } else if (selectedFormat === '8eme_eb') {
            return classNameStr.includes('8ème') || classNameStr.includes('8eme');
        } else if (selectedFormat === 'humanites') {
            return !classNameStr.includes('7ème') && !classNameStr.includes('7eme') && 
                   !classNameStr.includes('8ème') && !classNameStr.includes('8eme');
        }
        return true;
    });

    // Injection dynamique de l'année scolaire et préservation des champs vides
    const dynamicStudentInfo = bulletinInitData ? {
        ...mockStudentInfo, 
        classLevel: bulletinInitData.classroomName,
        titulaireName: bulletinInitData.titulaireName,
        studentCount: bulletinInitData.studentCount,
        // ADAPTATION : Utilisation des espaces insécables (\u00A0) pour solidariser l'année scolaire
        schoolYear: activeYear?.name ? activeYear.name.replace(/\s+/g, '\u00A0') : ".........."
    } : { 
        ...mockStudentInfo, 
        schoolYear: activeYear?.name ? activeYear.name.replace(/\s+/g, '\u00A0') : ".........." 
    };

    // Aplatissement de TOUS les cours pour le format Humanités.
    const flattenedSubjectsForHumanites = bulletinInitData ? [
        ...(bulletinInitData.standaloneSubjects || []),
        ...(bulletinInitData.domains || []).flatMap(d => [
            ...(d.subjects || []),
            ...(d.subDomains || []).flatMap(sd => sd.subjects || [])
        ])
    ] : [];

    // On passe directement l'objet bulletinInitData avec l'ajout de notre liste aplatie
    const dynamicBulletinData = bulletinInitData ? {
        formatType: formatsVisuels.find(f => f.id === selectedFormat)?.formatType || '7EME_EB',
        studentCount: bulletinInitData.studentCount,
        domains: bulletinInitData.domains || [],
        standaloneSubjects: flattenedSubjectsForHumanites,
        totalMaxP1: bulletinInitData.totalMaxP1,
        totalMaxP2: bulletinInitData.totalMaxP2,
        totalMaxExam1: bulletinInitData.totalMaxExam1,
        totalMaxS1: bulletinInitData.totalMaxS1,
        totalMaxP3: bulletinInitData.totalMaxP3,
        totalMaxP4: bulletinInitData.totalMaxP4,
        totalMaxExam2: bulletinInitData.totalMaxExam2,
        totalMaxS2: bulletinInitData.totalMaxS2,
        totalGeneralMax: bulletinInitData.totalGeneralMax,
        results: {} 
    } : mockBulletins[selectedFormat];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Format et Classe prêts pour impression :", selectedFormat, selectedClassroomId);
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            
            {/* ADAPTATION CSS : Forcer les grands titres à s'afficher sur une ligne stricte sans wrap */}
            <style>{`
                .bulletin-apercu-wrapper header,
                .bulletin-apercu-wrapper h1,
                .bulletin-apercu-wrapper h2,
                .bulletin-apercu-wrapper h3,
                .bulletin-apercu-wrapper .titre-principal {
                    white-space: nowrap !important;
                    letter-spacing: -0.01em !important;
                }
                @media print {
                    .bulletin-apercu-wrapper header,
                    .bulletin-apercu-wrapper h1,
                    .bulletin-apercu-wrapper h2,
                    .bulletin-apercu-wrapper h3,
                    .bulletin-apercu-wrapper .titre-principal {
                        white-space: nowrap !important;
                    }
                }
            `}</style>

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
                                Sélectionnez la classe et le modèle d'impression officiel.
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

                {/* SÉLECTEUR DE CLASSE MULTI-TENANT */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row gap-6 items-center print:hidden">
                    <div className="w-full md:w-1/2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Classe à configurer (Scope École)
                        </label>
                        <select
                            value={selectedClassroomId}
                            onChange={(e) => setSelectedClassroomId(e.target.value)}
                            className="w-full p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                        >
                            <option value="">-- Sélectionnez une classe --</option>
                            {filteredDropdownClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {bulletinInitData && (
                        <div className="w-full md:w-1/2 flex justify-around p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                            <div className="text-center">
                                <span className="block text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Effectif Total</span>
                                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{bulletinInitData.studentCount} <span className="text-sm font-semibold">élèves</span></span>
                            </div>
                            <div className="w-px bg-emerald-200 dark:bg-emerald-800/50"></div>
                            <div className="text-center">
                                <span className="block text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Titulaire</span>
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">{bulletinInitData.titulaireName}</span>
                            </div>
                        </div>
                    )}
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

                {/* BLOC D'APERÇU DU RENDU REEL A4 */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between print:hidden">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aperçu Réel Format National (A4) - {formatsVisuels.find(f => f.id === selectedFormat)?.title}
                        </span>
                    </div>
                    <div className="p-4 sm:p-8 bg-slate-100 dark:bg-slate-900/40 flex justify-center overflow-x-auto">
                        {/* ADAPTATION: Ajout de 'bulletin-apercu-wrapper' et 'min-w-[210mm]' pour bloquer la compression A4 */}
                        <div className="transform scale-[0.95] origin-top transition-all duration-300 bulletin-apercu-wrapper shrink-0 min-w-[210mm] print:min-w-0 print:w-full">
                            {loadingHeader || loadingInit ? (
                                <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>
                            ) : (
                                <BulletinApercuContainer 
                                    bulletinData={dynamicBulletinData} 
                                    studentInfo={dynamicStudentInfo}
                                    header={headerData} 
                                />
                            )}
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
                        disabled={!selectedClassroomId}
                        className={`w-full sm:w-auto px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                            selectedClassroomId 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white' 
                                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
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