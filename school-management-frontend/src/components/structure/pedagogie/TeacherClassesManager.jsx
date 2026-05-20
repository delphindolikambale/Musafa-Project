import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Users, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react';
import { enrollmentService } from '../../../services/enrollmentService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';
import ClassWorkspace from './ClassWorkspace';

const TeacherClassesManager = () => {
    const [activeYear, setActiveYear] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // Extraction de l'utilisateur au niveau global du composant pour être accessible partout
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                const year = await enrollmentService.getActiveYear();
                setActiveYear(year);
                
                if (!user?.teacherId) return;

                const assignmentsRes = await TeacherAssignmentService.getAssignmentsByTeacher(user.teacherId, year.id);
                const fetchedAssignments = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes?.data || []);
                setAssignments(fetchedAssignments);
            } catch (error) {
                console.error("Erreur lors de la récupération des affectations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [user?.teacherId]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-900">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement de vos classes...</span>
            </div>
        );
    }

    if (selectedAssignment) {
        return (
            <ClassWorkspace 
                assignment={selectedAssignment} 
                activeYear={activeYear} 
                onBack={() => setSelectedAssignment(null)} 
            />
        );
    }

    // Extraction des classes uniques basées sur le nom de la classe
    const uniqueClassrooms = Array.from(new Set(assignments.map(a => a.classroomName))).filter(Boolean);

    // Filtrage des cours correspondant à la classe sélectionnée
    const filteredAssignments = assignments.filter(a => a.classroomName === selectedClassroom);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header de l'Espace Enseignant - TAILLE AJUSTÉE ET OPTIMISÉE */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-5 rounded-2xl border border-slate-800 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <GraduationCap size={90} className="transform rotate-12" />
                </div>
                <div className="relative z-10">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        Espace Enseignant
                    </span>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight mt-2 mb-1">Mes Classes & Affectations</h1>
                    <p className="text-slate-400 text-xs max-w-xl font-medium leading-relaxed">
                        {selectedClassroom 
                            ? `Sélectionnez l'un de vos cours attribués pour la classe ${selectedClassroom} pour démarrer la gestion.`
                            : "Sélectionnez une classe ci-dessous pour gérer vos cours, planifications, évaluations et consulter les fiches de notes globales."
                        }
                    </p>
                </div>
            </div>

            {/* VUE 1 : Liste des Classes Uniques (7ème Année (A), etc.) */}
            {selectedClassroom === null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {uniqueClassrooms.length > 0 ? (
                        uniqueClassrooms.map((classroomName) => {
                            const courseCount = assignments.filter(a => a.classroomName === classroomName).length;
                            return (
                                <button
                                    key={classroomName}
                                    onClick={() => setSelectedClassroom(classroomName)}
                                    className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                                >
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                {courseCount} {courseCount > 1 ? 'Cours' : 'Cours'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {classroomName}
                                        </h3>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800/60 pt-3 w-full">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            Accéder aux cours
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-blue-600 dark:bg-slate-800 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                            <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aucune affectation trouvée</h4>
                            <p className="text-slate-400 text-xs mt-1">Vous n'avez pas encore été affecté à une matière ou classe pour l'année en cours.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* VUE 2 : Liste des cours spécifiques de la classe sélectionnée */
                <div className="space-y-4">
                    {/* Barre de navigation / Fil d'ariane avec retour vers les classes */}
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm animate-fade-in">
                        <button 
                            onClick={() => setSelectedClassroom(null)}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
                            title="Retour aux classes"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 rounded-md">
                                Liste des enseignements
                            </span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{selectedClassroom}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                        {filteredAssignments.map((assignment) => {
                            // Nettoyage intelligent du nom du cours pour éviter la tautologie
                            const cleanedSubjectName = assignment.subjectName
                                ? assignment.subjectName
                                    .replace(selectedClassroom, '') // Enlever le nom complet de la classe
                                    .replace(/\s*-\s*$/, '')        // Enlever les tirets résiduels en fin de chaîne
                                    .replace(/\s*\(\s*\)\s*$/, '')  // Enlever les parenthèses vides résiduelles
                                    .trim()
                                : '';

                            return (
                                <button
                                    key={assignment.id}
                                    onClick={() => setSelectedAssignment(assignment)}
                                    className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[145px] relative overflow-hidden"
                                >
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <BookOpen size={20} />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                Actif
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-800 dark:text-white mt-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {cleanedSubjectName || assignment.subjectName}
                                        </h3>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800/60 pt-3 w-full">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            Ouvrir l'espace
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-blue-600 dark:bg-slate-800 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                            <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherClassesManager;