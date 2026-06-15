import React, { useState, useEffect } from 'react';
import MyStudentCoursesService from '../../../services/pedagogieService/MyStudentCoursesService';
import { BookOpen, Search, Layers, Compass, Loader2, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';
import MyStudentCourseModal from './MyStudentCourseModal';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [classroomName, setClassroomName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- ÉTATS POUR LE MODAL ---
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Chargement dynamique des données depuis le Backend
    const fetchStudentCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await MyStudentCoursesService.getMyCourses();
            
            // SÉCURITÉ ABSOLUE : On vérifie si data est directement un tableau (ancienne version) 
            // ou un objet contenant la classe et les cours (nouvelle version du service)
            let loadedCourses = [];
            let roomName = '';

            if (Array.isArray(data)) {
                loadedCourses = data;
            } else if (data && typeof data === 'object') {
                loadedCourses = data.courses || [];
                // Décodage optionnel au cas où le backend envoie des caractères spéciaux dans l'en-tête HTTP
                roomName = data.classroomDisplayName ? decodeURIComponent(data.classroomDisplayName) : '';
            }

            setCourses(loadedCourses);
            setFilteredCourses(loadedCourses);
            setClassroomName(roomName);

        } catch (err) {
            setError("Impossible de charger votre programme de cours. Veuillez vérifier votre connexion ou réessayer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentCourses();
    }, []);

    // Filtrage dynamique en temps réel pour la recherche et tri par Domaine/Sous-Domaine
    useEffect(() => {
        // Sécurité : On s'assure que courses est toujours un tableau
        const currentCourses = courses || [];

        // 1. Filtrage des cours selon le terme de recherche
        const filtered = currentCourses.filter(course =>
            (course?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (course?.domainName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (course?.subDomainName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

        // 2. Tri intelligent : Regroupement par Domaine puis par Sous-Domaine
        const sorted = [...filtered].sort((a, b) => {
            const domainA = (a?.domainName || '').toLowerCase();
            const domainB = (b?.domainName || '').toLowerCase();
            
            // Si les domaines sont différents, on trie par Domaine
            if (domainA !== domainB) {
                return domainA.localeCompare(domainB);
            }
            
            // Si les domaines sont identiques, on trie par Sous-Domaine
            const subDomainA = (a?.subDomainName || '').toLowerCase();
            const subDomainB = (b?.subDomainName || '').toLowerCase();
            return subDomainA.localeCompare(subDomainB);
        });

        setFilteredCourses(sorted);
    }, [searchTerm, courses]);

    // --- FONCTION POUR OUVRIR LE MODAL ---
    const handleOpenModal = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // Constante sécurisée pour le comptage
    const coursesCount = filteredCourses?.length || 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            
            {/* EN-TÊTE : Dégradé Vert et Bleu de nuit */}
            <div className="relative overflow-hidden mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-slate-900 dark:from-emerald-500 dark:to-slate-900 text-white shadow-xl shadow-slate-200/50 dark:shadow-none w-full">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10">
                    <GraduationCap size={240} />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/20 text-emerald-100 backdrop-blur-sm">
                            Espace Élève
                        </span>
                        {/* Affichage dynamique du nom de la classe si disponible */}
                        {classroomName && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/30 text-emerald-50 border border-emerald-400/20 backdrop-blur-sm animate-fade-in">
                                {classroomName}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Mon Programme d'Études
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-emerald-100/80 max-w-xl font-medium">
                        Retrouvez ici l'ensemble des matières et cours programmés pour votre classe au cours de cette année scolaire.
                    </p>
                </div>
            </div>

            {/* BARRE D'ACTIONS ET DE RECHERCHE */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 transition-colors shadow-sm w-full">
                <div className="relative w-full sm:max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher une matière, un domaine..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        {coursesCount} {coursesCount > 1 ? 'Matières affectées' : 'Matière affectée'}
                    </span>
                    <button 
                        onClick={fetchStudentCourses}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        title="Actualiser la liste"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ÉTAT DE CHARGEMENT */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 transition-colors w-full flex-1">
                    <Loader2 size={40} className="animate-spin text-emerald-500 dark:text-emerald-400" />
                    <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                        Récupération de vos cours depuis le serveur...
                    </p>
                </div>
            )}

            {/* ÉTAT D'ERREUR */}
            {!loading && error && (
                <div className="p-6 flex flex-col items-center justify-center text-center bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-3xl w-full flex-1">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                        <AlertCircle size={28} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">Une erreur est survenue</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
                    <button 
                        onClick={fetchStudentCourses}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20"
                    >
                        Réessayer le chargement
                    </button>
                </div>
            )}

            {/* ÉTAT : AUCUNE DONNÉE TROUVÉE */}
            {!loading && !error && coursesCount === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 transition-colors w-full flex-1">
                    <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        <BookOpen size={36} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">Aucun cours disponible</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        {searchTerm ? "Aucun cours ne correspond à vos critères de recherche." : "Vous n'êtes inscrit dans aucun cours pour le moment ou les configurations de votre classe sont incomplètes."}
                    </p>
                </div>
            )}

            {/* TABLEAU PREMIUM : LARGEUR MAXIMALE */}
            {!loading && !error && coursesCount > 0 && (
                <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300 overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            {/* En-tête avec dégradé Vert et Bleu de nuit */}
                            <thead>
                                <tr className="bg-gradient-to-r from-emerald-600 to-slate-900 dark:from-emerald-500 dark:to-slate-900 text-white border-none">
                                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider w-16 text-center">N°</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-24">ID/Réf</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-1/3">Intitulé du Cours</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-1/4">Domaine d'Étude</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-1/4">Sous-Domaine</th>
                                </tr>
                            </thead>
                            
                            {/* Corps du tableau */}
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredCourses?.map((course, index) => (
                                    <tr 
                                        key={course?.id || index}
                                        onClick={() => handleOpenModal(course)}
                                        className="group hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors duration-200 cursor-pointer"
                                    >
                                        {/* 1ère Colonne : Numéro d'ordre */}
                                        <td className="py-4 px-5 whitespace-nowrap text-center font-mono text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {String(index + 1).padStart(2, '0')}
                                        </td>

                                        {/* Colonne ID (Badge Orange) */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 font-mono">
                                                #{course?.id || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Colonne Nom du cours */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 transition-colors duration-200 shrink-0">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base">
                                                    {course?.name || 'Nom inconnu'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Colonne Domaine */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {course?.domainName ? (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold bg-slate-100/50 dark:bg-slate-800/40 px-2.5 py-1 rounded-xl w-fit border border-slate-200/40 dark:border-slate-700/30">
                                                    <Layers size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
                                                    <span>{course.domainName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 italic text-xs">Non défini</span>
                                            )}
                                        </td>

                                        {/* Colonne Sous-Domaine */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {course?.subDomainName ? (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                                    <Compass size={14} className="text-orange-500 shrink-0" />
                                                    <span>{course.subDomainName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 italic text-xs">Non défini</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- LE MODAL INTÉGRÉ --- */}
            <MyStudentCourseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                course={selectedCourse} 
            />

        </div>
    );
};

export default StudentCourses;