import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, FileText, Search, Loader2, Calendar } from 'lucide-react';
import GradeSheetService from '../../../services/pedagogieService/GradeSheetService';
import { toast } from 'react-hot-toast';
import { useSchool } from '../../../context/SchoolContext';

const GradeSheetReception = () => {
    const { activeYear } = useSchool();
    const navigate = useNavigate();
    const [pendingSheets, setPendingSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Le useEffect réagira automatiquement quand activeYear sera chargé dans le contexte
        if (activeYear?.id) {
            loadPendingSheets();
        } else if (!activeYear) {
            setLoading(false);
        }
    }, [activeYear?.id]);

    const loadPendingSheets = async () => {
        setLoading(true);
        try {
            const data = await GradeSheetService.getPendingGradeSheetsForProviseur(activeYear.id);
            setPendingSheets(data || []);
        } catch (error) {
            console.error("Erreur lors de la récupération :", error);
            toast.error("Impossible de charger les fiches en attente.");
        } finally {
            setLoading(false);
        }
    };

    const filteredSheets = pendingSheets.filter(s => 
        s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.classroomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Réception des Fiches</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">Validation des cotes soumises par les enseignants</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Rechercher classe ou cours..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chargement des fiches...</span>
                    </div>
                ) : filteredSheets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSheets.map((sheet) => (
                            <div key={sheet.teacherAssignmentId + "-" + sheet.period} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-all bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase">Période {sheet.period}</span>
                                    <Calendar size={16} className="text-slate-400" />
                                </div>
                                <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{sheet.subjectName}</h4>
                                <p className="text-xs font-bold text-slate-500 mt-1">{sheet.classroomName}</p>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Enseignant: <span className="text-slate-900 dark:text-slate-100">{sheet.teacherName}</span></p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Soumis le: {sheet.submissionDate ? new Date(sheet.submissionDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Date inconnue'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/proviseur/validation-fiche/${sheet.teacherAssignmentId}/${sheet.period}`)}
                                    className="w-full mt-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                >
                                    Ouvrir pour validation
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                            <FileText size={32} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Aucune fiche en attente</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeSheetReception;