import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import academicService from '../../services/academicYearService'; 
import { ClassroomService } from '../../services/classroomService'; 
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService'; 

// --- IMPORTS DES SOUS-MODULES ---
import ReportExplorer from './ReportExplorer'; 
import ArchiveDashboard from './ArchiveDashboard'; 
import StudentArchiveDetail from './StudentArchiveDetail'; 

const EnrollmentModule = ({ students = [], onClose }) => {
    // --- LOGIQUE DU THÈME ---
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('enrollment-theme') === 'dark';
    });

    const toggleTheme = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        localStorage.setItem('enrollment-theme', newMode ? 'dark' : 'light');
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

    // --- LOGIQUE DE CALCUL & FILTRE ---
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
        });
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

            // --- ADAPTATION : Retours d'information pour la création financière ---
            if (isEditMode) {
                await enrollmentService.updateEnrollment(selectedEnrollmentId, formData);
                alert("Inscription modifiée avec succès.");
            } else {
                await enrollmentService.createEnrollment(formData);
                // Le Backend s'occupe du reste (Profil Financier + WebSocket). On informe juste l'agent.
                alert("✅ Inscription validée ! Le profil financier a été généré automatiquement et la caisse a été notifiée.");
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
        <div className={`fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
            {/* Header */}
            <header className="bg-[#0F172A] px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white border-b-4 border-[#10B981] shadow-2xl shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onClose ? onClose : () => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">←</button>
                    <div>
                        <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic">COMPLEXE SCOLAIRE <span className="text-[#38BDF8]">MUSAFA</span></h1>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Gestion des Inscriptions</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={toggleTheme} className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-90 ${isDark ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-white text-slate-600'}`}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    {/* LA CORRECTION EST ICI : enrollmentType: "NOUVEAU" */}
                    <button onClick={() => { setIsEditMode(false); setCurrentStep(1); setDynamicDocs([{ label: '', file: null }]); setEnrollmentData({ classroomId: "", enrollmentType: "NOUVEAU" }); setSelectedStudent(null); setIsWizardOpen(true); }} className="flex-1 md:flex-none bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg transition-all active:scale-95">+ NOUVELLE INSCRIPTION</button>
                </div>
            </header>

            {/* Nav avec Barre de Recherche */}
            <nav className={`border-b px-4 md:px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`flex p-1 rounded-2xl w-full lg:w-auto overflow-x-auto ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <button onClick={() => switchTab('list')} className={`flex-1 lg:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'list' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>LISTE GLOBALE</button>
                    <button onClick={() => switchTab('grid')} className={`flex-1 lg:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'grid' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>EFFECTIFS</button>
                    <button onClick={() => switchTab('reports')} className={`flex-1 lg:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'reports' ? 'bg-[#38BDF8] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>ARCHIVES RAPPORTS</button>
                    <button onClick={() => switchTab('archives')} className={`flex-1 lg:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${viewMode === 'archives' ? 'bg-[#38BDF8] text-white shadow-xl' : 'text-[#38BDF8] hover:bg-blue-50'}`}>📁 DOSSIERS ÉLÈVES</button>
                </div>
                
                {viewMode !== 'reports' && viewMode !== 'archives' && (
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full md:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Nom ou matricule..." 
                                className={`w-full pl-9 pr-4 py-2 rounded-xl border outline-none font-bold text-[11px] transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#10B981]' : 'bg-slate-50 border-slate-200 focus:border-[#10B981]'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={`w-full md:w-48 border rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-[#38BDF8] cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                            <option value="ALL">TOUTES LES CLASSES</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{formatClassName(c)}</option>)}
                        </select>
                    </div>
                )}
            </nav>

            {/* Zone de Contenu Principal Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar">
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
                        {/* CARTES STATISTIQUES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <StatCard label="Total Inscrits" value={stats.total} subValue={`Année : ${activeYear?.annee || '2025-2026'}`} color="bg-[#0F172A]" icon="👥" />
                            <StatCard label="Nouveaux" value={stats.nouveaux} color="bg-[#38BDF8]" icon="✨" />
                            <StatCard label="Réinscrits" value={stats.reinscrits} color="bg-[#1E293B]" icon="🔄" />
                            <StatCard label="Ratio Genre" value={`${stats.g}M / ${stats.f}F`} subValue="Sur liste actuelle" color="bg-[#10B981]" icon="🚻" />
                        </div>

                        {/* TABLEAU OU GRILLE */}
                        {viewMode === 'list' ? (
                            <div className={`rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border overflow-hidden ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead className={`text-[10px] font-black uppercase border-b sticky top-0 z-10 ${isDark ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500'}`}>
                                            <tr>
                                                <th className="p-4 md:p-6">Matricule</th>
                                                <th className="p-4 md:p-6">Nom Complet</th>
                                                <th className="p-4 md:p-6 text-center">Genre</th>
                                                <th className="p-4 md:p-6">Classe</th>
                                                <th className="p-4 md:p-6">Type</th>
                                                <th className="p-4 md:p-6">Date</th>
                                                <th className="p-4 md:p-6 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                            {filteredEnrollments.length > 0 ? (
                                                filteredEnrollments.map(en => (
                                                    <tr key={en.id} className={`transition-colors group ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-blue-50/40'}`}>
                                                        <td className="p-4 md:p-6 font-black text-[#10B981]">{en.displayMatricule}</td>
                                                        <td className={`p-4 md:p-6 font-bold uppercase text-xs md:text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{en.displayFullName}</td>
                                                        <td className="p-4 md:p-6 text-center">
                                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${en.displayGender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{en.displayGender}</span>
                                                        </td>
                                                        <td className={`p-4 md:p-6 font-bold text-[10px] italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{en.displayClassname}</td>
                                                        <td className="p-4 md:p-6">
                                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black ${en.displayEnrollmentType === 'NOUVEAU' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {en.displayEnrollmentType}
                                                            </span>
                                                        </td>
                                                        <td className={`p-4 md:p-6 font-bold text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{formatDate(en.displayDate)}</td>
                                                        <td className="p-4 md:p-6">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => openEditWizard(en)} className={`p-2 rounded-lg transition-colors shadow-sm ${isDark ? 'bg-slate-700 text-amber-400 hover:bg-slate-600' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>✏️</button>
                                                                <button onClick={() => handleDelete(en.id)} className={`p-2 rounded-lg transition-colors shadow-sm ${isDark ? 'bg-slate-700 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>🗑️</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="7" className="p-20 text-center font-bold text-slate-400 italic">Aucun résultat trouvé.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {classrooms.map(cls => {
                                    const realCount = allEnrichedEnrollments.filter(en => String(en.computedClassId) === String(cls.id)).length;
                                    const capacity = cls.capacity || 0;
                                    const percentage = capacity > 0 ? Math.min((realCount / capacity) * 100, 100) : 0;
                                    return (
                                        <div key={cls.id} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-t-8 border-[#10B981] flex flex-col justify-between hover:scale-[1.02] transition-transform border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'}`}>
                                            <div>
                                                <h3 className={`font-black text-xs md:text-sm uppercase leading-tight mb-2 ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>{formatClassName(cls)}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Local : {cls.roomName || 'N/A'}</p>
                                            </div>
                                            <div className="mt-8">
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{realCount}</span>
                                                        <span className="text-sm font-bold text-slate-400">/ {capacity}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-[#10B981]">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
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

            {/* WIZARD MODAL */}
            {isWizardOpen && (
                <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-sm z-[200] flex items-center justify-center p-2">
                    <div className={`w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl relative border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white'}`}>
                        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h2 className={`font-black uppercase text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {isEditMode ? "📝 Modifier" : (currentStep === 1 ? "1. Sélection" : "2. Finalisation")}
                            </h2>
                            <button onClick={closeWizard} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
                        </div>
                        {currentStep === 1 ? (
                            <div className="space-y-4">
                                <input type="text" placeholder="Rechercher par nom..." className={`w-full p-4 rounded-xl outline-none font-bold text-sm ${isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                                    {eligibleStudents.length > 0 ? eligibleStudents.map(s => (
                                        <button key={s.id} onClick={() => { setSelectedStudent(s); setCurrentStep(2); }} className={`w-full text-left p-4 rounded-xl border transition-all group ${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-[#10B981]/10' : 'bg-slate-50 hover:bg-[#10B981]/10'}`}>
                                            <p className={`font-black text-xs uppercase ${isDark ? 'text-slate-300 group-hover:text-[#10B981]' : 'text-slate-700 group-hover:text-[#10B981]'}`}>{s.lastName} {s.postName || ''} {s.firstName}</p>
                                            <p className="text-[9px] text-slate-400">{s.matricule || "NOUVEAU"}</p>
                                        </button>
                                    )) : <p className="text-center p-10 text-slate-400 text-xs">Aucun élève trouvé.</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 overflow-y-auto max-h-[75vh] pr-2">
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                                    <p className={`font-black text-sm uppercase ${isDark ? 'text-blue-300' : 'text-slate-800'}`}>{selectedStudent?.lastName} {selectedStudent?.postName} {selectedStudent?.firstName}</p>
                                    <p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">{isEditMode ? "Modification" : "Dossier d'inscription"}</p>
                                </div>
                                <div className="space-y-4">
                                    <select className={`w-full p-4 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-100 text-slate-900'}`} value={enrollmentData.enrollmentType} onChange={(e) => setEnrollmentData({...enrollmentData, enrollmentType: e.target.value})}>
                                        <option value="NOUVEAU">NOUVELLE INSCRIPTION</option>
                                        <option value="REINSCRIPTION">RÉINSCRIPTION</option>
                                    </select>
                                    <select className={`w-full p-4 rounded-xl font-bold text-sm border-2 ${isDark ? 'bg-slate-800 text-white border-[#38BDF8]' : 'bg-slate-100 border-[#38BDF8]'}`} value={enrollmentData.classroomId} onChange={(e) => setEnrollmentData({...enrollmentData, classroomId: e.target.value})}>
                                        <option value="">Choisir la classe...</option>
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{formatClassName(c)}</option>)}
                                    </select>
                                    <div className={`space-y-3 p-4 rounded-xl border-2 border-dashed ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Documents</label>
                                            <button onClick={() => setDynamicDocs([...dynamicDocs, { label: '', file: null }])} className="text-[9px] bg-[#10B981] text-white px-2 py-1 rounded-lg">+ AJOUTER</button>
                                        </div>
                                        {dynamicDocs.map((doc, index) => (
                                            <div key={index} className="space-y-2 pb-3 border-b last:border-0 border-slate-700">
                                                <input type="text" className={`w-full p-2 border rounded-lg text-[11px] font-bold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="Libellé..." value={doc.label} onChange={(e) => { const nd = [...dynamicDocs]; nd[index].label = e.target.value; setDynamicDocs(nd); }} />
                                                <input type="file" className="w-full text-[10px]" onChange={(e) => { const nd = [...dynamicDocs]; nd[index].file = e.target.files[0]; setDynamicDocs(nd); }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    {!isEditMode && <button onClick={() => setCurrentStep(1)} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-900'}`}>Retour</button>}
                                    <button onClick={handleEnrollment} disabled={!enrollmentData.classroomId || loading} className="flex-[2] bg-[#0F172A] text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl disabled:opacity-50">
                                        {loading ? "Traitement..." : "Confirmer"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {loading && !isWizardOpen && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[300] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-t-[#10B981] border-slate-200 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, subValue, color, icon }) => (
    <div className={`${color} p-6 rounded-[2rem] text-white flex flex-col justify-between h-40 shadow-xl relative overflow-hidden transition-transform hover:scale-[1.03]`}>
        <div className="flex justify-between relative z-10">
            <span className="opacity-70 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="bg-white/10 w-10 h-10 flex items-center justify-center rounded-2xl text-base">{icon}</span>
        </div>
        <div className="relative z-10">
            <div className="text-4xl font-black italic tracking-tighter">{value}</div>
            {subValue && <div className="text-[10px] font-black opacity-60 uppercase mt-1">{subValue}</div>}
        </div>
    </div>
);

export default EnrollmentModule;