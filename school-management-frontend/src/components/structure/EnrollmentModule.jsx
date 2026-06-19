import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import academicService from '../../services/academicYearService'; 
import { ClassroomService } from '../../services/classroomService'; 
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService'; 

// --- IMPORTS DU THEME GLOBAL ET ICONES ---
import { ThemeContext } from '../../App';
import { Users, UserPlus, RefreshCw, PieChart, User } from 'lucide-react';

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
                displayMatricule: en.matricule || studentRef?.matricule || "SANS MAT.L",
                displayFullName: fullName,
                displayGender: getGenderDisplay(rawGender),
                displayClassname: en.classroomName || formatClassName(classrooms.find(c => String(c.id) === String(en.classroomId))),
                displayEnrollmentType: String(rawType).toUpperCase(),
                displayDate: en.enrollmentDate || en.createdAt || new Date().toISOString(),
                computedClassId: String(en.classroomId || en.classroom?.id || "")
            };
        })
        // Tri intelligent : Les élèves inscrits récemment s'affichent en premier lieu
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
        <div className={`w-full h-full flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
            
            {/* Header épuré et aligné */}
            <header className={`px-4 md:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b ${isDark ? 'bg-[#1E293B]/40 border-slate-800' : 'bg-white border-slate-200'} shrink-0`}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button onClick={onClose ? onClose : () => navigate(-1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>←</button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-2">
                            <span className="text-[#38BDF8]">Préfet d'Inscription</span>
                        </h1>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Gestion & Pilotage des Effectifs</p>
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
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1E293B] to-[#10B981] hover:from-[#10B981] hover:to-[#059669] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95"
                    >
                        + NOUVELLE INSCRIPTION
                    </button>
                </div>
            </header>

            {/* Barre de navigation interne et filtres */}
            <nav className={`border-b px-4 md:px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 ${isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`flex p-1 rounded-2xl w-full lg:w-auto overflow-x-auto ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <button onClick={() => switchTab('list')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'list' ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700'}`}>LISTE GLOBALE</button>
                    <button onClick={() => switchTab('grid')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'grid' ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700'}`}>EFFECTIFS CLASSES</button>
                    <button onClick={() => switchTab('reports')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'reports' ? 'bg-[#38BDF8] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>ARCHIVES RAPPORTS</button>
                    <button onClick={() => switchTab('archives')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'archives' ? 'bg-[#38BDF8] text-white shadow-xl' : 'text-[#38BDF8] hover:bg-blue-50'}`}>📁 DOSSIERS ÉLÈVES</button>
                </div>
                
                {viewMode !== 'reports' && viewMode !== 'archives' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher nom ou matricule..." 
                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none font-bold text-[11px] transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-[#10B981]' : 'bg-slate-50 border-slate-200 focus:border-[#10B981]'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={`w-full sm:w-48 border rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                            <option value="ALL">TOUTES LES CLASSES</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{formatClassName(c)}</option>)}
                        </select>
                    </div>
                )}
            </nav>

            {/* Zone de contenu principale fluide (totalement responsive sous sidebar) */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                {viewMode === 'reports' ? (
                    <ReportExplorer onBack={() => setViewMode('list')} />
                ) : viewMode === 'archives' ? (
                    <div className="space-y-4">
                        {selectedArchiveMatricule ? (
                            <div className="flex flex-col">
                                <button onClick={() => setSelectedArchiveMatricule(null)} className="self-start bg-slate-800 text-white px-6 py-2 rounded-xl text-[10px] font-black mb-4">← RETOUR</button>
                                <StudentArchiveDetail matricule={selectedArchiveMatricule} isEmbedded={true} />
                            </div>
                        ) : (
                            <ArchiveDashboard onOpenStudent={(matricule) => setSelectedArchiveMatricule(matricule)} />
                        )}
                    </div>
                ) : (
                    <>
                        {/* CARTES STATISTIQUES REVISITÉES PLUS PETITES ET NOUVELLES COULEURS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <StatCard 
                                label="Total Inscrits" 
                                value={stats.total} 
                                subValue={`Année Active : ${activeYear?.annee || 'En cours'}`} 
                                color="bg-gradient-to-r from-[#0F172A] to-[#10B981]" 
                                icon={<Users size={22} />} 
                            />
                            <StatCard 
                                label="Nouveaux" 
                                value={stats.nouveaux} 
                                color="bg-gradient-to-r from-[#0F172A] to-[#EA580C]" 
                                icon={<UserPlus size={22} />} 
                            />
                            <StatCard 
                                label="Réinscriptions" 
                                value={stats.reinscrits} 
                                color="bg-gradient-to-r from-blue-600 to-[#38BDF8]" 
                                icon={<RefreshCw size={22} />} 
                            />
                            <StatCard 
                                label="Ratio Genre (M/F)" 
                                value={`${stats.g} ♂ / ${stats.f} ♀`} 
                                subValue="Filles & Garçons" 
                                color="bg-gradient-to-r from-[#10B981] to-[#3B82F6]" 
                                icon={<div className="flex -space-x-1.5"><User size={20} className="opacity-90" /><User size={20} className="opacity-60" /></div>} 
                            />
                        </div>

                        {/* TABLEAU AVEC BORDURE DÉGRADÉE VERT & BLEU DE NUIT */}
                        {viewMode === 'list' ? (
                            <div className={`rounded-2xl shadow-xl border overflow-hidden ${isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead className={`text-[10px] font-black uppercase sticky top-0 z-10 relative`}>
                                            <tr className="border-b-4 border-transparent bg-gradient-to-r from-[#0F172A] to-[#10B981] text-white">
                                                <th className="p-4 md:p-5">Matricule</th>
                                                <th className="p-4 md:p-5">Nom Complet</th>
                                                <th className="p-4 md:p-5 text-center">Genre</th>
                                                <th className="p-4 md:p-5">Classe Affectée</th>
                                                <th className="p-4 md:p-5">Type d'Inscription</th>
                                                <th className="p-4 md:p-5">Date d'Inscription</th>
                                                <th className="p-4 md:p-5 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                            {filteredEnrollments.length > 0 ? (
                                                filteredEnrollments.map(en => (
                                                    <tr key={en.id} className={`transition-colors group ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                                                        <td className="p-4 md:p-5 font-black text-[#10B981]">{en.displayMatricule}</td>
                                                        <td className={`p-4 md:p-5 font-bold uppercase text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{en.displayFullName}</td>
                                                        <td className="p-4 md:p-5 text-center">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${en.displayGender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{en.displayGender}</span>
                                                        </td>
                                                        <td className={`p-4 md:p-5 font-bold text-[10px] italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{en.displayClassname}</td>
                                                        <td className="p-4 md:p-5">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${en.displayEnrollmentType === 'NOUVEAU' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {en.displayEnrollmentType}
                                                            </span>
                                                        </td>
                                                        <td className={`p-4 md:p-5 font-bold text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(en.displayDate)}</td>
                                                        <td className="p-4 md:p-5">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => openEditWizard(en)} className={`p-2 rounded-lg transition-colors shadow-sm ${isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>✏️</button>
                                                                <button onClick={() => handleDelete(en.id)} className={`p-2 rounded-lg transition-colors shadow-sm ${isDark ? 'bg-slate-800 text-red-400 hover:bg-red-950/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>🗑️</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="7" className="p-20 text-center font-bold text-slate-400 italic">Aucun élève enregistré pour le moment.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* EFFÉCTIFS PAR GRILLE DE CLASSE */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {classrooms.map(cls => {
                                    const realCount = allEnrichedEnrollments.filter(en => String(en.computedClassId) === String(cls.id)).length;
                                    const capacity = cls.capacity || 0;
                                    const percentage = capacity > 0 ? Math.min((realCount / capacity) * 100, 100) : 0;
                                    return (
                                        <div key={cls.id} className={`p-6 rounded-2xl shadow-xl border-t-4 border-[#10B981] flex flex-col justify-between hover:scale-[1.02] transition-transform border ${isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'}`}>
                                            <div>
                                                <h3 className={`font-black text-xs md:text-sm uppercase leading-tight mb-1 ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>{formatClassName(cls)}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Local : {cls.roomName || 'N/A'}</p>
                                            </div>
                                            <div className="mt-6">
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{realCount}</span>
                                                        <span className="text-xs font-bold text-slate-400">/ {capacity} élèves</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-[#10B981]">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                                    <div className={`h-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : 'bg-[#10B981]'}`} style={{ width: `${percentage}%` }} />
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

            {/* WIZARD MODAL ASSOCIE */}
            {isWizardOpen && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border ${isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className="font-black uppercase text-xs tracking-wider">
                                {isEditMode ? "📝 Modifier Inscription" : (currentStep === 1 ? "Étape 1 : Sélection de l'Élève" : "Étape 2 : Configuration d'affectation")}
                            </h2>
                            <button onClick={closeWizard} className="text-slate-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                        {currentStep === 1 ? (
                            <div className="space-y-4">
                                <input type="text" placeholder="Saisir un nom de famille ou matricule..."
                                    className={`w-full pl-4 pr-4 py-3 rounded-xl border outline-none font-bold text-[11px] transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-[#10B981]' : 'bg-slate-50 border-slate-200 focus:border-[#10B981]'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className={`max-h-60 overflow-y-auto rounded-xl border p-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                                    {eligibleStudents.length > 0 ? (
                                        eligibleStudents.map(s => (
                                            <div key={s.id} onClick={() => setSelectedStudent(s)} className={`p-3 mb-1 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${selectedStudent?.id === s.id ? 'bg-[#10B981] text-white' : (isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700')}`}>
                                                <div>
                                                    <div className="font-bold text-xs">{s.lastName} {s.postName} {s.firstName}</div>
                                                    <div className={`text-[10px] ${selectedStudent?.id === s.id ? 'text-emerald-100' : 'text-slate-500'}`}>{s.matricule || 'N/A'} - {s.gender || s.sexe || 'N/A'}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-[10px] font-bold text-slate-400">Aucun élève trouvé.</div>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button disabled={!selectedStudent} onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-[#1E293B] to-[#10B981] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-transform active:scale-95 shadow-lg">SUIVANT →</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black mb-1 opacity-70 uppercase tracking-widest">Classe d'Affectation</label>
                                    <select value={enrollmentData.classroomId} onChange={(e) => setEnrollmentData({...enrollmentData, classroomId: e.target.value})} className={`w-full p-2.5 rounded-xl border outline-none font-bold text-[11px] ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                                        <option value="">-- Sélectionner une classe --</option>
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{formatClassName(c)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black mb-1 opacity-70 uppercase tracking-widest">Type d'Inscription</label>
                                    <select value={enrollmentData.enrollmentType} onChange={(e) => setEnrollmentData({...enrollmentData, enrollmentType: e.target.value})} className={`w-full p-2.5 rounded-xl border outline-none font-bold text-[11px] ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                                        <option value="NOUVEAU">NOUVEAU</option>
                                        <option value="REINSCRIPTION">RÉINSCRIPTION</option>
                                    </select>
                                </div>
                                <div className="flex justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={() => setCurrentStep(1)} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>← RETOUR</button>
                                    <button onClick={handleEnrollment} disabled={loading || !enrollmentData.classroomId} className="bg-gradient-to-r from-[#10B981] to-[#059669] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-transform active:scale-95 shadow-lg flex items-center gap-2">
                                        {loading ? "TRAITEMENT..." : (isEditMode ? "METTRE À JOUR" : "VALIDER L'INSCRIPTION")}
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

// COMPOSANT INTERNE : CARTES STATISTIQUES PLUS COMPACTES
const StatCard = ({ label, value, subValue, color, icon }) => (
    <div className={`${color} p-4 rounded-2xl text-white flex flex-col justify-between h-28 shadow-lg relative overflow-hidden transition-transform hover:scale-[1.02]`}>
        <div className="flex justify-between items-start relative z-10">
            <span className="opacity-80 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="bg-white/20 w-8 h-8 flex items-center justify-center rounded-xl text-sm backdrop-blur-md">{icon}</span>
        </div>
        <div className="relative z-10 mt-2">
            <div className="text-2xl font-black italic tracking-tighter">{value}</div>
            {subValue && <div className="text-[9px] font-bold opacity-70 uppercase tracking-wide mt-0.5">{subValue}</div>}
        </div>
    </div>
);

export default EnrollmentModule;