import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Loader2, RefreshCw, Search } from 'lucide-react';
import GradeSheetService from '../../../services/pedagogieService/GradeSheetService';
import { toast } from 'react-hot-toast';

const GradeSheetPage = ({ assignment, activeYear, onBack }) => {
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Fonction utilitaire pour la logique de couleur rouge
    const isBelowHalf = (mark, max) => {
        if (mark === null || mark === undefined || mark === '-' || isNaN(mark) || !max || max === 0) return false;
        return parseFloat(mark) < (parseFloat(max) / 2);
    };

    // Classes CSS conditionnelles pour les notes
    const getMarkClass = (mark, max) => {
        const baseClass = "py-4 px-3 border border-slate-300 dark:border-slate-700 font-bold";
        return isBelowHalf(mark, max) 
            ? `${baseClass} text-red-600 dark:text-red-400` 
            : `${baseClass} text-slate-700 dark:text-slate-200`;
    };

    // Filtrage des élèves
    const filteredStudents = matrixData?.students ? matrixData.students.filter(student => 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="flex flex-col h-auto min-h-full space-y-6 animate-fade-in pb-12">
            
            {/* Header d'identification */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-md uppercase tracking-wider">
                            Fiche de Notes Officielle
                        </span>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">
                            {matrixData?.subjectName || assignment?.subjectName}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">
                            Classe : <span className="text-slate-600 dark:text-slate-300">{matrixData?.classroomName || assignment?.classroomName}</span> | Année Scolaire : {activeYear?.annee}
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

            {/* Matrice de Cotes Responsive - Look Excel Aéré */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                Fiche de Notes
                            </h3>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Rechercher un élève..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calcul des totaux en cours...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner">
                        <table className="w-full text-center border-collapse text-xs table-auto">
                            <thead>
                                {/* Ligne des entêtes groupés de Niveau 1 */}
                                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black uppercase text-[10px]">
                                    <th colSpan="4" className="py-4 px-4 border-r border-slate-300 dark:border-slate-700 text-left">Identification</th>
                                    <th colSpan="4" className="py-4 px-4 border-r border-slate-300 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">Premier Semestre (S1)</th>
                                    <th colSpan="4" className="py-4 px-4 border-r border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300">Second Semestre (S2)</th>
                                    <th className="py-4 px-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">Général</th>
                                </tr>
                                {/* Ligne des titres de colonnes */}
                                <tr className="bg-white dark:bg-slate-900 text-slate-500 font-bold uppercase text-[9px] tracking-widest">
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 w-10">N°</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 min-w-[80px]">Matricule</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 text-left min-w-[200px]">Nom complet</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 w-12">Genre</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800">P1</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800">P2</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800">Ex1</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100">Tot.S1</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800">P3</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800">P4</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800">Ex2</th>
                                    <th className="py-3 px-3 border border-slate-300 dark:border-slate-700 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100">Tot.S2</th>
                                    <th className="py-3 px-4 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">TOT.GEN</th>
                                </tr>
                                {/* Ligne des Maxima */}
                                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 font-black uppercase text-[10px]">
                                    <th colSpan="4" className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-right">Maxima</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxP1 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxP2 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxExam1 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-blue-900 dark:text-blue-300">{matrixData?.maxS1 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxP3 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxP4 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700">{matrixData?.maxExam2 ?? '-'}</th>
                                    <th className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-indigo-900 dark:text-indigo-300">{matrixData?.maxS2 ?? '-'}</th>
                                    <th className="py-2 px-4 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">{matrixData?.maxTotalGeneral ?? '-'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, idx) => (
                                        <tr key={student.studentId} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/20">
                                            <td className="py-4 px-3 border border-slate-300 dark:border-slate-700 text-slate-500 font-bold">{idx + 1}</td>
                                            <td className="py-4 px-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{student.matricule}</td>
                                            <td className="py-4 px-4 border border-slate-300 dark:border-slate-700 text-left font-black text-slate-800 dark:text-slate-100 uppercase text-[11px]">
                                                {student.fullName}
                                            </td>
                                            <td className="py-4 px-3 border border-slate-300 dark:border-slate-700 text-slate-500 font-bold">{student.gender}</td>
                                            
                                            {/* Notes S1 */}
                                            <td className={getMarkClass(student.p1, matrixData?.maxP1)}>{student.p1 ?? '-'}</td>
                                            <td className={getMarkClass(student.p2, matrixData?.maxP2)}>{student.p2 ?? '-'}</td>
                                            <td className={getMarkClass(student.exam1, matrixData?.maxExam1)}>{student.exam1 ?? '-'}</td>
                                            <td className={`${getMarkClass(student.totalS1, matrixData?.maxS1)} bg-blue-50/30 dark:bg-blue-900/10`}>
                                                {student.totalS1 ?? '-'}
                                            </td>
                                            
                                            {/* Notes S2 */}
                                            <td className={getMarkClass(student.p3, matrixData?.maxP3)}>{student.p3 ?? '-'}</td>
                                            <td className={getMarkClass(student.p4, matrixData?.maxP4)}>{student.p4 ?? '-'}</td>
                                            <td className={getMarkClass(student.exam2, matrixData?.maxExam2)}>{student.exam2 ?? '-'}</td>
                                            <td className={`${getMarkClass(student.totalS2, matrixData?.maxS2)} bg-indigo-50/30 dark:bg-indigo-900/10`}>
                                                {student.totalS2 ?? '-'}
                                            </td>
                                            
                                            {/* Final */}
                                            <td className={`${getMarkClass(student.totalGeneral, matrixData?.maxTotalGeneral)} bg-slate-100/50 dark:bg-slate-950/30 text-sm`}>
                                                {student.totalGeneral ?? '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="py-16 text-center text-slate-400 uppercase tracking-widest text-xs font-bold border border-slate-300 dark:border-slate-700">
                                            {searchQuery ? "Aucun élève ne correspond à votre recherche." : "Aucune donnée disponible."}
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