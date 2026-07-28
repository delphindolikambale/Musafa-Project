import React, { useState, useEffect, useMemo } from 'react';
import { LayoutTemplate, CheckCircle2, ShieldAlert, Printer, Loader2, Send, AlertTriangle, XCircle, X } from 'lucide-react';
import BulletinApercuContainer from './BulletinApercuContainer';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";
import { getClassesForProviseur, getBulletinInitData, initializeBulletins } from "../../../services/admin/bulletinService";
import academicYearService from "../../../services/academicYearService";

// Données par défaut vidées pour éviter l'affichage de fausses informations
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
    
    // État pour le chargement de l'envoi/initialisation des bulletins
    const [isInitializing, setIsInitializing] = useState(false);

    // État pour la gestion de la boîte de dialogue (Modale)
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm', 'success', 'error', 'warning'
        title: '',
        message: ''
    });

    // Récupération dynamique du School ID depuis le stockage local ou secours à 1
    const currentSchoolId = useMemo(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                return parsed.schoolId || parsed.school?.id || 1;
            } catch (e) {
                return 1;
            }
        }
        return 1;
    }, []);

    const filteredFormats = useMemo(() => {
        return selectedLevel === 'tous' 
            ? formatsVisuels 
            : formatsVisuels.filter(f => f.level === selectedLevel);
    }, [selectedLevel]);

    // 1. Récupération de l'en-tête et de l'année active
    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                const headerRes = await BulletinHeaderService.getHeader();
                if (isMounted) setHeaderData(headerRes);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'en-tête du bulletin:", error);
            }

            try {
                const yearRes = await academicYearService.getActiveYear();
                const yearData = yearRes?.data ? yearRes.data : yearRes;
                if (isMounted) setActiveYear(yearData);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'année active:", error);
            } finally {
                if (isMounted) setLoadingHeader(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    // 2. Récupération des classes de l'école (Multi-Tenant)
    useEffect(() => {
        let isMounted = true;
        const fetchClasses = async () => {
            try {
                const data = await getClassesForProviseur(currentSchoolId);
                if (isMounted && Array.isArray(data)) {
                    setClasses(data);
                }
            } catch (error) {
                console.error("Erreur chargement classes:", error);
            }
        };
        fetchClasses();
        return () => { isMounted = false; };
    }, [currentSchoolId]);

    // 3. Chargement de l'initialisation du bulletin lors du choix d'une classe
    const activeYearId = activeYear?.id;
    useEffect(() => {
        if (!selectedClassroomId) {
            setBulletinInitData(null);
            return;
        }
        let isMounted = true;
        const fetchInitData = async () => {
            setLoadingInit(true);
            try {
                const yearId = activeYearId || 1;
                const data = await getBulletinInitData(selectedClassroomId, yearId, currentSchoolId);
                if (isMounted) setBulletinInitData(data);
            } catch (error) {
                console.error("Erreur chargement données d'initialisation:", error);
                if (isMounted) setBulletinInitData(null);
            } finally {
                if (isMounted) setLoadingInit(false);
            }
        };
        fetchInitData();
        return () => { isMounted = false; };
    }, [selectedClassroomId, activeYearId, currentSchoolId]);

    // Réinitialiser la sélection de classe si l'utilisateur change de format
    useEffect(() => {
        setSelectedClassroomId('');
    }, [selectedFormat]);

    // Filtrage dynamique des classes pour le <select> selon le format choisi
    const filteredDropdownClasses = useMemo(() => {
        return classes.filter(c => {
            const classNameStr = (c.name || '').toLowerCase();
            if (selectedFormat === '7eme_eb') {
                return classNameStr.includes('7è') || classNameStr.includes('7e') || classNameStr.includes('7ème') || classNameStr.includes('7eme');
            } else if (selectedFormat === '8eme_eb') {
                return classNameStr.includes('8è') || classNameStr.includes('8e') || classNameStr.includes('8ème') || classNameStr.includes('8eme');
            } else if (selectedFormat === 'humanites') {
                const is7 = classNameStr.includes('7è') || classNameStr.includes('7e') || classNameStr.includes('7ème') || classNameStr.includes('7eme');
                const is8 = classNameStr.includes('8è') || classNameStr.includes('8e') || classNameStr.includes('8ème') || classNameStr.includes('8eme');
                return !is7 && !is8;
            }
            return true;
        });
    }, [classes, selectedFormat]);

    // Formatage de l'année scolaire
    const formattedSchoolYear = activeYear?.name ? activeYear.name.replace(/\s+/g, '\u00A0') : "..........";

    // Injection dynamique des informations de l'élève
    const dynamicStudentInfo = useMemo(() => {
        if (bulletinInitData) {
            return {
                ...mockStudentInfo, 
                classLevel: bulletinInitData.classroomName || "..........",
                titulaireName: bulletinInitData.titulaireName || "Non assigné",
                studentCount: bulletinInitData.studentCount || 0,
                schoolYear: formattedSchoolYear
            };
        }
        return { 
            ...mockStudentInfo, 
            schoolYear: formattedSchoolYear 
        };
    }, [bulletinInitData, formattedSchoolYear]);

    // Aplatissement des cours pour le format Humanités
    const flattenedSubjectsForHumanites = useMemo(() => {
        if (!bulletinInitData) return [];
        return [
            ...(bulletinInitData.standaloneSubjects || []),
            ...(bulletinInitData.domains || []).flatMap(d => [
                ...(d.subjects || []),
                ...(d.subDomains || []).flatMap(sd => sd.subjects || [])
            ])
        ];
    }, [bulletinInitData]);

    // Fusion des données d'initialisation et de modèle
    const dynamicBulletinData = useMemo(() => {
        if (bulletinInitData) {
            return {
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
            };
        }
        return mockBulletins[selectedFormat] || mockBulletins['7eme_eb'];
    }, [bulletinInitData, selectedFormat, flattenedSubjectsForHumanites]);

    const handleSubmitPrint = (e) => {
        e.preventDefault();
        window.print();
    };

    // Déclenchement de la Modale de confirmation avec contrôle du Titulaire
    const triggerInitialization = () => {
        if (!selectedClassroomId || !activeYear) return;
        
        const selectedClassObj = classes.find(c => c.id.toString() === selectedClassroomId.toString());
        const selectedClass = selectedClassObj?.name || "cette classe";
        const titulaire = bulletinInitData?.titulaireName;
        const teacherId = bulletinInitData?.teacherId || bulletinInitData?.titulaireId;

        if (!teacherId && (!titulaire || titulaire === "Non assigné")) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Titulaire Non Assigné',
                message: `La classe ${selectedClass} n'a pas encore de professeur titulaire assigné. Veuillez désigner un titulaire pour cette classe avant de lui envoyer les bulletins.`
            });
            return;
        }

        setModalState({
            isOpen: true,
            type: 'confirm',
            title: 'Confirmation d\'Envoi',
            message: `Êtes-vous sûr de vouloir générer et transmettre les bulletins de ${selectedClass} pour l'année ${activeYear.name} ? Les bulletins seront transmis à ${titulaire} pour l'ouverture du dossier de saisie.`
        });
    };

    // Exécution de l'API d'initialisation et de notification
    const confirmInitialization = async () => {
        setIsInitializing(true);
        setModalState(prev => ({ ...prev, isOpen: false })); 

        try {
            const teacherId = bulletinInitData?.teacherId || bulletinInitData?.titulaireId;
            const yearId = activeYear?.id || 1;
            
            // Appel vers le backend Spring Boot
            await initializeBulletins(selectedClassroomId, yearId, currentSchoolId, teacherId);
            
            const selectedClassObj = classes.find(c => c.id.toString() === selectedClassroomId.toString());
            const selectedClass = selectedClassObj?.name || "la classe";
            const titulaire = bulletinInitData?.titulaireName || "l'enseignant titulaire";

            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Envoi Réussi',
                message: `Les bulletins des ${bulletinInitData?.studentCount || 0} élèves de ${selectedClass} ont été générés et notifiés avec succès à ${titulaire}.`
            });
        } catch (error) {
            console.error("Erreur lors de l'initialisation des bulletins:", error);
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Échec de l\'Envoi',
                message: "Un problème est survenu lors de la génération et du transfert WebSocket des bulletins. Veuillez vérifier la connexion au serveur puis reessayer."
            });
        } finally {
            setIsInitializing(false);
        }
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300 relative">
            
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

            <form onSubmit={handleSubmitPrint} className="max-w-7xl mx-auto space-y-8 relative z-10">
                
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
                                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{bulletinInitData.studentCount || 0} <span className="text-sm font-semibold">élèves</span></span>
                            </div>
                            <div className="w-px bg-emerald-200 dark:bg-emerald-800/50"></div>
                            <div className="text-center">
                                <span className="block text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Titulaire</span>
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">{bulletinInitData.titulaireName || "Non assigné"}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* SÉLECTEUR DE FORMAT */}
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

                {/* ACTIONS ET BANDEAU */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl text-blue-800 dark:text-blue-300 shadow-sm print:hidden">
                    <div className="flex items-start gap-3 flex-1">
                        <ShieldAlert size={20} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <div className="text-xs font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5">Norme d'Impression :</span> 
                            Les ombres de surélévation et arrière-plans d'aperçu sont purges lors du tirage imprimante.
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={triggerInitialization}
                            disabled={!selectedClassroomId || isInitializing}
                            className={`w-full sm:w-auto px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                                selectedClassroomId && !isInitializing
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Envoyer au Titulaire
                        </button>

                        <button
                            type="submit"
                            disabled={!selectedClassroomId}
                            className={`w-full sm:w-auto px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                                selectedClassroomId 
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white' 
                                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            <Printer size={16} />
                            Imprimer l'Aperçu
                        </button>
                    </div>
                </div>
            </form>

            {/* --- MODALE INFORMATIVE ET DE CONFIRMATION --- */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        
                        <div className={`p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 ${
                            modalState.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                            modalState.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 
                            'bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                            {modalState.type === 'confirm' && <AlertTriangle className="text-blue-600 dark:text-blue-400" size={24} />}
                            {modalState.type === 'success' && <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />}
                            {modalState.type === 'error' && <XCircle className="text-red-600 dark:text-red-400" size={24} />}
                            
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {modalState.title}
                            </h3>
                            
                            <button onClick={closeModal} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                {modalState.message}
                            </p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/60 flex justify-end gap-3">
                            {modalState.type === 'confirm' ? (
                                <>
                                    <button 
                                        onClick={closeModal}
                                        className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={confirmInitialization}
                                        className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Oui, Envoyer au Titulaire
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl shadow-sm transition-colors"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulletinFormatForm;