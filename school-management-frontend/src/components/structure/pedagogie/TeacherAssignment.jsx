import React, { useState, useEffect } from 'react';
// IMPORT CORRIGÉ : On remplace axios par ton instance api globale (ajuste le chemin relatif si besoin selon ton dossier)
import api from '../../../services/api'; 
import { Presentation, BookOpen, AlertCircle, Loader2, Archive } from 'lucide-react';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';
import AssignTeacherModal from './AssignTeacherModal';
import CourseAssignmentCard from './CourseAssignmentCard';

const TeacherAssignment = () => {
    const [activeYear, setActiveYear] = useState(null);
    const [allYears, setAllYears] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [courseConfigs, setCourseConfigs] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingInitialData, setFetchingInitialData] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseToAssign, setSelectedCourseToAssign] = useState(null);
    const [isCloning, setIsCloning] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null);

    /**
     * Logique de tri des classes : 7ème, 8ème, puis 1ère, 2ème...
     */
    const sortClassrooms = (list) => {
        return [...list].sort((a, b) => {
            const getLevelWeight = (name) => {
                const n = (name || "").toLowerCase();
                if (n.startsWith("7")) return 7;
                if (n.startsWith("8")) return 8;
                if (n.startsWith("1")) return 11;
                if (n.startsWith("2")) return 12;
                if (n.startsWith("3")) return 13;
                if (n.startsWith("4")) return 14;
                return 100;
            };

            const weightA = getLevelWeight(a.displayName || a.name);
            const weightB = getLevelWeight(b.displayName || b.name);

            if (weightA !== weightB) return weightA - weightB;
            return (a.displayName || a.name).localeCompare(b.displayName || b.name, undefined, { numeric: true });
        });
    };

    /**
     * Logique de tri des cours : Domaine (Sciences d'abord) > Sous-Domaine > Sujet
     */
    const sortCourseConfigs = (list) => {
        return [...list].sort((a, b) => {
            const domA = (a.domainName || "").toLowerCase();
            const domB = (b.domainName || "").toLowerCase();

            const isSciA = domA.includes("science");
            const isSciB = domB.includes("science");
            if (isSciA && !isSciB) return -1;
            if (!isSciA && isSciB) return 1;

            const domComp = domA.localeCompare(domB);
            if (domComp !== 0) return domComp;

            const subA = (a.subDomainName || "").toLowerCase();
            const subB = (b.subDomainName || "").toLowerCase();
            const subComp = subA.localeCompare(subB);
            if (subComp !== 0) return subComp;

            return (a.subjectName || "").localeCompare(b.subjectName || "");
        });
    };

    // 1. Charger l'année active, toutes les années et TOUTES les classes au montage
    useEffect(() => {
        const initDashboard = async () => {
            setFetchingInitialData(true);
            try {
                // CORRECTION : Utilisation de l'instance "api" configurée dans api.js. 
                // Plus besoin de gérer les headers manuellement ni l'URL hardcodée !
                const yearRes = await api.get('/academic-years/active');
                const allYearsRes = await api.get('/academic-years');
                
                if (allYearsRes.status === 200 && allYearsRes.data) {
                     const sortedYears = [...allYearsRes.data].sort((a, b) => {
                         const yearA = parseInt(a.annee.split('-')[0]);
                         const yearB = parseInt(b.annee.split('-')[0]);
                         return yearB - yearA;
                     });
                     setAllYears(sortedYears);
                }
                
                if (yearRes.status === 200 && yearRes.data) {
                    const currentYear = yearRes.data;
                    setActiveYear(currentYear);

                    // Utilisation de l'instance "api" ici aussi
                    const classRes = await api.get(`/classrooms?academicYearId=${currentYear.id}`);
                    setClassrooms(sortClassrooms(classRes.data || []));
                } else {
                    setActiveYear(null);
                    setClassrooms([]);
                }
            } catch (error) {
                console.error("Erreur initialisation affectations:", error);
                setActiveYear(null);
                setClassrooms([]);
            } finally {
                setFetchingInitialData(false);
            }
        };
        initDashboard();
    }, []);

    // 2. Charger les cours et affectations quand une classe est cliquée
    const handleClassroomSelect = async (classroom) => {
        if (!activeYear) {
            alert("Aucune année scolaire active détectée.");
            return;
        }
        setSelectedClassroom(classroom);
        setLoading(true);
        try {
            const configRes = await courseAcademicConfigService.getCourseConfigurationFilter(
                classroom.levelId, 
                classroom.sectionId, 
                classroom.optionId, 
                activeYear.id
            );
            setCourseConfigs(sortCourseConfigs(configRes.data || []));

            const assignRes = await TeacherAssignmentService.getAssignmentsByClass(classroom.id, activeYear.id);
            setAssignments(Array.isArray(assignRes) ? assignRes : assignRes.data || []);
        } catch (error) {
            console.error("Erreur chargement données classe:", error);
            setCourseConfigs([]);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (assignmentId) => {
        if (window.confirm("Voulez-vous vraiment retirer cet enseignant de ce cours ?")) {
            try {
                await TeacherAssignmentService.deleteAssignment(assignmentId);
                handleClassroomSelect(selectedClassroom);
            } catch (error) {
                console.error(error);
                alert("Erreur lors de la suppression de l'affectation.");
            }
        }
    };

    const handleCloneConfiguration = async () => {
        if (!activeYear || allYears.length < 2) {
            alert("Impossible de cloner : Il n'y a pas d'année scolaire précédente dans le système.");
            return;
        }

        const activeStartYear = parseInt(activeYear.annee.split('-')[0]);
        const previousYear = allYears.find(y => parseInt(y.annee.split('-')[0]) === activeStartYear - 1);

        if (!previousYear) {
             alert("Impossible de trouver l'année scolaire précédant immédiatement l'année active.");
             return;
        }

        if (window.confirm(`Voulez-vous vraiment importer toutes les affectations de l'année scolaire ${previousYear.annee} vers l'année active (${activeYear.annee}) ? Les affectations déjà existantes ne seront pas écrasées.`)) {
            setIsCloning(true);
            try {
                await TeacherAssignmentService.importPreviousYear(previousYear.id, activeYear.id);
                alert("Importation terminée avec succès !");
                if (selectedClassroom) {
                    handleClassroomSelect(selectedClassroom);
                }
            } catch (error) {
                console.error("Erreur lors de l'importation:", error);
                alert("Une erreur est survenue lors de l'importation de la configuration.");
            } finally {
                setIsCloning(false);
            }
        }
    };

    if (fetchingInitialData) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement de la configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <div className="flex items-center justify-center">
                                <Presentation size={28} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Affectation des Enseignants</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {activeYear ? (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                                        Année Active : {activeYear.annee || activeYear.name}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                        <AlertCircle size={12}/> Aucune année active
                                    </span>
                                )}
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic ml-2">Sélectionnez une classe</p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCloneConfiguration}
                        disabled={isCloning || !activeYear || allYears.length < 2}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-lg 
                            ${(isCloning || !activeYear || allYears.length < 2) 
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-200'}`}
                    >
                        {isCloning ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                        {isCloning ? 'Importation en cours...' : 'Cloner Configuration'}
                    </button>
                </div>

                {/* Liste des classes triées */}
                <div className="flex flex-wrap gap-3 mt-10">
                    {classrooms.length > 0 ? (
                        classrooms.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => handleClassroomSelect(cls)}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                                    selectedClassroom?.id === cls.id
                                        ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-xl shadow-blue-100'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'
                                }`}
                            >
                                {cls.displayName || cls.name}
                            </button>
                        ))
                    ) : (
                        <p className="text-slate-400 text-xs italic">Aucune classe disponible pour cette année.</p>
                    )}
                </div>
            </div>

            {/* Zone d'affectation */}
            {selectedClassroom ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-xl font-black text-slate-800">
                                Répartition des cours : <span className="text-blue-600">{selectedClassroom.displayName || selectedClassroom.name}</span>
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {courseConfigs.length > 0 ? (
                                    courseConfigs.map(config => (
                                        <CourseAssignmentCard 
                                            key={config.id} 
                                            courseConfig={config} 
                                            assignment={assignments.find(a => a.courseAssignmentId === config.id)}
                                            onAssign={(c) => { 
                                                setSelectedCourseToAssign(c); 
                                                setAssignmentToEdit(null);
                                                setIsModalOpen(true); 
                                            }}
                                            onEdit={(c, a) => {
                                                setSelectedCourseToAssign(c);
                                                setAssignmentToEdit(a);
                                                setIsModalOpen(true);
                                            }}
                                            onUnassign={handleUnassign}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold uppercase text-xs">Aucun cours configuré pour ce niveau</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <AlertCircle size={64} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Veuillez choisir une classe pour commencer</p>
                </div>
            )}

            <AssignTeacherModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setAssignmentToEdit(null);
                }}
                courseConfig={selectedCourseToAssign}
                classroomId={selectedClassroom?.id}
                academicYearId={activeYear?.id}
                existingAssignment={assignmentToEdit}
                onSuccess={() => handleClassroomSelect(selectedClassroom)} 
            />
        </div>
    );
};

export default TeacherAssignment;