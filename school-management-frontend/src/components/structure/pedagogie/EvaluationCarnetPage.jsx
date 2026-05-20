import React, { useState, useEffect } from 'react';
import { Save, Plus, Loader2, Send, ArrowLeft, Calendar, X, CheckCircle2 } from 'lucide-react';
import EvaluationService from '../../../services/pedagogieService/EvaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';
import { toast } from 'react-hot-toast';

const EvaluationCarnetPage = ({ assignment, activeYear, onBack }) => {
    const [period, setPeriod] = useState(1);
    const [students, setStudents] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visaStatus, setVisaStatus] = useState('DRAFT');
    const [currentPeriodMax, setCurrentPeriodMax] = useState(0);
    const [configuredPeriodMax, setConfiguredPeriodMax] = useState(0); // NOUVEAU: Le plafond global de la période
    
    // États de sauvegarde et modal
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmittingVisa, setIsSubmittingVisa] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [evalForm, setEvalForm] = useState({
        id: null,
        type: 'IE',
        maxPoints: 10,
        date: new Date().toISOString().split('T')[0]
    });

    const [marksForm, setMarksForm] = useState({});

    // 1. Chargement global des données
    const loadData = async () => {
        if (!assignment?.id || !activeYear?.id) return;
        
        try {
            setLoading(true);
            
            // A. Extraction et formatage robuste des élèves inscrits
            const enrollments = await enrollmentService.getEnrollmentReport(assignment.classroomId, activeYear.id);
            const formattedStudents = enrollments.map(item => {
                const sId = item.studentId || item.id;
                const mat = item.matricule || '-';
                const fName = item.studentFullName || item.fullName || item.studentName || '';
                
                return {
                    id: sId,
                    matricule: mat,
                    fullName: fName.trim().toUpperCase() || "NOM INCONNU"
                };
            });

            formattedStudents.sort((a, b) => a.fullName.localeCompare(b.fullName));
            setStudents(formattedStudents);

            // B. Récupérer l'affectation complète pour extraire le Max configuré pour ce cours
            try {
                const assignmentDetails = await EvaluationService.getTeacherAssignmentById(assignment.id);
                // On utilise le filter du course config si on n'a pas accès direct au CourseAssignment depuis TeacherAssignmentDTO
                const configList = await courseAcademicConfigService.getCourseConfigurationFilter(
                    null, null, null, activeYear.id // On pourrait cibler plus précisément, mais on filtre ci-dessous
                );
                const currentConfig = configList.find(c => c.subjectName === assignmentDetails.subjectName);
                if (currentConfig) {
                    if (period === 1) setConfiguredPeriodMax(currentConfig.maxP1 || 0);
                    else if (period === 2) setConfiguredPeriodMax(currentConfig.maxP2 || 0);
                    else if (period === 3) setConfiguredPeriodMax(currentConfig.maxP3 || 0);
                    else if (period === 4) setConfiguredPeriodMax(currentConfig.maxP4 || 0);
                }
            } catch (err) {
                console.error("Impossible de récupérer la config du cours:", err);
                setConfiguredPeriodMax(0); // Fallback
            }

            // C. Récupération des évaluations et notes de la période
            const evals = await EvaluationService.getEvaluationsByAssignment(assignment.id, period);
            const evalsArray = Array.isArray(evals) ? evals : [];
            
            const initialMarks = {};
            const evalsWithMarks = await Promise.all(evalsArray.map(async (ev) => {
                try {
                    const marks = await EvaluationService.getMarksByEvaluationTask(ev.id);
                    initialMarks[ev.id] = {};
                    marks.forEach(m => {
                        initialMarks[ev.id][m.studentId] = m.obtainedValue ?? m.value;
                    });
                    return { ...ev, marks };
                } catch (err) {
                    initialMarks[ev.id] = {};
                    return { ...ev, marks: [] };
                }
            }));
            
            setEvaluations(evalsWithMarks);
            setMarksForm(initialMarks);

            // D. Statuts et Totaux consommés
            const visa = await EvaluationService.getVisaStatus(assignment.id, period);
            setVisaStatus(visa?.status || visa || 'DRAFT');

            const sum = await EvaluationService.getCurrentSum(assignment.id, period);
            setCurrentPeriodMax(sum?.currentSum || sum || 0);

        } catch (error) {
            console.error("Erreur de chargement du carnet:", error);
            toast.error("Impossible de charger les données du carnet de cotes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [assignment?.id, activeYear?.id, period]);

    // 2. Interaction au clavier dans le tableau
    const handleMarkChange = (evalId, studentId, value) => {
        if (visaStatus !== 'DRAFT') return;
        
        const evaluation = evaluations.find(e => e.id === evalId);
        const maxPts = evaluation?.maxPoints || 10;
        const numValue = parseFloat(value);
        
        if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > maxPts)) {
            toast.error(`La cote doit être entre 0 et ${maxPts}`);
            return;
        }

        setMarksForm(prev => ({
            ...prev,
            [evalId]: {
                ...(prev[evalId] || {}),
                [studentId]: value
            }
        }));
    };

    // 3. Ouvrir le Modal
    const handleOpenAddModal = () => {
        if (visaStatus !== 'DRAFT') {
            toast.error("Période verrouillée. Ajout impossible.");
            return;
        }
        setEvalForm({ id: null, type: 'IE', maxPoints: 10, date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const handleOpenEditModal = (ev) => {
        if (visaStatus !== 'DRAFT') return;
        setEvalForm({
            id: ev.id,
            type: ev.type,
            maxPoints: ev.maxPoints,
            date: ev.date || ev.evaluationDate || new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    // 4. Sauvegarder la configuration de la colonne (Modal) avec BLOCAGE DU MAXIMA
    const handleSaveColumnConfig = async (e) => {
        e.preventDefault();
        
        // --- LOGIQUE DE VALIDATION DU PLAFOND (MAXIMA GLOBAL) ---
        const futurePoints = parseFloat(evalForm.maxPoints);
        let previousPointsOfThisEval = 0;
        
        // Si c'est une modification, on retire l'ancien max de cette colonne de la somme actuelle
        if (evalForm.id) {
            const existingEval = evaluations.find(ev => ev.id === evalForm.id);
            if (existingEval) previousPointsOfThisEval = existingEval.maxPoints;
        }
        
        const projectedSum = currentPeriodMax - previousPointsOfThisEval + futurePoints;
        
        if (configuredPeriodMax > 0 && projectedSum > configuredPeriodMax) {
            toast.error(`Action bloquée : Le total cumulé (${projectedSum}) dépasserait le maxima configuré pour cette période (${configuredPeriodMax}).`);
            return;
        }
        // --------------------------------------------------------

        try {
            setIsSaving(true);
            const autoTitle = `${evalForm.type} du ${new Date(evalForm.date).toLocaleDateString('fr-FR')}`;

            const payload = {
                id: evalForm.id,
                title: autoTitle,
                type: evalForm.type,
                maxPoints: futurePoints,
                date: evalForm.date,
                teacherAssignmentId: assignment.id,
                period: period,
                marks: []
            };

            await EvaluationService.saveEvaluation(payload);
            toast.success(evalForm.id ? "Colonne mise à jour." : "Nouvelle colonne ajoutée au carnet.");
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || "Erreur d'enregistrement de la colonne.");
        } finally {
            setIsSaving(false);
        }
    };

    // 5. Sauvegarde globale de TOUTES les notes encodées dans le tableau
    const handleSaveAllMarks = async () => {
        if (evaluations.length === 0) return;
        
        try {
            setIsSaving(true);
            for (const ev of evaluations) {
                const marksPayload = students.map(st => {
                    const val = marksForm[ev.id]?.[st.id];
                    return {
                        studentId: st.id,
                        obtainedValue: (val !== undefined && val !== '') ? parseFloat(val) : null
                    };
                }).filter(m => m.obtainedValue !== null);

                const payload = {
                    id: ev.id,
                    title: ev.title,
                    type: ev.type,
                    maxPoints: ev.maxPoints,
                    date: ev.date || ev.evaluationDate,
                    teacherAssignmentId: assignment.id,
                    period: period,
                    marks: marksPayload
                };

                await EvaluationService.saveEvaluation(payload);
            }
            
            toast.success("Toutes les cotes du carnet ont été enregistrées avec succès !");
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la sauvegarde des cotes.");
        } finally {
            setIsSaving(false);
        }
    };

    // 6. Transmission au Proviseur
    const handleSubmitForVisa = async () => {
        if (window.confirm(`Confirmez-vous la transmission définitive des cotes de la Période ${period} ?`)) {
            try {
                setIsSubmittingVisa(true);
                await handleSaveAllMarks(); 
                await EvaluationService.submitForVisa(assignment.id, period);
                toast.success("Carnet officiellement transmis à la direction.");
                loadData();
            } catch (error) {
                toast.error(error.response?.data || "Erreur lors de la transmission.");
            } finally {
                setIsSubmittingVisa(false);
            }
        }
    };

    const getStudentTotal = (studentId) => {
        let total = 0;
        evaluations.forEach(ev => {
            const val = marksForm[ev.id]?.[studentId];
            if (val !== undefined && val !== '') total += parseFloat(val);
        });
        return total;
    };

    const formatDisplayType = (type) => {
        if (type === 'IE') return 'LE';
        if (type === 'IO') return 'LO';
        if (type === 'CC') return 'C.C';
        return type;
    };

    if (loading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-slate-800 mb-4" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ouverture du carnet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12 select-none">
            {/* EN-TÊTE ET COMMANDES */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 active:scale-95">
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-2 py-1 rounded">
                                {assignment?.classroomName}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-1">
                            {assignment?.subjectName}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                        {[1, 2, 3, 4].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all duration-200 whitespace-nowrap ${
                                    period === p ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                PÉRIODE {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* AVERTISSEMENT SI VERROUILLÉ */}
            {visaStatus !== 'DRAFT' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-emerald-800 text-sm">Carnet Verrouillé (Transmis)</h4>
                        <p className="text-emerald-600 text-xs mt-0.5">Les cotes ont été transmises à la direction. Modification désactivée.</p>
                    </div>
                </div>
            )}

            {/* LE CARNET DE NOTES (STRICTEMENT REPRODUIT) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col">
                <div className="bg-slate-50 p-4 border-b border-slate-300 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
                        SEMESTRE {period <= 2 ? '1' : '2'} — PÉRIODE {period === 1 || period === 3 ? 'I' : 'II'}
                    </h3>
                    
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                        {visaStatus === 'DRAFT' && (
                            <>
                                <button 
                                    onClick={handleOpenAddModal}
                                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95"
                                >
                                    <Plus size={16} /> <span className="hidden sm:inline">Ajouter une colonne</span><span className="sm:hidden">Colonne</span>
                                </button>
                                <button 
                                    onClick={handleSaveAllMarks}
                                    disabled={isSaving || evaluations.length === 0}
                                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-md disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer
                                </button>
                                <button 
                                    onClick={handleSubmitForVisa}
                                    disabled={isSubmittingVisa || evaluations.length === 0}
                                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 flex items-center gap-2 transition-all duration-200 shadow-md disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmittingVisa ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Transmettre
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto p-4 custom-scrollbar">
                    <table className="w-full text-sm border-collapse border-2 border-slate-900 table-fixed sm:table-auto">
                        <thead>
                            {/* Ligne 1 : Date (Verticale) */}
                            <tr>
                                <th rowSpan={3} className="border border-slate-900 p-2 w-12 text-center font-black bg-slate-100 text-slate-800">N°</th>
                                <th rowSpan={3} className="border border-slate-900 p-3 min-w-[250px] sm:min-w-[320px] font-black text-left uppercase bg-slate-100 text-slate-800">
                                    NOMS & POST-NOM
                                </th>
                                <th className="border border-slate-900 p-0 text-center font-black text-[10px] w-12 h-24 align-middle bg-slate-100 relative overflow-hidden">
                                    <span className="absolute inset-0 flex items-center justify-center -rotate-90 whitespace-nowrap text-slate-600 font-bold">DATE</span>
                                </th>
                                
                                {evaluations.map(ev => (
                                    <th key={`date-${ev.id}`} className="border border-slate-900 p-0 text-center font-bold text-[10px] w-12 h-24 align-middle bg-white relative overflow-hidden group">
                                        <span className="absolute inset-0 flex items-center justify-center -rotate-90 whitespace-nowrap text-slate-700 font-black tracking-wider">
                                            {ev.date || ev.evaluationDate ? new Date(ev.date || ev.evaluationDate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'}) : '-'}
                                        </span>
                                    </th>
                                ))}
                                <th className="border border-slate-900 bg-slate-200 w-24"></th>
                            </tr>
                            
                            {/* Ligne 2 : Type d'évaluation */}
                            <tr>
                                <th className="border border-slate-900 bg-slate-100 h-8"></th>
                                {evaluations.map(ev => (
                                    <th 
                                        key={`type-${ev.id}`} 
                                        onClick={() => visaStatus === 'DRAFT' && handleOpenEditModal(ev)}
                                        className={`border border-slate-900 p-1 text-center font-black text-xs uppercase transition-colors duration-150 ${visaStatus === 'DRAFT' ? 'cursor-pointer hover:bg-blue-50 hover:text-blue-700 bg-slate-50' : 'bg-white'}`}
                                        title={visaStatus === 'DRAFT' ? "Cliquer pour modifier la colonne" : ""}
                                    >
                                        {formatDisplayType(ev.type)}
                                    </th>
                                ))}
                                <th className="border border-slate-900 p-1 text-center font-black text-xs bg-slate-200 text-slate-800">TOT</th>
                            </tr>

                            {/* Ligne 3 : Maxima (Avec affichage du Plafond Global) */}
                            <tr>
                                <th className="border border-slate-900 p-1 text-center font-bold italic text-[11px] bg-slate-100 text-slate-600">Max</th>
                                {evaluations.map(ev => (
                                    <th key={`max-${ev.id}`} className="border border-slate-900 p-1 text-center font-black text-[11px] bg-slate-100 text-slate-700">
                                        {ev.maxPoints}
                                    </th>
                                ))}
                                <th className="border border-slate-900 p-1 text-center font-black text-[11px] bg-slate-300 text-slate-900">
                                    <span className={currentPeriodMax > configuredPeriodMax ? 'text-red-600' : ''}>
                                        {currentPeriodMax} 
                                    </span>
                                    <span className="text-slate-500 font-bold ml-1">/ {configuredPeriodMax > 0 ? configuredPeriodMax : '?'}</span>
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                                        <td className="border border-slate-900 p-1.5 text-center font-bold text-slate-600 text-xs bg-slate-50">
                                            {idx + 1}
                                        </td>
                                        <td className="border border-slate-900 p-2 font-black uppercase text-slate-900 text-xs truncate">
                                            {student.fullName}
                                            <span className="text-[9px] text-slate-400 ml-2 font-normal block sm:inline select-all">{student.matricule}</span>
                                        </td>
                                        <td className="border border-slate-900 bg-slate-50"></td>
                                        
                                        {evaluations.map(ev => {
                                            const markValue = marksForm[ev.id]?.[student.id];
                                            return (
                                                <td key={`${student.id}-${ev.id}`} className="border border-slate-900 p-0 text-center align-middle relative h-full">
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        max={ev.maxPoints}
                                                        step="0.5"
                                                        disabled={visaStatus !== 'DRAFT'}
                                                        value={markValue !== undefined ? markValue : ''}
                                                        onChange={(e) => handleMarkChange(ev.id, student.id, e.target.value)}
                                                        className="w-full h-8 text-center bg-transparent outline-none font-bold text-sm text-slate-900 transition-all duration-150 focus:bg-blue-50/70 focus:ring-2 focus:ring-blue-600 focus:relative focus:z-10 disabled:bg-slate-50 disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </td>
                                            )
                                        })}
                                        
                                        <td className="border border-slate-900 p-1.5 text-center font-black bg-slate-100 text-slate-900 text-xs group-hover:bg-slate-200 transition-colors">
                                            {getStudentTotal(student.id)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={evaluations.length + 4} className="border border-slate-900 p-8 text-center text-slate-500 font-bold uppercase tracking-wider text-xs bg-slate-50">
                                        Aucun élève inscrit n'a été trouvé pour cette classe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL AJOUT/MODIFICATION D'UNE COLONNE */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in border border-slate-200">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                                {evalForm.id ? "Modifier la colonne" : "Ajouter une colonne"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 active:scale-95">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveColumnConfig} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Type d'évaluation</label>
                                <select
                                    required
                                    value={evalForm.type}
                                    onChange={(e) => setEvalForm({...evalForm, type: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                                >
                                    <option value="IE">L.E ou I.E (Interro Écrite)</option>
                                    <option value="IO">L.O ou I.O (Interro Orale)</option>
                                    <option value="DEV">DEV (Devoir)</option>
                                    <option value="CC">C.C (Contrôle Continu)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cote Maximum</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={evalForm.maxPoints}
                                    onChange={(e) => setEvalForm({...evalForm, maxPoints: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date d'évaluation</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        required
                                        value={evalForm.date}
                                        onChange={(e) => setEvalForm({...evalForm, date: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationCarnetPage;