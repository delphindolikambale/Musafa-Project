import React, { useState, useEffect, useMemo } from 'react';
import { X, UserCheck, Clock, Shield, Search, Star, ChevronDown, ChevronRight } from 'lucide-react';
import TeacherService from '../../../services/pedagogieService/TeacherService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';

const AssignTeacherModal = ({ isOpen, onClose, courseConfig, classroomId, academicYearId, onSuccess, existingAssignment }) => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [weeklyHours, setWeeklyHours] = useState('');
    const [isClassMaster, setIsClassMaster] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Nouvel état pour gérer l'affichage de l'accordéon "Autres Enseignants"
    const [showOthers, setShowOthers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            if (existingAssignment) {
                setSelectedTeacherId(existingAssignment.teacherId?.toString() || '');
                setWeeklyHours(existingAssignment.weeklyHours?.toString() || '');
                setIsClassMaster(existingAssignment.isClassMaster || false);
            } else {
                setSelectedTeacherId('');
                setWeeklyHours('');
                setIsClassMaster(false);
            }
            setSearchTerm('');
            setShowOthers(false); // Réinitialiser l'accordéon à la fermeture/ouverture
        }
    }, [isOpen, existingAssignment]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const data = await TeacherService.getAllTeachers(); 
            setTeachers(data || []);
        } catch (error) {
            console.error("Erreur de chargement des enseignants:", error);
        } finally {
            setLoading(false);
        }
    };

    const { prioritizedTeachers, otherTeachers } = useMemo(() => {
        if (!courseConfig) return { prioritizedTeachers: [], otherTeachers: [] };
        
        const filtered = teachers.filter(t => 
            `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const courseDomain = (courseConfig.domainName || '').toLowerCase().trim();
        const courseSubDomain = (courseConfig.subDomainName || '').toLowerCase().trim();

        const prioritized = [];
        const others = [];

        filtered.forEach(teacher => {
            const teacherDomain = (teacher.domainSpecialityName || '').toLowerCase().trim();
            
            // Logique de correspondance assouplie : vérifie le Domaine ET le Sous-domaine
            let isSpecialist = false;
            if (teacherDomain && teacherDomain !== 'généraliste') {
                if (courseDomain === teacherDomain || 
                    courseDomain.includes(teacherDomain) || 
                    teacherDomain.includes(courseDomain)) {
                    isSpecialist = true;
                }
                if (courseSubDomain && (
                    courseSubDomain === teacherDomain || 
                    courseSubDomain.includes(teacherDomain) || 
                    teacherDomain.includes(courseSubDomain)
                )) {
                    isSpecialist = true;
                }
            }

            if (isSpecialist) {
                prioritized.push(teacher);
            } else {
                others.push(teacher);
            }
        });

        return { prioritizedTeachers: prioritized, otherTeachers: others };
    }, [teachers, courseConfig, searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeacherId || !weeklyHours) return;

        setIsSubmitting(true);
        try {
            const payload = {
                teacherId: parseInt(selectedTeacherId, 10),
                courseAssignmentId: courseConfig.id,
                classroomId: parseInt(classroomId, 10),
                academicYearId: parseInt(academicYearId, 10),
                weeklyHours: parseFloat(weeklyHours),
                isClassMaster: isClassMaster
            };

            if (existingAssignment) {
                await TeacherAssignmentService.updateAssignment(existingAssignment.id, payload);
            } else {
                await TeacherAssignmentService.assignTeacher(payload);
            }
            
            onSuccess(); 
            onClose();
        } catch (error) {
            console.error("Erreur d'affectation:", error);
            alert("Erreur lors de l'enregistrement. Vérifiez si ce cours n'est pas déjà affecté.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !courseConfig) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                <UserCheck size={14} /> {existingAssignment ? "Modification de l'affectation" : "Affectation d'Enseignant"}
                            </div>
                            <h2 className="text-2xl font-black break-words pr-4 leading-tight">{courseConfig.subjectName}</h2>
                            <div className="text-xs font-medium text-slate-400 mt-2 flex flex-wrap items-center gap-2">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 whitespace-nowrap">
                                    {courseConfig.domainName || 'Général'}
                                </span>
                                {courseConfig.subDomainName && (
                                    <span className="flex items-center gap-2">
                                        <span className="text-slate-600">&rsaquo;</span> 
                                        <span className="text-slate-300">{courseConfig.subDomainName}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white shrink-0 ml-4">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Maxima Summary Grid */}
                    <div className="mt-6 grid grid-cols-4 gap-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Semestre 1</p>
                            <p className="text-xs font-black text-white">{courseConfig.maxS1} pts</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Semestre 2</p>
                            <p className="text-xs font-black text-white">{courseConfig.maxS2} pts</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 text-center col-span-2">
                            <p className="text-[8px] text-blue-300 font-bold uppercase mb-0.5">Maximum Total</p>
                            <p className="text-sm font-black text-blue-400">{courseConfig.maxTotal} pts</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    <form id="assign-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Section Sélection Enseignant */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap justify-between items-end gap-3 px-1">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                    Choisir l'enseignant
                                </label>
                                <div className="relative min-w-[240px] flex-1 sm:flex-none">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" placeholder="Rechercher par nom..."
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 w-full outline-none shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100/50 p-2 space-y-4">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar px-1 space-y-2">
                                    {loading ? (
                                        <div className="py-10 flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chargement...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Liste des Spécialistes Priorisés */}
                                            {prioritizedTeachers.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-2 py-1 flex items-center gap-2">
                                                        <Star size={10} className="fill-emerald-600" /> Spécialistes recommandés
                                                    </div>
                                                    {prioritizedTeachers.map(t => (
                                                        <label key={t.id} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all group ${selectedTeacherId === t.id.toString() ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100' : 'bg-white border-transparent hover:border-emerald-200 shadow-sm'}`}>
                                                            <input type="radio" name="teacher" value={t.id} checked={selectedTeacherId === t.id.toString()} onChange={() => setSelectedTeacherId(t.id.toString())} className="hidden" />
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedTeacherId === t.id.toString() ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200 bg-white group-hover:border-emerald-300'}`}>
                                                                {selectedTeacherId === t.id.toString() && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-800">{t.firstName} {t.lastName}</p>
                                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{t.domainSpecialityName || "Spécialiste"}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Accordéon pour les autres enseignants */}
                                            {otherTeachers.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    {prioritizedTeachers.length > 0 ? (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowOthers(!showOthers)}
                                                            className="flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest px-2 py-2 w-full text-left transition-colors"
                                                        >
                                                            {showOthers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                            Voir les autres enseignants ({otherTeachers.length})
                                                        </button>
                                                    ) : (
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">
                                                            Autres Enseignants ({otherTeachers.length})
                                                        </div>
                                                    )}

                                                    {(showOthers || prioritizedTeachers.length === 0) && (
                                                        <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                                                            {otherTeachers.map(t => (
                                                                <label key={t.id} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all group ${selectedTeacherId === t.id.toString() ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-100' : 'bg-white border-transparent hover:border-blue-200 shadow-sm'}`}>
                                                                    <input type="radio" name="teacher" value={t.id} checked={selectedTeacherId === t.id.toString()} onChange={() => setSelectedTeacherId(t.id.toString())} className="hidden" />
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedTeacherId === t.id.toString() ? 'border-blue-500 bg-blue-500' : 'border-slate-200 bg-white group-hover:border-blue-300'}`}>
                                                                        {selectedTeacherId === t.id.toString() && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-bold text-slate-800">{t.firstName} {t.lastName}</p>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.domainSpecialityName || "Généraliste"}</p>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {!loading && prioritizedTeachers.length === 0 && otherTeachers.length === 0 && (
                                                <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                    Aucun enseignant trouvé
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Paramètres d'affectation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Clock size={14} className="text-blue-500"/> Heures / Semaine
                                </label>
                                <input 
                                    type="number" step="0.5" min="0" required
                                    value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)}
                                    placeholder="Ex: 4"
                                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 px-5 py-3.5 text-sm font-bold transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 cursor-pointer transition-all h-[54px] ${isClassMaster ? 'bg-amber-50 border-amber-400 shadow-md shadow-amber-100' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={isClassMaster} 
                                        onChange={e => setIsClassMaster(e.target.checked)}
                                        className="w-5 h-5 text-amber-500 rounded-lg focus:ring-amber-500 cursor-pointer border-slate-300"
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isClassMaster ? 'text-amber-700' : 'text-slate-600'}`}>
                                            <Shield size={12} /> Titulaire
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Gère la classe</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">
                        Annuler
                    </button>
                    <button 
                        type="submit" form="assign-form" disabled={!selectedTeacherId || !weeklyHours || isSubmitting}
                        className="px-10 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        {isSubmitting ? "Traitement..." : "Confirmer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTeacherModal;