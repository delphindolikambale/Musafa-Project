import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, User, Calendar, FileText, 
    BadgeCheck, Info, Eye, Trash2 
} from 'lucide-react';
import ArchiveService from '../../services/ArchiveService';
import { enrollmentService } from '../../services/enrollmentService';

const StudentArchiveDetail = ({ selectedMatricule, onBack }) => {
    const { matricule: urlMatricule } = useParams();
    const matricule = selectedMatricule || urlMatricule;
    const navigate = useNavigate();

    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        if (!matricule) return;
        setLoading(true);
        try {
            const data = await ArchiveService.getStudentFolder(matricule);
            setFolder(data);
        } catch (error) {
            console.error("Erreur récupération dossier", error);
        } finally {
            setLoading(false);
        }
    }, [matricule]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const handleBackAction = () => {
        onBack ? onBack() : navigate('/archives');
    };

    const handleViewDocument = async (fileUrl) => {
        if (!fileUrl) return alert("Lien non disponible");
        await enrollmentService.viewDocumentSecurely(fileUrl);
    };

    /**
     * ✅ Correction : Utilisation du documentId pour correspondre au Backend
     */
    const handleDeleteDocument = async (enrollmentId, documentId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
            try {
                await ArchiveService.deleteDocument(enrollmentId, documentId);
                // Rafraîchir les données après suppression
                fetchDetails();
            } catch (error) {
                alert("Erreur lors de la suppression du document.");
            }
        }
    };

    if (loading) return <div className="p-10 text-center text-blue-600 font-bold italic text-xl">Analyse du dossier en cours...</div>;

    if (!folder) return (
        <div className="p-10 text-center text-red-500 bg-white m-8 rounded-2xl shadow-sm border border-red-50">
            <Info className="mx-auto mb-4" size={48} />
            <p className="text-xl font-bold italic">DOSSIER INTROUVABLE</p>
            <button onClick={handleBackAction} className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-black italic uppercase shadow-lg shadow-blue-200">Retour aux archives</button>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <button onClick={handleBackAction} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-black uppercase italic text-xs">
                    <ArrowLeft size={18} /> Retour aux archives
                </button>
                <span className="text-[10px] font-black text-gray-400 bg-white border border-gray-100 px-4 py-1.5 rounded-full shadow-sm uppercase italic">Matricule: {folder.matricule}</span>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden">
                    <div className="w-40 h-40 rounded-3xl bg-blue-50 flex items-center justify-center border-4 border-white shadow-xl">
                        <User size={80} className="text-blue-200" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none mb-4">
                            {folder.lastName} {folder.postName} {folder.firstName}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-6 py-2 bg-blue-600 text-white rounded-2xl text-xs font-black italic shadow-lg shadow-blue-100 uppercase">Dossier Actif</span>
                            <span className="px-6 py-2 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black italic uppercase">Élève Régulier</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Calendar className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Parcours Scolaire & Archives</h2>
                </div>

                <div className="space-y-8">
                    {folder.academicHistory?.map((year, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase italic mb-1">Année Scolaire {year.academicYear}</p>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{year.className}</h3>
                                </div>
                                <div className="px-5 py-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 shadow-sm">
                                    <BadgeCheck className="text-green-500" size={16} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase italic">{year.result || 'ADMIS'}</span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {year.documents?.map((doc, dIdx) => (
                                    <div key={doc.id || dIdx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <FileText className="text-slate-400 group-hover:text-blue-500" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase italic leading-none">
                                                    {dIdx + 1}. {doc.customName || "Document"} :
                                                </p>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Fichier Numérique PDF</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleViewDocument(doc.fileUrl)} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Visualiser"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteDocument(year.enrollmentId, doc.id)} // ✅ Correction : On passe doc.id
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!year.documents || year.documents.length === 0) && (
                                    <div className="col-span-full py-6 text-center border-2 border-dashed border-slate-50 rounded-2xl">
                                        <p className="text-slate-400 font-bold italic text-xs uppercase">Aucun document archivé pour cette période</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentArchiveDetail;