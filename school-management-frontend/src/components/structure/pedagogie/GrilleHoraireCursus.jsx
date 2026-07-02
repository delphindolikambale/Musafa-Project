import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Loader2 } from 'lucide-react';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';
import GrilleHoraireAdd from './GrilleHoraireAdd';
import { toast } from 'react-hot-toast';

const GrilleHoraireCursus = ({ activeYearId, onBack }) => {
    const [options, setOptions] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [gridData, setGridData] = useState([]);
    const [activeCycle, setActiveCycle] = useState("HUMANITES"); // "CEB" ou "HUMANITES"
    const [showAddModal, setShowAddModal] = useState(false);
    const [allLevels, setAllLevels] = useState([]);

    // Configuration des colonnes selon le cycle actif.
    // Nous utilisons les noms comme identifiants visuels, mais le mapping se fera plus intelligemment.
    const cycleConfig = {
        CEB: {
            levels: ["7ème", "8ème"], // Vous pouvez adapter ces libellés selon ceux stockés en base
            label: "Cycle d'Éducation de Base (CEB)"
        },
        HUMANITES: {
            levels: ["1ère", "2ème", "3ème", "4ème"],
            label: "Cursus Humanités"
        }
    };

    const currentLevelsList = cycleConfig[activeCycle].levels;

    // Mapping strict avec l'enum CourseCategory du Backend
    const categoryLabels = {
        'GENERAL': 'COURS GÉNÉRAUX',
        'TECHNIQUE': 'COURS TECHNIQUES'
    };

    // 1. Charger les options et tous les niveaux au montage
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [optionsRes, levelsRes] = await Promise.all([
                    courseAcademicConfigService.getAllOptions(),
                    courseAcademicConfigService.getAllLevels()
                ]);
                setOptions(optionsRes.data || []);
                setAllLevels(levelsRes.data || []);
            } catch (error) {
                console.error("Erreur d'initialisation :", error);
                toast.error("Impossible de charger les options ou niveaux.");
            }
        };
        fetchInitialData();
    }, []);

    // 2. Charger et agréger les données de la grille horaire matricielle
    const fetchGridData = async () => {
        if (!activeYearId) return;
        // Si Cursus Humanitaire actif, l'option est requise
        if (activeCycle === "HUMANITES" && !selectedOptionId) {
            setGridData([]);
            return;
        }

        setLoading(true);
        try {
            // Appel API : Si c'est le CEB, l'option est null. Si c'est Humanités, on passe selectedOptionId.
            // On envoie le niveau à l'identifiant "vide" pour tout charger d'un coup.
            const optId = activeCycle === "CEB" ? null : selectedOptionId;
            
            // Le backend renvoie tous les cours du cycle / option
            const res = await courseAcademicConfigService.getSubjectsByClass(null, null, optId, activeYearId);
            const subjects = res.data || [];

            const aggregatedCourses = {};

            // ÉTAPE CLÉ : Filtrage strict par cycle avant agrégation
            // On ne conserve que les cours dont le niveau correspond au cycle actif (CEB vs HUMANITES)
            const filteredSubjects = subjects.filter(subject => {
                if (!subject.levelName) return false;
                const normalizedLvl = subject.levelName.toLowerCase();
                
                if (activeCycle === "CEB") {
                    return normalizedLvl.includes("7") || normalizedLvl.includes("8");
                } else {
                    return normalizedLvl.includes("1") || normalizedLvl.includes("2") || 
                           normalizedLvl.includes("3") || normalizedLvl.includes("4");
                }
            });

            filteredSubjects.forEach(subject => {
                // Clé unique pour regrouper par nom et catégorie
                const key = `${subject.category}_${subject.name.trim().toLowerCase()}`;
                
                if (!aggregatedCourses[key]) {
                    aggregatedCourses[key] = {
                        name: subject.name,
                        category: subject.category || 'GENERAL',
                        hours: new Array(currentLevelsList.length).fill(0)
                    };
                }

                // Trouver l'index de la colonne correspondant au nom du niveau.
                // Recherche tolérante pour pallier aux différences ("1ere" vs "1ère").
                if (subject.levelName) {
                    const normalizedLevelName = subject.levelName.toLowerCase().replace(/è|é/g, 'e');
                    
                    const colIndex = currentLevelsList.findIndex(colName => {
                        const normalizedCol = colName.toLowerCase().replace(/è|é/g, 'e');
                        // Vérifie si le chiffre de base (ex: '7') correspond
                        const baseNumber = normalizedCol.match(/\d+/);
                        const subjectNumber = normalizedLevelName.match(/\d+/);
                        
                        return baseNumber && subjectNumber && baseNumber[0] === subjectNumber[0];
                    });
                    
                    if (colIndex !== -1) {
                        // On additionne au cas où il y aurait plusieurs entrées (bien que peu probable)
                        aggregatedCourses[key].hours[colIndex] += (subject.hoursPerWeek || 0);
                    }
                }
            });

            // Regroupement final par catégories stricte (Généraux vs Techniques)
            const groupedByCat = Object.values(aggregatedCourses).reduce((acc, course) => {
                const catKey = course.category;
                const catTitle = categoryLabels[catKey] || catKey;
                if (!acc[catKey]) {
                    acc[catKey] = { title: catTitle, courses: [] };
                }
                acc[catKey].courses.push(course);
                return acc;
            }, {});

            setGridData(Object.values(groupedByCat));
        } catch (error) {
            console.error("Erreur lors du calcul de la grille :", error);
            toast.error("Erreur lors de la récupération des données de la grille.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allLevels.length > 0) {
            fetchGridData();
        }
    }, [selectedOptionId, activeCycle, activeYearId, allLevels]);

    // Outils de calcul pour les lignes et colonnes
    const getRowTotal = (hours) => hours.reduce((a, b) => a + b, 0);
    
    const getColTotal = (colIndex) => {
        return gridData.reduce((acc, group) => 
            acc + group.courses.reduce((sum, course) => sum + (course.hours[colIndex] || 0), 0)
        , 0);
    };

    const getGrandTotal = () => {
        return gridData.reduce((acc, group) => 
            acc + group.courses.reduce((sum, course) => sum + getRowTotal(course.hours), 0)
        , 0);
    };

    return (
        <div className="space-y-6 print:m-0">
            {/* PANNEAU DE CONTRÔLE ET ACTIONS */}
            <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm print:hidden gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <button onClick={onBack} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto">
                        <ArrowLeft size={20} />
                    </button>
                    
                    {/* BOUTONS SÉLECTEURS DE CYCLE */}
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full sm:w-auto">
                        <button
                            onClick={() => {
                                setActiveCycle("CEB");
                                setSelectedOptionId("");
                            }}
                            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all flex-1 sm:flex-none ${activeCycle === "CEB" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Cycle de Base (CEB)
                        </button>
                        <button
                            onClick={() => setActiveCycle("HUMANITES")}
                            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all flex-1 sm:flex-none ${activeCycle === "HUMANITES" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Humanités
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto justify-end">
                    {/* AFFICHAGE CONDITIONNEL DU SÉLECTEUR D'OPTION (UNIQUEMENT POUR LES HUMANITÉS) */}
                    {activeCycle === "HUMANITES" && (
                        <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <label className="font-bold text-slate-600 text-sm pl-2 uppercase whitespace-nowrap">Option :</label>
                            <select 
                                value={selectedOptionId} 
                                onChange={(e) => setSelectedOptionId(e.target.value)}
                                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-semibold w-full sm:min-w-[200px]"
                            >
                                <option value="">-- Sélectionnez une option --</option>
                                {options.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.optionName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button 
                            onClick={() => setShowAddModal(true)} 
                            disabled={activeCycle === "HUMANITES" && !selectedOptionId}
                            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-slate-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
                        >
                            <Plus size={16} /> Ajouter Cours
                        </button>
                        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-indigo-100 transition-colors w-full sm:w-auto">
                            <Printer size={16} /> Imprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION D'AFFICHAGE DE LA TABLE MATRICIELLE */}
            {activeCycle === "HUMANITES" && !selectedOptionId ? (
                <div className="bg-white p-12 rounded-[2rem] border border-slate-200 shadow-sm text-center">
                    <p className="text-slate-500 font-bold text-lg">Veuillez sélectionner une option pour afficher sa grille horaire des Humanités.</p>
                </div>
            ) : loading ? (
                <div className="bg-white p-12 rounded-[2rem] border border-slate-200 shadow-sm flex justify-center items-center">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            ) : (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl overflow-x-auto print:shadow-none print:border-none print:p-0">
                    <div className="mb-4 text-center hidden print:block">
                        <h1 className="font-black text-2xl uppercase tracking-wider">{cycleConfig[activeCycle].label}</h1>
                        {activeCycle === "HUMANITES" && (
                            <h2 className="font-bold text-md text-slate-700 uppercase">Option : {options.find(o => o.id.toString() === selectedOptionId.toString())?.optionName}</h2>
                        )}
                    </div>

                    <table className="w-full border-collapse border-2 border-slate-900 text-sm">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border-2 border-slate-900 p-4 text-left font-black uppercase">Branches</th>
                                {currentLevelsList.map((lvl, i) => (
                                    <th key={i} className="border-2 border-slate-900 p-4 text-center font-black uppercase w-24">{lvl}</th>
                                ))}
                                <th className="border-2 border-slate-900 p-4 text-center font-black uppercase w-24">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.length === 0 ? (
                                <tr>
                                    <td colSpan={currentLevelsList.length + 2} className="border-2 border-slate-900 p-8 text-center text-slate-500 font-bold bg-slate-50">
                                        Aucun cours configuré pour ce cycle. Cliquez sur "Ajouter Cours" pour commencer.
                                    </td>
                                </tr>
                            ) : (
                                gridData.map((group, gIdx) => (
                                    <React.Fragment key={gIdx}>
                                        {/* Ligne titre de la catégorie d'affectation */}
                                        <tr className="bg-slate-50">
                                            <td colSpan={currentLevelsList.length + 2} className="border-2 border-slate-900 p-3 font-black uppercase tracking-widest text-slate-800 text-xs">
                                                {group.title}
                                            </td>
                                        </tr>
                                        {/* Énumération des cours correspondants */}
                                        {group.courses.map((course, cIdx) => (
                                            <tr key={cIdx} className="hover:bg-slate-50 transition-colors">
                                                <td className="border-2 border-slate-900 p-3 font-semibold text-slate-800">{course.name}</td>
                                                {course.hours.map((h, i) => (
                                                    <td key={i} className="border-2 border-slate-900 p-3 text-center font-bold text-slate-700">
                                                        {h > 0 ? h : "-"}
                                                    </td>
                                                ))}
                                                <td className="border-2 border-slate-900 p-3 text-center font-black bg-slate-100 text-slate-900">
                                                    {getRowTotal(course.hours)}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white">
                                <td className="border-2 border-slate-900 p-4 text-right font-black uppercase">Total Heures par Semaine</td>
                                {currentLevelsList.map((_, i) => (
                                    <td key={i} className="border-2 border-slate-900 p-4 text-center font-black text-lg">{getColTotal(i)}</td>
                                ))}
                                <td className="border-2 border-slate-900 p-4 text-center font-black text-xl text-indigo-300">{getGrandTotal()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* INCLUSION DU COMPOSANT MODAL D'AJOUT DYNAMIQUE */}
            {showAddModal && (
                <GrilleHoraireAdd 
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    activeCycle={activeCycle}
                    selectedOptionId={selectedOptionId}
                    activeYearId={activeYearId}
                    allLevels={allLevels}
                    onSaveSuccess={fetchGridData}
                />
            )}
        </div>
    );
};

export default GrilleHoraireCursus;