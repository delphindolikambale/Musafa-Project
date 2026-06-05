import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Loader2, 
    AlertTriangle, 
    FileText, 
    MessageSquare,
    UserCheck,
    Calendar,
    BookOpen
} from 'lucide-react';
import GradeSheetService from '../../../services/pedagogieService/GradeSheetService';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import { toast } from 'react-hot-toast';

const TitulaireGradeSheetValidation = () => {
    const { assignmentId, period } = useParams();
    const navigate = useNavigate();
    const currentPeriod = parseInt(period, 10) || 1;

    // États des données
    const [matrixData, setMatrixData] = useState(null);
    const [visaStatus, setVisaStatus] = useState('DRAFT');
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // États des modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState('');

    // Chargement initial des données
    const loadValidationData = async () => {
        setLoading(true);
        try {
            // Récupération simultanée du statut et de la matrice
            const [status, matrix] = await Promise.all([
                GradeSheetService.getGradeSheetVisaStatus(assignmentId, currentPeriod),
                GradeSheetService.getClassMatrixSheet(assignmentId)
            ]);
            
            setVisaStatus(status?.status || status || 'DRAFT');
            setMatrixData(matrix);
        } catch (error) {
            console.error("Erreur lors du chargement des données de la fiche :", error);
            toast.error("Impossible de charger la fiche de cotes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assignmentId && period) {
            loadValidationData();
        }
    }, [assignmentId, period]);

    // Action d'approbation (Validation finale au bulletin par le Titulaire)
    const handleApproveFiche = async () => {
        setIsActionLoading(true);
        try {
            // Assurez-vous d'avoir cette méthode dans votre titulaireService
            await titulaireService.validateGradeSheet(assignmentId, currentPeriod);
            toast.success(`Fiche validée ! Les cotes sont intégrées au bulletin pour la Période ${currentPeriod}.`);
            setShowApproveModal(false);
            // Retour au tableau de bord du titulaire
            navigate('/enseignant/titulaire');
        } catch (error) {
            console.error("Erreur de validation par le titulaire :", error);
            toast.error(error.response?.data || "Une erreur est survenue lors de la validation finale.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Action de rejet (Renvoyer la fiche s'il y a un problème de calcul ou de centralisation)
    const handleRejectFiche = async (e) => {
        e.preventDefault();
        if (!rejectComment.trim()) {
            toast.error("Veuillez saisir un motif de rejet.");
            return;
        }

        setIsActionLoading(true);
        try {
            // Assurez-vous d'avoir cette méthode dans votre titulaireService
            await titulaireService.rejectGradeSheet(assignmentId, currentPeriod, rejectComment.trim());
            toast.success(`La fiche a été signalée et renvoyée pour correction.`);
            setShowRejectModal(false);
            navigate('/enseignant/titulaire');
        } catch (error) {
            console.error("Erreur lors du rejet de la fiche :", error);
            toast.error(error.response?.data || "Une erreur est survenue lors de l'annulation.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Logique d'analyse des cotes sous la moyenne
    const isBelowHalf = (mark, max) => {
        if (mark === null || mark === undefined || mark === '-' || isNaN(mark) || !max || max === 0) return false;
        return parseFloat(mark) < (parseFloat(max) / 2);
    };

    const getMarkClass = (mark, max, isHighlightedColumn = false) => {
        const baseClass = `py-3 px-2 border border-slate-300 dark:border-slate-700 font-black text-xs transition-colors`;
        const highlightBg = isHighlightedColumn ? "bg-amber-50/50 dark:bg-amber-950/10" : "";
        
        return isBelowHalf(mark, max) 
            ? `${baseClass} text-red-600 dark:text-red-400 ${highlightBg}` 
            : `${baseClass} text-slate-800 dark:text-slate-200 ${highlightBg}`;
    };

    // Rendu dynamique du badge de statut (Point de vue Titulaire)
    const renderStatusBadge = () => {
        switch (visaStatus) {
            case 'VALIDATED_BY_PROVISEUR':
                return (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Reçu du Proviseur (À Valider)
                    </span>
                );
            case 'VALIDATED_BY_TITULAIRE':
                return (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-600" /> Clôturé & Intégré au Bulletin
                    </span>
                );
            case 'SUBMITTED_TO_PROVISEUR':
                return (
                    <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin text-blue-600" /> Chez le Proviseur
                    </span>
                );
            case 'DRAFT':
            default:
                return (
                    <span className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle size={14} className="text-slate-500" /> Non soumis par l'enseignant
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400" />
                <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">
                    Chargement de la fiche de cotes...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12 select-none w-full">
            
            {/* Header d'authentification et de contrôle */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/enseignant/titulaire')} 
                        className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-800 text-white dark:bg-emerald-900 dark:text-emerald-100 rounded-md uppercase tracking-wider flex items-center gap-1">
                                <BookOpen size={12} /> {matrixData?.classroomName}
                            </span>
                            <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={12} /> PÉRIODE {currentPeriod}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                            {matrixData?.subjectName}
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wide">
                            Examen et intégration des cotes pour les bulletins
                        </p>
                    </div>
                </div>

                {/* Statut & Actions Principales du Titulaire */}
                <div className="flex flex-wrap items-center gap-3 border-t xl:border-t-0 pt-3 xl:pt-0 border-slate-100 dark:border-slate-800">
                    {renderStatusBadge()}

                    {/* Le Titulaire ne peut agir que si le Proviseur a validé */}
                    {visaStatus === 'VALIDATED_BY_PROVISEUR' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all uppercase tracking-wider"
                            >
                                <XCircle size={15} /> Signaler Erreur
                            </button>
                            <button
                                onClick={() => setShowApproveModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-md uppercase tracking-wider"
                            >
                                <CheckCircle size={15} /> Valider au Bulletin
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Corps de la Fiche de notes officielle (Matrice) */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-300 dark:border-slate-700 flex items-center gap-2">
                    <FileText size={18} className="text-slate-700 dark:text-slate-300" />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                        Contenu de la Fiche Matricielle Visée par le Proviseur
                    </h3>
                </div>

                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-center border-collapse table-auto min-w-max">
                        <thead>
                            {/* Entêtes Groupés */}
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black uppercase text-[10px] border-b border-slate-300 dark:border-slate-700">
                                <th colSpan="3" className="py-3 px-3 border-r border-slate-300 dark:border-slate-700 text-left">Élèves</th>
                                <th colSpan="4" className={`py-3 px-2 border-r border-slate-300 dark:border-slate-700 bg-blue-50/40 dark:bg-blue-900/10 ${(currentPeriod === 1 || currentPeriod === 2) ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}>
                                    Premier Semestre (S1)
                                </th>
                                <th colSpan="4" className={`py-3 px-2 border-r border-slate-300 dark:border-slate-700 bg-indigo-50/40 dark:bg-indigo-900/10 ${(currentPeriod === 3 || currentPeriod === 4) ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}>
                                    Second Semestre (S2)
                                </th>
                                <th className="py-3 px-3 bg-slate-50 dark:bg-slate-950">Synthèse</th>
                            </tr>
                            
                            {/* Colonnes individuelles */}
                            <tr className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-black uppercase text-[9px] tracking-wider border-b border-slate-300 dark:border-slate-700">
                                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-12">N°</th>
                                <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 w-32 text-left">Matricule</th>
                                <th className="py-2.5 px-4 border-r border-slate-300 dark:border-slate-700 text-left min-w-[240px]">Nom Complet & Postnom</th>
                                
                                {/* S1 columns */}
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 1 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>P1</th>
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 2 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>P2</th>
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 2 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>Ex1</th>
                                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 bg-blue-100/50 dark:bg-blue-900/20 text-blue-950 dark:text-blue-200">Tot.S1</th>
                                
                                {/* S2 columns */}
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 3 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>P3</th>
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 4 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>P4</th>
                                <th className={`py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 ${currentPeriod === 4 ? 'bg-emerald-50 dark:bg-emerald-950/30 font-black text-slate-900 dark:text-white' : ''}`}>Ex2</th>
                                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-950 dark:text-indigo-200">Tot.S2</th>
                                
                                <th className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">Tot.Gen</th>
                            </tr>

                            {/* Maxima de l'unité de cours */}
                            <tr className="bg-slate-900 text-white font-black uppercase text-[10px] border-b border-slate-900">
                                <th colSpan="3" className="py-2 px-3 text-right text-slate-300 italic">Barème (Maxima) :</th>
                                <th className={currentPeriod === 1 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxP1 ?? '-'}</th>
                                <th className={currentPeriod === 2 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxP2 ?? '-'}</th>
                                <th className={currentPeriod === 2 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxExam1 ?? '-'}</th>
                                <th className="bg-blue-900">{matrixData?.maxS1 ?? '-'}</th>
                                <th className={currentPeriod === 3 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxP3 ?? '-'}</th>
                                <th className={currentPeriod === 4 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxP4 ?? '-'}</th>
                                <th className={currentPeriod === 4 ? 'bg-emerald-600 text-white' : ''}>{matrixData?.maxExam2 ?? '-'}</th>
                                <th className="bg-indigo-900">{matrixData?.maxS2 ?? '-'}</th>
                                <th className="bg-slate-800">{matrixData?.maxTotalGeneral ?? '-'}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {matrixData?.students && matrixData.students.length > 0 ? (
                                matrixData.students.map((student, idx) => (
                                    <tr key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors even:bg-slate-50/30 dark:even:bg-slate-800/10">
                                        <td className="py-3 px-2 border-r border-slate-300 dark:border-slate-700 text-slate-500 font-bold text-xs bg-slate-50/50 dark:bg-slate-950/20">{idx + 1}</td>
                                        <td className="py-3 px-3 border-r border-slate-300 dark:border-slate-700 font-mono text-[11px] text-left text-slate-600 dark:text-slate-400">{student.matricule}</td>
                                        <td className="py-3 px-4 border-r border-slate-300 dark:border-slate-700 text-left font-black text-slate-900 dark:text-slate-100 uppercase text-[11px] truncate">
                                            {student.fullName}
                                        </td>
                                        
                                        {/* Notes du Premier Semestre */}
                                        <td className={getMarkClass(student.p1, matrixData?.maxP1, currentPeriod === 1)}>{student.p1 ?? '-'}</td>
                                        <td className={getMarkClass(student.p2, matrixData?.maxP2, currentPeriod === 2)}>{student.p2 ?? '-'}</td>
                                        <td className={getMarkClass(student.exam1, matrixData?.maxExam1, currentPeriod === 2)}>{student.exam1 ?? '-'}</td>
                                        <td className={`py-3 px-2 border-r border-slate-300 dark:border-slate-700 font-black bg-blue-50/20 dark:bg-blue-950/10 text-xs ${isBelowHalf(student.totalS1, matrixData?.maxS1) ? 'text-red-600' : 'text-blue-900 dark:text-blue-300'}`}>
                                            {student.totalS1 ?? '-'}
                                        </td>
                                        
                                        {/* Notes du Second Semestre */}
                                        <td className={getMarkClass(student.p3, matrixData?.maxP3, currentPeriod === 3)}>{student.p3 ?? '-'}</td>
                                        <td className={getMarkClass(student.p4, matrixData?.maxP4, currentPeriod === 4)}>{student.p4 ?? '-'}</td>
                                        <td className={getMarkClass(student.exam2, matrixData?.maxExam2, currentPeriod === 4)}>{student.exam2 ?? '-'}</td>
                                        <td className={`py-3 px-2 border-r border-slate-300 dark:border-slate-700 font-black bg-indigo-50/20 dark:bg-indigo-950/10 text-xs ${isBelowHalf(student.totalS2, matrixData?.maxS2) ? 'text-red-600' : 'text-indigo-900 dark:text-indigo-300'}`}>
                                            {student.totalS2 ?? '-'}
                                        </td>
                                        
                                        {/* Total Général de l'année */}
                                        <td className={`py-3 px-3 font-black text-xs bg-slate-100 dark:bg-slate-950 text-center ${isBelowHalf(student.totalGeneral, matrixData?.maxTotalGeneral) ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                            {student.totalGeneral ?? '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                                        Aucun élève trouvé ou enregistré pour cette classe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL 1 : CONFIRMATION DE VALIDATION FINALE AU BULLETIN --- */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                            Intégration au Bulletin
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            En confirmant cette action, les notes de la <strong className="text-slate-800 dark:text-slate-200 uppercase">Période {currentPeriod}</strong> seront officiellement scellées et intégrées pour le calcul automatique des bulletins.
                        </p>
                        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setShowApproveModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleApproveFiche}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-md disabled:opacity-50"
                            >
                                {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                Confirmer & Intégrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2 : FORMULAIRE DE REJET AVEC MOTIF --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4">
                    <form onSubmit={handleRejectFiche} className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-200 dark:border-red-800">
                            <XCircle size={24} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                            Signaler une anomalie
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                            Si les cotes reçues ne correspondent pas aux évaluations de la <strong className="text-slate-800 dark:text-slate-200">Période {currentPeriod}</strong>, indiquez le motif ci-dessous. La fiche sera renvoyée.
                        </p>
                        
                        <div className="space-y-1.5 mb-6">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MessageSquare size={12} /> Motif de l'anomalie :
                            </label>
                            <textarea
                                required
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                placeholder="Ex: Cotes manquantes pour certains élèves / Erreur flagrante par rapport au carnet physique..."
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border-2 border-slate-300 dark:border-slate-700 focus:border-red-500 focus:outline-none rounded-xl p-3 placeholder-slate-400 resize-none transition-colors"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectComment('');
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading || !rejectComment.trim()}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-md disabled:opacity-50"
                            >
                                {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                Renvoyer
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TitulaireGradeSheetValidation;