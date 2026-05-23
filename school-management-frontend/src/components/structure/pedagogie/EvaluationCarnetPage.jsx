import React, { useState, useEffect } from 'react';
import { Save, Plus, Loader2, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import EvaluationService from '../../../services/pedagogieService/EvaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { toast } from 'react-hot-toast';
import EvaluationCarnetAdd from './EvaluationCarnetAdd';
import GradeSheetPage from './GradeSheetPage';

const EvaluationCarnetPage = ({ assignment, activeYear, onBack }) => {
    const [period, setPeriod] = useState(1);
    const [students, setStudents] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visaStatus, setVisaStatus] = useState('DRAFT');
    const [currentPeriodMax, setCurrentPeriodMax] = useState(0);
    const [configuredPeriodMax, setConfiguredPeriodMax] = useState(0); 
    const [courseConfig, setCourseConfig] = useState(null); 
    
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showGradeSheet, setShowGradeSheet] = useState(false);
    
    const [evalForm, setEvalForm] = useState({
        id: null,
        type: 'IE',
        maxPoints: 10,
        date: new Date().toISOString().split('T')[0]
    });

    const [marksForm, setMarksForm] = useState({});

    const loadData = async () => {
        if (!assignment?.id || !activeYear?.id) return;
        
        try {
            setLoading(true);
            
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

            try {
                const config = await EvaluationService.getAssignmentConfig(assignment.id);
                if (config) {
                    setCourseConfig(config);
                    
                    if (period === 1) setConfiguredPeriodMax(config.maxP1 || 0);
                    else if (period === 2) setConfiguredPeriodMax(config.maxP2 || 0);
                    else if (period === 3) setConfiguredPeriodMax(config.maxP3 || 0);
                    else if (period === 4) setConfiguredPeriodMax(config.maxP4 || 0);
                }
            } catch (err) {
                console.error("Impossible de récupérer la config du cours:", err);
                setConfiguredPeriodMax(0);
            }

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

    const regularEvaluations = evaluations.filter(ev => ev.type !== 'EXAMEN');
    const examEvaluation = evaluations.find(ev => ev.type === 'EXAMEN');

    const handleMarkChange = (evalId, studentId, value) => {
        if (visaStatus !== 'DRAFT') return;
        
        const evaluation = evaluations.find(e => e.id === evalId);
        let maxPts = evaluation?.maxPoints;
        
        if (!maxPts && examEvaluation && evalId === examEvaluation.id) {
            maxPts = period === 2 ? courseConfig?.maxExam1 : courseConfig?.maxExam2;
        }
        if (!maxPts) maxPts = 10;

        if (value === '') {
            setMarksForm(prev => ({
                ...prev,
                [evalId]: {
                    ...(prev[evalId] || {}),
                    [studentId]: ''
                }
            }));
            return;
        }

        const numValue = parseFloat(value);
        
        if (isNaN(numValue) || numValue < 0 || numValue > maxPts) {
            toast.error(`Saisie refusée : Le maximum autorisé pour cette évaluation est de ${maxPts} points.`);
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

    const handleSaveColumnConfig = async (e) => {
        e.preventDefault();
        
        const futurePoints = parseFloat(evalForm.maxPoints);

        if (evalForm.type === 'EXAMEN') {
            const maxAllowed = period === 2 ? courseConfig?.maxExam1 : courseConfig?.maxExam2;
            if (futurePoints > maxAllowed) {
                toast.error(`Action bloquée : Le maxima de l'examen (${futurePoints}) dépasse le barème configuré (${maxAllowed}).`);
                return;
            }
        } else {
            let previousPointsOfThisEval = 0;
            if (evalForm.id) {
                const existingEval = evaluations.find(ev => ev.id === evalForm.id);
                if (existingEval) previousPointsOfThisEval = existingEval.maxPoints;
            }
            
            const projectedSum = currentPeriodMax - previousPointsOfThisEval + futurePoints;
            
            if (configuredPeriodMax > 0 && projectedSum > configuredPeriodMax) {
                toast.error(`Action bloquée : Le total cumulé (${projectedSum}) dépasserait le maxima configuré pour cette période (${configuredPeriodMax}).`);
                return;
            }

            if (evalForm.id) {
                const existingMarksForEval = marksForm[evalForm.id] || {};
                const pupils = Object.keys(existingMarksForEval);
                for (const pId of pupils) {
                    const savedVal = parseFloat(existingMarksForEval[pId]);
                    if (!isNaN(savedVal) && savedVal > futurePoints) {
                        toast.error(`Action refusée : Des élèves possèdent déjà des cotes (${savedVal}) supérieures au nouveau maxima proposé (${futurePoints}).`);
                        return;
                    }
                }
            }
        }

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

    const handleSaveAllMarks = async () => {
        if (evaluations.length === 0) return;
        
        for (const ev of evaluations) {
            let maxPts = ev.maxPoints;
            if (ev.type === 'EXAMEN') {
                maxPts = period === 2 ? courseConfig?.maxExam1 : courseConfig?.maxExam2;
            }
            for (const st of students) {
                const val = marksForm[ev.id]?.[st.id];
                if (val !== undefined && val !== '') {
                    const numVal = parseFloat(val);
                    if (numVal > maxPts) {
                        toast.error(`Erreur critique : La cote de l'élève ${st.fullName} (${numVal}) excède le maximum de ${maxPts}.`);
                        return;
                    }
                }
            }
        }
        
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

    const getStudentTotal = (studentId) => {
        let total = 0;
        regularEvaluations.forEach(ev => {
            const val = marksForm[ev.id]?.[studentId];
            if (val !== undefined && val !== '') total += parseFloat(val);
        });
        return total;
    };

    const formatDisplayType = (type) => {
        if (type === 'IE') return 'I.E';
        if (type === 'IO') return 'I.O';
        if (type === 'CC') return 'C.C';
        if (type === 'DEV') return 'DEV';
        return type;
    };

    const formatDateFull = (dateStr) => {
        if (!dateStr) return '-';
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    if (showGradeSheet) {
        return (
            <GradeSheetPage 
                assignment={assignment} 
                activeYear={activeYear} 
                onBack={() => setShowGradeSheet(false)} 
            />
        );
    }

    if (loading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-slate-800 mb-4" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ouverture du carnet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12 select-none w-full max-w-full overflow-x-hidden">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <button onClick={onBack} className="self-start sm:self-auto p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 active:scale-95 shrink-0">
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div className="w-full break-words">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-2 py-1 rounded inline-block">
                                {assignment?.classroomName}
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight mt-1 whitespace-normal break-words leading-tight">
                            {assignment?.subjectName}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 min-w-max">
                        {[1, 2, 3, 4].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-black uppercase transition-all duration-200 whitespace-nowrap ${
                                    period === p ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                PÉRIODE {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {visaStatus !== 'DRAFT' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-scale-in">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-emerald-800 text-sm">Carnet Verrouillé (Transmis)</h4>
                        <p className="text-emerald-600 text-xs mt-0.5">Les cotes ont été transmises à la direction. Modification désactivée depuis ce carnet.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col w-full">
                <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
                        SEMESTRE {period <= 2 ? '1' : '2'} — PÉRIODE {period === 1 ? 'I' : period === 2 ? 'II' : period === 3 ? 'III' : 'IV'}
                    </h3>
                    
                    <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
                        {visaStatus === 'DRAFT' && (
                            <>
                                <button 
                                    onClick={handleOpenAddModal}
                                    className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95"
                                >
                                    <Plus size={16} /> <span className="hidden sm:inline">Ajouter une colonne</span><span className="sm:hidden">Colonne</span>
                                </button>
                                <button 
                                    onClick={handleSaveAllMarks}
                                    disabled={isSaving || evaluations.length === 0}
                                    className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-md disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => setShowGradeSheet(true)}
                            className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95"
                        >
                            <FileText size={16} /> 
                            <span className="hidden sm:inline">Fiche de Notes</span>
                            <span className="sm:hidden">Fiche</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto p-0 sm:p-4 custom-scrollbar w-full">
                    <table className="w-full text-sm border-collapse border-2 border-slate-900 min-w-max">
                        <thead>
                            <tr>
                                <th rowSpan={3} className="border border-slate-900 p-2 w-12 text-center font-black bg-slate-100 text-slate-800">N°</th>
                                <th rowSpan={3} className="border border-slate-900 p-2 sm:p-3 min-w-[200px] sm:min-w-[320px] font-black text-left uppercase bg-slate-100 text-slate-800">
                                    NOMS & POST-NOM
                                </th>
                                <th className="border border-slate-900 p-0 text-center font-black text-[10px] w-12 min-w-[48px] h-28 align-middle bg-slate-100 group">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="-rotate-90 whitespace-nowrap text-slate-600 font-bold block">DATE</span>
                                    </div>
                                </th>
                                
                                {regularEvaluations.map(ev => (
                                    <th key={`date-${ev.id}`} className="border border-slate-900 p-0 text-center font-bold text-[10px] w-12 min-w-[48px] h-28 align-middle bg-white group">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="-rotate-90 whitespace-nowrap text-slate-700 font-black tracking-wider block">
                                                {formatDateFull(ev.date || ev.evaluationDate)}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="border border-slate-900 bg-slate-200 w-16 sm:w-24"></th>
                                
                                {period === 2 && (
                                    <>
                                        <th className="border border-slate-900 bg-orange-100 w-12 sm:w-16"></th>
                                        <th className="border border-slate-900 bg-emerald-100 w-12 sm:w-16"></th>
                                    </>
                                )}
                                
                                {period === 4 && (
                                    <>
                                        <th className="border border-slate-900 bg-orange-100 w-12 sm:w-16"></th>
                                        <th className="border border-slate-900 bg-emerald-100 w-12 sm:w-16"></th>
                                        <th className="border border-slate-900 bg-indigo-100 w-12 sm:w-16"></th>
                                    </>
                                )}
                            </tr>
                            
                            <tr>
                                <th className="border border-slate-900 bg-slate-100 h-8"></th>
                                {regularEvaluations.map(ev => (
                                    <th 
                                        key={`type-${ev.id}`} 
                                        onClick={() => visaStatus === 'DRAFT' && handleOpenEditModal(ev)}
                                        className={`border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs uppercase transition-colors duration-150 ${visaStatus === 'DRAFT' ? 'cursor-pointer hover:bg-blue-50 hover:text-blue-700 bg-slate-50' : 'bg-white'}`}
                                        title={visaStatus === 'DRAFT' ? "Cliquer pour modifier la colonne" : ""}
                                    >
                                        {formatDisplayType(ev.type)}
                                    </th>
                                ))}
                                <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs bg-slate-200 text-slate-800">TOT</th>
                                
                                {period === 2 && (
                                    <>
                                        <th 
                                            onClick={() => examEvaluation && visaStatus === 'DRAFT' && handleOpenEditModal(examEvaluation)}
                                            className={`border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs text-orange-900 bg-orange-200 ${examEvaluation && visaStatus === 'DRAFT' ? 'cursor-pointer hover:bg-orange-300' : ''}`}
                                        >
                                            EX1
                                        </th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs text-emerald-900 bg-emerald-200">TS1</th>
                                    </>
                                )}

                                {period === 4 && (
                                    <>
                                        <th 
                                            onClick={() => examEvaluation && visaStatus === 'DRAFT' && handleOpenEditModal(examEvaluation)}
                                            className={`border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs text-orange-900 bg-orange-200 ${examEvaluation && visaStatus === 'DRAFT' ? 'cursor-pointer hover:bg-orange-300' : ''}`}
                                        >
                                            EX2
                                        </th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs text-emerald-900 bg-emerald-200">TS2</th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs text-indigo-900 bg-indigo-200">TG</th>
                                    </>
                                )}
                            </tr>

                            <tr>
                                <th className="border border-slate-900 p-1 text-center font-bold italic text-[10px] sm:text-[11px] bg-slate-100 text-slate-600">Max</th>
                                {regularEvaluations.map(ev => (
                                    <th key={`max-${ev.id}`} className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-slate-100 text-slate-700">
                                        {ev.maxPoints}
                                    </th>
                                ))}
                                <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-slate-300 text-slate-900">
                                    <span className={currentPeriodMax > configuredPeriodMax ? 'text-red-600' : ''}>
                                        {currentPeriodMax} 
                                    </span>
                                    <span className="text-slate-500 font-bold ml-0.5 sm:ml-1">/ {configuredPeriodMax > 0 ? configuredPeriodMax : '0'}</span>
                                </th>

                                {period === 2 && (
                                    <>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-orange-100 text-orange-800">
                                            {courseConfig?.maxExam1 || '-'}
                                        </th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-800">
                                            {courseConfig?.maxS1 || '-'}
                                        </th>
                                    </>
                                )}

                                {period === 4 && (
                                    <>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-orange-100 text-orange-800">
                                            {courseConfig?.maxExam2 || '-'}
                                        </th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-800">
                                            {courseConfig?.maxS2 || '-'}
                                        </th>
                                        <th className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-[11px] bg-indigo-100 text-indigo-800">
                                            {courseConfig?.maxTotal || '-'}
                                        </th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                                        <td className="border border-slate-900 p-1 sm:p-1.5 text-center font-bold text-slate-600 text-[10px] sm:text-xs bg-slate-50">
                                            {idx + 1}
                                        </td>
                                        <td className="border border-slate-900 p-1.5 sm:p-2 font-black uppercase text-slate-900 text-[11px] sm:text-xs truncate">
                                            {student.fullName}
                                            <span className="text-[9px] text-slate-400 ml-1 sm:ml-2 font-normal block sm:inline select-all">{student.matricule}</span>
                                        </td>
                                        <td className="border border-slate-900 bg-slate-50"></td>
                                        
                                        {regularEvaluations.map(ev => {
                                            const markValue = marksForm[ev.id]?.[student.id];
                                            const isBelowHalf = markValue !== undefined && markValue !== '' && parseFloat(markValue) < (ev.maxPoints / 2);
                                            
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
                                                        className={`w-full h-full min-h-[36px] min-w-[48px] text-center font-black text-xs md:text-sm focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-transparent ${isBelowHalf ? 'text-red-600' : 'text-slate-800'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                                    />
                                                </td>
                                            );
                                        })}

                                        {/* COLONNE TOT: Logique de couleur rouge intégrée ici */}
                                        {(() => {
                                            const studentTotal = getStudentTotal(student.id);
                                            const maxTotal = configuredPeriodMax > 0 ? configuredPeriodMax : currentPeriodMax;
                                            const isTotBelowHalf = maxTotal > 0 && studentTotal < (maxTotal / 2);
                                            
                                            return (
                                                <td className={`border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs bg-slate-200 transition-colors ${isTotBelowHalf ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {studentTotal}
                                                </td>
                                            );
                                        })()}

                                        {period === 2 && (
                                            <>
                                                <td className="border border-slate-900 p-0 text-center align-middle h-full bg-orange-50/30">
                                                    {(() => {
                                                        const examMark = examEvaluation ? marksForm[examEvaluation.id]?.[student.id] : '';
                                                        const maxEx = courseConfig?.maxExam1 || 10;
                                                        const isExamBelowHalf = examMark !== undefined && examMark !== '' && parseFloat(examMark) < (maxEx / 2);
                                                        return (
                                                            <input 
                                                                type="number" min="0" max={maxEx} step="0.5" disabled={visaStatus !== 'DRAFT' || !examEvaluation}
                                                                value={examMark !== undefined ? examMark : ''}
                                                                onChange={(e) => examEvaluation && handleMarkChange(examEvaluation.id, student.id, e.target.value)}
                                                                className={`w-full h-full min-h-[36px] min-w-[48px] text-center font-black text-xs md:text-sm focus:outline-none focus:bg-orange-100 focus:ring-2 focus:ring-inset focus:ring-orange-600 bg-transparent ${isExamBelowHalf ? 'text-red-600' : 'text-orange-900'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                                            />
                                                        );
                                                    })()}
                                                </td>
                                                <td className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs bg-emerald-100 text-emerald-900">
                                                    {(() => {
                                                        const tot = getStudentTotal(student.id);
                                                        const exMarkStr = examEvaluation ? marksForm[examEvaluation.id]?.[student.id] : '';
                                                        const ex = exMarkStr !== undefined && exMarkStr !== '' ? parseFloat(exMarkStr) : 0;
                                                        const ts1 = tot + ex;
                                                        const maxTs1 = courseConfig?.maxS1 || ((configuredPeriodMax > 0 ? configuredPeriodMax : currentPeriodMax) + (courseConfig?.maxExam1 || 0));
                                                        const isTs1BelowHalf = maxTs1 > 0 && ts1 < (maxTs1 / 2);
                                                        return (
                                                            <span className={isTs1BelowHalf ? 'text-red-600' : ''}>{ts1}</span>
                                                        );
                                                    })()}
                                                </td>
                                            </>
                                        )}

                                        {period === 4 && (
                                            <>
                                                <td className="border border-slate-900 p-0 text-center align-middle h-full bg-orange-50/30">
                                                    {(() => {
                                                        const examMark = examEvaluation ? marksForm[examEvaluation.id]?.[student.id] : '';
                                                        const maxEx = courseConfig?.maxExam2 || 10;
                                                        const isExamBelowHalf = examMark !== undefined && examMark !== '' && parseFloat(examMark) < (maxEx / 2);
                                                        return (
                                                            <input 
                                                                type="number" min="0" max={maxEx} step="0.5" disabled={visaStatus !== 'DRAFT' || !examEvaluation}
                                                                value={examMark !== undefined ? examMark : ''}
                                                                onChange={(e) => examEvaluation && handleMarkChange(examEvaluation.id, student.id, e.target.value)}
                                                                className={`w-full h-full min-h-[36px] min-w-[48px] text-center font-black text-xs md:text-sm focus:outline-none focus:bg-orange-100 focus:ring-2 focus:ring-inset focus:ring-orange-600 bg-transparent ${isExamBelowHalf ? 'text-red-600' : 'text-orange-900'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                                            />
                                                        );
                                                    })()}
                                                </td>
                                                <td className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs bg-emerald-100 text-emerald-900">
                                                    {(() => {
                                                        const tot = getStudentTotal(student.id);
                                                        const exMarkStr = examEvaluation ? marksForm[examEvaluation.id]?.[student.id] : '';
                                                        const ex = exMarkStr !== undefined && exMarkStr !== '' ? parseFloat(exMarkStr) : 0;
                                                        const ts2 = tot + ex;
                                                        const maxTs2 = courseConfig?.maxS2 || ((configuredPeriodMax > 0 ? configuredPeriodMax : currentPeriodMax) + (courseConfig?.maxExam2 || 0));
                                                        const isTs2BelowHalf = maxTs2 > 0 && ts2 < (maxTs2 / 2);
                                                        return (
                                                            <span className={isTs2BelowHalf ? 'text-red-600' : ''}>{ts2}</span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="border border-slate-900 p-1 text-center font-black text-[10px] sm:text-xs bg-indigo-50 text-indigo-900">
                                                    {/* TG peut nécessiter une autre logique backend, ici on garde la structure */}
                                                    - 
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={100} className="border border-slate-900 p-8 text-center text-slate-500 font-bold bg-slate-50">
                                        Aucun élève trouvé pour cette classe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Components */}
            {showModal && (
                <EvaluationCarnetAdd
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    evalForm={evalForm}
                    setEvalForm={setEvalForm}
                    onSave={handleSaveColumnConfig}
                    isSaving={isSaving}
                    currentPeriodMax={currentPeriodMax}
                    configuredPeriodMax={configuredPeriodMax}
                />
            )}
        </div>
    );
};

export default EvaluationCarnetPage;