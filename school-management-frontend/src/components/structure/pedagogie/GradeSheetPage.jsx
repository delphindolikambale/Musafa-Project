import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Loader2, RefreshCw } from 'lucide-react';
import GradeSheetService from '../../../services/pedagogieService/GradeSheetService';
import { toast } from 'react-hot-toast';

const GradeSheetPage = ({ assignment, activeYear, onBack }) => {
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (assignment?.id) {
            loadMatrixData();
        }
    }, [assignment]);

    const loadMatrixData = async () => {
        setLoading(true);
        try {
            const data = await GradeSheetService.getClassMatrixSheet(assignment.id);
            setMatrixData(data);
        } catch (error) {
            console.error("Erreur lors de la génération de la matrice :", error);
            toast.error("Impossible de générer la Fiche globale de notes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in pb-12">
            
            {/* Header d'identification */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-md uppercase tracking-wider">
                            Fiche de Cotes Officielle / Matrice Globale
                        </span>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">
                            {matrixData?.subjectName || assignment?.subjectName}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">
                            Classe : <span className="text-slate-600 dark:text-slate-300">{matrixData?.classroomName || assignment?.classroomName}</span> | Année Académique : {activeYear?.annee}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={loadMatrixData} 
                    className="p-3 bg-slate-100 text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 rounded-xl transition-all self-start sm:self-center"
                    title="Actualiser les calculs matriciels"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Matrice de Cotes Responsive */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <FileText size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Matrice Annuelle de Ventilation des Résultats
                        </h3>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calcul des totaux en cours...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-center border-collapse text-xs">
                            <thead>
                                {/* Ligne des entêtes groupés de Niveau 1 */}
                                <tr className="bg-slate-100/80 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[10px]">
                                    <th colSpan="4" className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-left">Identification de l'Élève</th>
                                    <th colSpan="4" className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400">Premier Semestre (S1)</th>
                                    <th colSpan="4" className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400">Second Semestre (S2)</th>
                                    <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">Bilan</th>
                                </tr>
                                {/* Ligne des périodes de Niveau 2 avec Maxima configurés Dynamiquement */}
                                <tr className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-4 text-left w-10">N°</th>
                                    <th className="py-3 px-4 text-left">Matricule</th>
                                    <th className="py-3 px-4 text-left min-w-[200px]">Nom complet</th>
                                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 w-10">Genre</th>
                                    
                                    {/* Périodes S1 */}
                                    <th className="py-3 px-3 bg-blue-50/10">P1 <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 mt-0.5">/{matrixData?.maxP1 ?? '-'}</span></th>
                                    <th className="py-3 px-3 bg-blue-50/10">P2 <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 mt-0.5">/{matrixData?.maxP2 ?? '-'}</span></th>
                                    <th className="py-3 px-3 bg-blue-50/10">Ex1 <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 mt-0.5">/{matrixData?.maxExam1 ?? '-'}</span></th>
                                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 bg-blue-50/30 text-slate-800 dark:text-white font-black">Tot.S1 <span className="block text-[10px] mt-0.5">/{matrixData?.maxS1 ?? '-'}</span></th>
                                    
                                    {/* Périodes S2 */}
                                    <th className="py-3 px-3 bg-indigo-50/10">P3 <span className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5">/{matrixData?.maxP3 ?? '-'}</span></th>
                                    <th className="py-3 px-3 bg-indigo-50/10">P4 <span className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5">/{matrixData?.maxP4 ?? '-'}</span></th>
                                    <th className="py-3 px-3 bg-indigo-50/10">Ex2 <span className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5">/{matrixData?.maxExam2 ?? '-'}</span></th>
                                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 bg-indigo-50/30 text-slate-800 dark:text-white font-black">Tot.S2 <span className="block text-[10px] mt-0.5">/{matrixData?.maxS2 ?? '-'}</span></th>
                                    
                                    {/* Total Général */}
                                    <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/60 text-indigo-600 dark:text-indigo-400 font-black">T.Général <span className="block text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">/{matrixData?.maxTotalGeneral ?? '-'}</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-600 dark:text-slate-300">
                                {matrixData?.students && matrixData.students.length > 0 ? (
                                    matrixData.students.map((student, idx) => (
                                        <tr key={student.studentId} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                                            <td className="py-3.5 px-4 text-left font-bold text-slate-400">{idx + 1}</td>
                                            <td className="py-3.5 px-4 text-left font-mono tracking-wider text-[11px] text-slate-500">{student.matricule}</td>
                                            <td className="py-3.5 px-4 text-left font-black text-slate-800 dark:text-slate-100 uppercase text-[11px]">
                                                {student.fullName}
                                            </td>
                                            <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800 font-black text-slate-400">{student.gender}</td>
                                            
                                            {/* S1 scores */}
                                            <td className="py-3.5 px-3 bg-blue-50/5 font-bold">{student.p1 ?? '-'}</td>
                                            <td className="py-3.5 px-3 bg-blue-50/5 font-bold">{student.p2 ?? '-'}</td>
                                            <td className="py-3.5 px-3 bg-blue-50/5 font-bold">{student.exam1 ?? '-'}</td>
                                            <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800 font-black bg-blue-50/20 text-slate-900 dark:text-white">
                                                {student.totalS1 ?? '-'}
                                            </td>
                                            
                                            {/* S2 scores */}
                                            <td className="py-3.5 px-3 bg-indigo-50/5 font-bold">{student.p3 ?? '-'}</td>
                                            <td className="py-3.5 px-3 bg-indigo-50/5 font-bold">{student.p4 ?? '-'}</td>
                                            <td className="py-3.5 px-3 bg-indigo-50/5 font-bold">{student.exam2 ?? '-'}</td>
                                            <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800 font-black bg-indigo-50/20 text-slate-900 dark:text-white">
                                                {student.totalS2 ?? '-'}
                                            </td>
                                            
                                            {/* Final annual score */}
                                            <td className="py-3.5 px-6 font-black text-blue-600 dark:text-blue-400 bg-slate-50/60 dark:bg-slate-950/30 text-sm">
                                                {student.totalGeneral ?? '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="py-16 text-center text-slate-400 uppercase tracking-widest text-xs font-bold">
                                            Aucune donnée d'élève disponible pour générer la matrice.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeSheetPage;