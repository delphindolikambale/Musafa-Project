import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import academicService from '../../services/academicYearService'; 
import { ClassroomService } from '../../services/classroomService'; 
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService'; 

// --- IMPORTS DU THEME GLOBAL ET ICONES ---
import { ThemeContext } from '../../App';
import { Users, UserPlus, RefreshCw, User, Search, Plus, X, ChevronRight, FileText, Upload, Check } from 'lucide-react';

// --- IMPORTS DES SOUS-MODULES ---
import ReportExplorer from './ReportExplorer'; 
import ArchiveDashboard from './ArchiveDashboard'; 
import StudentArchiveDetail from './StudentArchiveDetail'; 

const EnrollmentModule = ({ students = [], onClose }) => {
    // --- LOGIQUE DU THÈME SÉCURISÉE ---
    const themeContext = useContext(ThemeContext);
    const [localDark, setLocalDark] = useState(() => {
        return localStorage.getItem('enrollment-theme') === 'dark';
    });
    
    // Priorité au thème global s'il existe, sinon on utilise le local
    const isDark = themeContext ? themeContext.theme === 'dark' : localDark;

    const toggleTheme = () => {
        if (themeContext && themeContext.toggleTheme) {
            themeContext.toggleTheme();
        } else {
            const newMode = !localDark;
            setLocalDark(newMode);
            localStorage.setItem('enrollment-theme', newMode ? 'dark' : 'light');
        }
    };

    // --- NAVIGATION ---
    const navigate = useNavigate(); 

    // --- ÉTATS ---
    const [enrollments, setEnrollments] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [localStudents, setLocalStudents] = useState([]); 
    const [activeYear, setActiveYear] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [viewMode, setViewMode] = useState('list'); 
    const [selectedArchiveMatricule, setSelectedArchiveMatricule] = useState(null);

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null); 
    
    const [currentStep, setCurrentStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [filterClass, setFilterClass] = useState("ALL");
    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [dynamicDocs, setDynamicDocs] = useState([{ label: '', file: null }]);

    const [enrollmentData, setEnrollmentData] = useState({
        classroomId: "",
        enrollmentType: "NOUVEAU",
    });

    // --- UTILITAIRES ---
    const normalizeText = (text) => 
        String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const getGenderDisplay = (raw) => {
        if (!raw || raw === "N/A") return "N/A";
        const g = String(raw).toUpperCase().trim();
        if (["MASCULIN", "MALE", "M", "GARCON", "GARÇON", "1"].includes(g)) return "M";
        if (["FEMININ", "FÉMININ", "FEMALE", "F", "FILLE", "2"].includes(g)) return "F";
        return "N/A";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const pureDate = dateString.split('T')[0];
            const [year, month, day] = pureDate.split('-');
            if (day && month && year) return `${day}/${month}/${year}`;
            return "-";
        } catch (e) { return "-"; }
    };

    const formatClassName = useCallback((cls) => {
        if (!cls) return "Non affecté";
        const levelName = cls.level?.name || cls.levelName || "";
        const sectionName = cls.section?.sectionName || cls.sectionName || "";
        const optionName = cls.option?.optionName || cls.optionName || "";
        const division = cls.division ? `(${cls.division})` : "";
        const isTroncCommun = levelName.includes("7") || levelName.includes("8");
        let fullName = levelName;
        if (!isTroncCommun) {
            if (sectionName && !sectionName.toLowerCase().includes("aucune")) fullName += ` ${sectionName}`;
            if (optionName && !optionName.toLowerCase().includes("aucune")) fullName += ` ${optionName}`;
        }
        if (division) fullName += ` ${division}`;
        return fullName.replace(/\s+/g, ' ').trim() || `Classe #${cls.id}`;
    }, []);

    // --- CHARGEMENT DES DONNÉES ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const yRes = await academicService.getAllAcademicYears();
            
            const extract = (res) => {
                if (!res) return [];
                const data = res.data || res;
                if (Array.isArray(data)) return data;
                if (data.content && Array.isArray(data.content)) return data.content;
                return [];
            };

            const cleanYears = extract(yRes);
            const active = cleanYears.find(y => y.active || y.status === 'ACTIVE');
            const currentActiveYear = active || (cleanYears.length > 0 ? cleanYears[0] : null);
            setActiveYear(currentActiveYear);

            const [eRes, cRes, sRes] = await Promise.all([
                currentActiveYear ? enrollmentService.getAllEnrollments(currentActiveYear.id) : enrollmentService.getAllEnrollments(),
                ClassroomService.getAll(),
                studentService.getAll() 
            ]);

            setEnrollments(extract(eRes));
            setClassrooms(extract(cRes));
            setLocalStudents(extract(sRes)); 

        } catch (err) { 
            console.error("Erreur Chargement:", err);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // --- LOGIQUE DE CALCUL, TRI INTELLIGENT & FILTRE ---
    const allEnrichedEnrollments = useMemo(() => {
        const source = (students && students.length > 0) ? students : localStudents;
        return enrollments.map(en => {
            const sId = en.studentId || en.student?.id;
            const studentRef = source.find(s => 
                String(s.id) === String(sId) || 
                (en.matricule && String(s.matricule) === String(en.matricule))
            );
            
            let fullName = "ÉLÈVE INCONNU";
            if (studentRef) {
                fullName = `${studentRef.lastName || ''} ${studentRef.postName || ''} ${studentRef.firstName || ''}`.trim().toUpperCase();
            } else if (en.studentFullName) {
                fullName = en.studentFullName.toUpperCase();
            }
            
            const rawGender = en.gender || studentRef?.gender || studentRef?.sexe || "N/A";
            const rawType = en.enrollmentType || "NOUVEAU"; 

            return {
                ...en,
                studentRaw: studentRef, 
                displayMatricule: en.matricule || studentRef?.matricule || "SANS MAT.",
                displayFullName: fullName,
                displayGender: getGenderDisplay(rawGender),
                displayClassname: en.classroomName || formatClassName(classrooms.find(c => String(c.id) === String(en.classroomId))),
                displayEnrollmentType: String(rawType).toUpperCase(),
                displayDate: en.enrollmentDate || en.createdAt || new Date().toISOString(),
                computedClassId: String(en.classroomId || en.classroom?.id || "")
            };
        })
        .sort((a, b) => new Date(b.createdAt || b.displayDate) - new Date(a.createdAt || a.displayDate));
    }, [enrollments, students, localStudents, classrooms, formatClassName]);

    const filteredEnrollments = useMemo(() => {
        let data = allEnrichedEnrollments;
        
        if (filterClass !== "ALL") {
            data = data.filter(en => String(en.computedClassId) === String(filterClass));
        }

        if (searchTerm.trim() !== "") {
            const term = normalizeText(searchTerm);
            data = data.filter(en => 
                normalizeText(en.displayFullName).includes(term) ||
                normalizeText(en.displayMatricule).includes(term)
            );
        }

        return data;
    }, [allEnrichedEnrollments, filterClass, searchTerm]);

    const eligibleStudents = useMemo(() => {
        const source = (students && students.length > 0) ? students : localStudents;
        const enrolledIds = new Set(enrollments.map(e => String(e.studentId || e.student?.id)));
        const unrecorded = source.filter(s => !enrolledIds.has(String(s.id)));
        
        if (!searchTerm.trim()) return unrecorded;
        const term = normalizeText(searchTerm);
        return unrecorded.filter(s => 
            normalizeText(`${s.lastName} ${s.postName} ${s.firstName}`).includes(term) ||
            normalizeText(s.matricule).includes(term)
        );
    }, [searchTerm, students, localStudents, enrollments]);

    const stats = useMemo(() => {
        const total = filteredEnrollments.length;
        const nouveaux = filteredEnrollments.filter(e => e.displayEnrollmentType === 'NOUVEAU').length;
        const reinscrits = filteredEnrollments.filter(e => e.displayEnrollmentType === 'REINSCRIPTION').length;
        
        const fCount = filteredEnrollments.filter(e => e.displayGender === 'F').length;
        const mCount = filteredEnrollments.filter(e => e.displayGender === 'M').length;
        
        return { total, nouveaux, reinscrits, f: fCount, g: mCount };
    }, [filteredEnrollments]);

    // --- ACTIONS ---
    const handleEnrollment = async () => {
        const studentId = selectedStudent?.id || (isEditMode ? allEnrichedEnrollments.find(e => e.id === selectedEnrollmentId)?.studentId : null);
        if (!activeYear?.id || !enrollmentData.classroomId || !studentId) {
            return alert("Erreur : Elève ou Classe manquante.");
        }
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('studentId', studentId);
            formData.append('academicYearId', activeYear.id);
            formData.append('classroomId', enrollmentData.classroomId);
            formData.append('enrollmentType', enrollmentData.enrollmentType);
            
            const now = new Date();
            const localDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            formData.append('enrollmentDate', localDateString);

            const labels = dynamicDocs.map(d => d.label || "Document").join(";");
            formData.append('documentsPresented', labels);
            
            dynamicDocs.forEach(d => { if(d.file) formData.append('files', d.file); });

            if (isEditMode) {
                await enrollmentService.updateEnrollment(selectedEnrollmentId, formData);
                alert("Inscription modifiée avec succès.");
            } else {
                await enrollmentService.createEnrollment(formData);
                alert("✅ Inscription validée ! Le profil financier a été généré automatiquement.");
            }

            closeWizard();
            await loadData(); 
        } catch (err) { 
            alert("Une erreur est survenue lors de l'enregistrement.");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr ? L'élève redeviendra 'Non inscrit'.")) {
            setLoading(true);
            try {
                await enrollmentService.deleteEnrollment(id);
                await loadData();
            } catch (err) { alert("Erreur lors de la suppression."); }
            finally { setLoading(false); }
        }
    };

    const openEditWizard = (en) => {
        const source = (students && students.length > 0) ? students : localStudents;
        const studentObj = en.studentRaw || source.find(s => String(s.id) === String(en.studentId || en.student?.id));
        setSelectedStudent(studentObj || { id: en.studentId, lastName: en.displayFullName, firstName: "" });
        
        setEnrollmentData({
            classroomId: String(en.classroomId || en.classroom?.id || ""),
            enrollmentType: en.enrollmentType || "NOUVEAU"
        });

        if (en.documentsPresented) {
            setDynamicDocs(en.documentsPresented.split(";").map(label => ({ label, file: null })));
        } else {
            setDynamicDocs([{ label: '', file: null }]);
        }
        setSelectedEnrollmentId(en.id);
        setIsEditMode(true);
        setIsWizardOpen(true);
        setCurrentStep(2); 
    };

    const closeWizard = () => {
        setIsWizardOpen(false);
        setIsEditMode(false);
        setSelectedStudent(null);
        setCurrentStep(1);
        setSearchTerm("");
        setDynamicDocs([{ label: '', file: null }]);
    };

    const switchTab = (mode) => {
        setViewMode(mode);
        setSelectedArchiveMatricule(null);
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
            
            {/* --- HEADER ÉPURÉ (Style Dashboard Moderne) --- */}
            <header className={`px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={onClose ? onClose : () => navigate(-1)} 
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors border ${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                        ←
                    </button>
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Gestion des Inscriptions
                        </h1>
                        <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Pilotage des effectifs • Année {activeYear?.annee || 'En cours'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                        onClick={() => { 
                            setIsEditMode(false); 
                            setCurrentStep(1); 
                            setDynamicDocs([{ label: '', file: null }]); 
                            setEnrollmentData({ classroomId: "", enrollmentType: "NOUVEAU" }); 
                            setSelectedStudent(null); 
                            setIsWizardOpen(true); 
                        }} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Nouvelle Inscription
                    </button>
                </div>
            </header>

            {/* --- BARRE DE NAVIGATION & FILTRES --- */}
            <nav className={`px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 ${isDark ? 'bg-slate-900' : 'bg-transparent'}`}>
                <div className={`flex p-1 rounded-xl w-full lg:w-auto overflow-x-auto border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <button onClick={() => switchTab('list')} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-900') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Liste Globale</button>
                    <button onClick={() => switchTab('grid')} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-900') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Effectifs Classes</button>
                    <button onClick={() => switchTab('reports')} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${viewMode === 'reports' ? (isDark ? 'bg-blue-900/50 text-blue-400 shadow-sm' : 'bg-blue-50 text-blue-700') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Archives Rapports</button>
                    <button onClick={() => switchTab('archives')} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${viewMode === 'archives' ? (isDark ? 'bg-blue-900/50 text-blue-400 shadow-sm' : 'bg-blue-50 text-blue-700') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Dossiers Élèves</button>
                </div>
                
                {viewMode !== 'reports' && viewMode !== 'archives' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Rechercher élève..." 
                                className={`w-full pl-10 pr-4 py-2 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500 shadow-sm'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            value={filterClass} 
                            onChange={(e) => setFilterClass(e.target.value)} 
                            className={`w-full sm:w-48 border rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500 shadow-sm'}`}
                        >
                            <option value="ALL">Toutes les classes</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{formatClassName(c)}</option>)}
                        </select>
                    </div>
                )}
            </nav>

            {/* --- ZONE DE CONTENU PRINCIPALE --- */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                {viewMode === 'reports' ? (
                    <ReportExplorer onBack={() => setViewMode('list')} />
                ) : viewMode === 'archives' ? (
                    <div className="space-y-4">
                        {selectedArchiveMatricule ? (
                            <div className="flex flex-col">
                                <button onClick={() => setSelectedArchiveMatricule(null)} className="self-start bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors">← Retour</button>
                                <StudentArchiveDetail matricule={selectedArchiveMatricule} isEmbedded={true} />
                            </div>
                        ) : (
                            <ArchiveDashboard onOpenStudent={(matricule) => setSelectedArchiveMatricule(matricule)} />
                        )}
                    </div>
                ) : (
                    <>
                        {/* --- CARTES STATISTIQUES (Minimalistes & Claires) --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <StatCard 
                                label="Total Inscrits" 
                                value={stats.total} 
                                isDark={isDark}
                                colorTheme="blue"
                                icon={<Users size={20} />} 
                            />
                            <StatCard 
                                label="Nouveaux" 
                                value={stats.nouveaux} 
                                isDark={isDark}
                                colorTheme="emerald"
                                icon={<UserPlus size={20} />} 
                            />
                            <StatCard 
                                label="Réinscriptions" 
                                value={stats.reinscrits} 
                                isDark={isDark}
                                colorTheme="amber"
                                icon={<RefreshCw size={20} />} 
                            />
                            <StatCard 
                                label="Ratio F/G" 
                                value={`${stats.f} ♀ / ${stats.g} ♂`} 
                                isDark={isDark}
                                colorTheme="purple"
                                icon={<User size={20} />} 
                            />
                        </div>

                        {/* --- TABLEAU DE DONNÉES (Design SaaS) --- */}
                        {viewMode === 'list' ? (
                            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-slate-900/50 text-slate-400 border-b border-slate-700' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}`}>
                                            <tr>
                                                <th className="py-4 px-5">Matricule</th>
                                                <th className="py-4 px-5">Nom Complet</th>
                                                <th className="py-4 px-5">Genre</th>
                                                <th className="py-4 px-5">Classe Affectée</th>
                                                <th className="py-4 px-5">Type d'Inscription</th>
                                                <th className="py-4 px-5">Date d'Inscription</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                            {filteredEnrollments.length > 0 ? (
                                                filteredEnrollments.map(en => (
                                                    <tr key={en.id} className={`transition-colors group ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                                                        <td className={`py-4 px-5 font-medium text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                            {en.displayMatricule}
                                                        </td>
                                                        <td className={`py-4 px-5 font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                            {en.displayFullName}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${en.displayGender === 'F' ? (isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600') : (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                                                                {en.displayGender}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 px-5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                            {en.displayClassname}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${en.displayEnrollmentType === 'NOUVEAU' ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700')}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${en.displayEnrollmentType === 'NOUVEAU' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                                {en.displayEnrollmentType === 'NOUVEAU' ? 'Nouveau' : 'Réinscription'}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 px-5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {formatDate(en.displayDate)}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openEditWizard(en)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-amber-400' : 'text-slate-400 hover:bg-slate-100 hover:text-amber-600'}`}>
                                                                    ✏️
                                                                </button>
                                                                <button onClick={() => handleDelete(en.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-red-400' : 'text-slate-400 hover:bg-slate-100 hover:text-red-600'}`}>
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className={`py-12 text-center text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Aucun élève trouvé.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* --- VUE GRILLE : EFFECTIFS CLASSES --- */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {classrooms.map(cls => {
                                    const realCount = allEnrichedEnrollments.filter(en => String(en.computedClassId) === String(cls.id)).length;
                                    const capacity = cls.capacity || 0;
                                    const percentage = capacity > 0 ? Math.min((realCount / capacity) * 100, 100) : 0;
                                    
                                    return (
                                        <div key={cls.id} className={`p-6 rounded-2xl border shadow-sm transition-transform hover:-translate-y-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatClassName(cls)}</h3>
                                                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Local: {cls.roomName || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{realCount}</span>
                                                        <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {capacity}</span>
                                                    </div>
                                                    <span className={`text-xs font-bold ${percentage >= 100 ? 'text-red-500' : 'text-blue-500'}`}>{Math.round(percentage)}%</span>
                                                </div>
                                                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                                    <div className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* --- WIZARD MODAL (Design Épuré) --- */}
            {isWizardOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-xl relative border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {isEditMode ? "Modifier l'inscription" : (currentStep === 1 ? "1. Sélection de l'Élève" : "2. Affectation de Classe")}
                            </h2>
                            <button onClick={closeWizard} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <X size={20} />
                            </button>
                        </div>

                        {currentStep === 1 ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher par nom ou matricule..."
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                <div className={`max-h-64 overflow-y-auto rounded-xl border ${isDark ? 'border-slate-700 divide-slate-700' : 'border-slate-200 divide-slate-100'} divide-y`}>
                                    {eligibleStudents.length > 0 ? (
                                        eligibleStudents.map(s => (
                                            <div 
                                                key={s.id} 
                                                onClick={() => { setSelectedStudent(s); setCurrentStep(2); }}
                                                className={`p-4 cursor-pointer flex justify-between items-center transition-colors group ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                            >
                                                <div>
                                                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {s.lastName} {s.postName} {s.firstName}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Matricule: {s.matricule || 'N/A'}
                                                    </p>
                                                </div>
                                                <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`p-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Aucun élève disponible trouvé.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Résumé Élève sélectionné */}
                                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>
                                        {selectedStudent?.lastName?.charAt(0) || 'E'}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Élève sélectionné</p>
                                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {selectedStudent?.lastName} {selectedStudent?.postName} {selectedStudent?.firstName}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Classe d'affectation <span className="text-red-500">*</span></label>
                                        <select 
                                            value={enrollmentData.classroomId}
                                            onChange={e => setEnrollmentData({...enrollmentData, classroomId: e.target.value})}
                                            className={`w-full p-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                                        >
                                            <option value="">-- Choisir une classe --</option>
                                            {classrooms.map(c => (
                                                <option key={c.id} value={c.id}>{formatClassName(c)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type d'inscription <span className="text-red-500">*</span></label>
                                        <select 
                                            value={enrollmentData.enrollmentType}
                                            onChange={e => setEnrollmentData({...enrollmentData, enrollmentType: e.target.value})}
                                            className={`w-full p-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                                        >
                                            <option value="NOUVEAU">Nouveau</option>
                                            <option value="REINSCRIPTION">Réinscription</option>
                                        </select>
                                    </div>

                                    {/* Documents Optionnels */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Documents liés (Optionnel)</label>
                                            <button type="button" onClick={() => setDynamicDocs([...dynamicDocs, {label:'', file:null}])} className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                                + Ajouter
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {dynamicDocs.map((doc, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <FileText size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Nom du document..."
                                                            value={doc.label}
                                                            onChange={(e) => {
                                                                const newDocs = [...dynamicDocs];
                                                                newDocs[idx].label = e.target.value;
                                                                setDynamicDocs(newDocs);
                                                            }}
                                                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                                        />
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        id={`file-${idx}`} 
                                                        onChange={(e) => {
                                                            const newDocs = [...dynamicDocs];
                                                            newDocs[idx].file = e.target.files[0];
                                                            setDynamicDocs(newDocs);
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`file-${idx}`} 
                                                        className={`px-4 rounded-xl border cursor-pointer flex items-center justify-center transition-colors ${doc.file ? (isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-600 border-emerald-200') : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}
                                                        title={doc.file ? doc.file.name : "Joindre un fichier"}
                                                    >
                                                        {doc.file ? <Check size={16} /> : <Upload size={16} />}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={`flex justify-end gap-3 mt-8 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    {!isEditMode && (
                                        <button onClick={() => setCurrentStep(1)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                            Précédent
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleEnrollment} 
                                        disabled={loading || !enrollmentData.classroomId} 
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        {loading ? 'Traitement...' : (isEditMode ? 'Mettre à jour' : 'Valider l\'inscription')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPOSANT INTERNE : CARTES STATISTIQUES (DESIGN SAAS) ---
const StatCard = ({ label, value, icon, isDark, colorTheme }) => {
    // Définition des couleurs douces selon le thème passé
    const themes = {
        blue: {
            bgLight: 'bg-blue-50', textLight: 'text-blue-600',
            bgDark: 'bg-blue-500/10', textDark: 'text-blue-400'
        },
        emerald: {
            bgLight: 'bg-emerald-50', textLight: 'text-emerald-600',
            bgDark: 'bg-emerald-500/10', textDark: 'text-emerald-400'
        },
        amber: {
            bgLight: 'bg-amber-50', textLight: 'text-amber-600',
            bgDark: 'bg-amber-500/10', textDark: 'text-amber-400'
        },
        purple: {
            bgLight: 'bg-purple-50', textLight: 'text-purple-600',
            bgDark: 'bg-purple-500/10', textDark: 'text-purple-400'
        }
    };
    
    const activeTheme = themes[colorTheme] || themes.blue;

    return (
        <div className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-0.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? `${activeTheme.bgDark} ${activeTheme.textDark}` : `${activeTheme.bgLight} ${activeTheme.textLight}`}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
            </div>
        </div>
    );
};

export default EnrollmentModule;