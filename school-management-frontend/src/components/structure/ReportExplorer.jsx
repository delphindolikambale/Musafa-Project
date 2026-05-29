import React, { useState, useEffect } from 'react';
import ReportService from '../../services/ReportService';
import ReportPreview from './ReportPreview'; // Assurez-vous que le fichier existe dans le même dossier
import { Folder, FileText, Users, Printer, ArrowLeft, Info, AlertCircle, Loader2 } from 'lucide-react';

const ReportExplorer = ({ onBack }) => {
    const [structure, setStructure] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nouveaux états pour la prévisualisation
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [activeLoadingId, setActiveLoadingId] = useState(null);

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchStructure = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ReportService.getStructure();
            
            if (data && Array.isArray(data)) {
                setStructure(data);
            } else {
                setStructure([]);
            }
        } catch (err) {
            console.error("Erreur de récupération :", err);
            // ✅ CORRECTION : Message d'erreur dynamique adapté à la production
            setError("Impossible de contacter le serveur (Vérifiez votre connexion ou l'état du serveur).");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour ouvrir la prévisualisation
    const handleOpenPreview = async (classroomId) => {
        try {
            setIsPreviewLoading(true);
            setActiveLoadingId(classroomId);
            
            // Appel au service pour récupérer le ClassroomReportDetailDTO
            const detail = await ReportService.getClassroomDetail(classroomId, selectedYear.academicYearId);
            setPreviewData(detail);
        } catch (err) {
            console.error("Erreur aperçu:", err);
            alert("Erreur lors de la génération de l'aperçu. Vérifiez la connexion au serveur.");
        } finally {
            setIsPreviewLoading(false);
            setActiveLoadingId(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium">Connexion au serveur Spring Boot...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-slate-800 font-bold">{error}</p>
            <button onClick={fetchStructure} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                Réessayer
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            
            {/* Header Dynamique */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={selectedYear ? () => setSelectedYear(null) : onBack} 
                        className="p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                            {selectedYear ? "Classes" : "Rapports d'Inscriptions"}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">
                            {selectedYear ? selectedYear.academicYearLabel : "Sélectionnez une année scolaire"}
                        </p>
                    </div>
                </div>
                
                {selectedYear && (
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                        <Info size={14} /> {(selectedYear.classrooms || []).length} Classes trouvées
                    </div>
                )}
            </div>

            {!selectedYear ? (
                /* VUE 1 : GRILLE DES ANNÉES SCOLAIRES */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {structure.length > 0 ? (
                        structure.map(year => (
                            <div key={year.academicYearId} 
                                 onClick={() => setSelectedYear(year)}
                                 className="group cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                        <Folder size={40} className="text-blue-500 fill-blue-500/10" />
                                    </div>
                                    <div className="bg-slate-50 text-slate-400 text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase">
                                        Dossier
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">
                                    {year.academicYearLabel}
                                </h3>
                                <div className="flex items-center gap-2 mt-3 text-slate-400">
                                    <FileText size={14} />
                                    <span className="text-xs font-medium">
                                        {(year.classrooms || []).length} classes rattachées
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                            <p className="text-slate-500">Aucune donnée trouvée.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* VUE 2 : LISTE DES CLASSES DE L'ANNÉE SÉLECTIONNÉE */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(selectedYear.classrooms || []).map(classroom => (
                        <div key={classroom.classroomId} 
                             className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <FileText size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{classroom.classroomName}</h4>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                            <Users size={12} /> {classroom.totalStudents} Élèves
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-500">
                                            {classroom.boyCount} M <span className="text-slate-300 mx-1">|</span> {classroom.girlCount} F
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleOpenPreview(classroom.classroomId)}
                                disabled={isPreviewLoading}
                                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all text-sm font-bold shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                            >
                                {activeLoadingId === classroom.classroomId ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Printer size={16} />
                                )}
                                <span>{activeLoadingId === classroom.classroomId ? "Calcul..." : "Imprimer"}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* MODALE D'APERÇU (S'affiche par-dessus quand previewData n'est pas null) */}
            {previewData && (
                <ReportPreview 
                    data={previewData} 
                    onClose={() => setPreviewData(null)} 
                />
            )}
        </div>
    );
};

export default ReportExplorer;