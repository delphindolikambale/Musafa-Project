import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArchiveService from '../../services/ArchiveService';

const ArchiveExplorer = () => {
    const { matricule } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                const data = await ArchiveService.getStudentFolder(matricule);
                setFolder(data);
            } catch (err) {
                console.error("Erreur archive:", err);
            } finally {
                setLoading(false);
            }
        };
        if (matricule) fetchFolder();
    }, [matricule]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 uppercase text-xs tracking-widest">Ouverture du dossier archive...</p>
        </div>
    );

    if (!folder) return <div className="p-20 text-center font-bold">Dossier introuvable.</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
            {/* Header Sticky */}
            <div className="bg-[#0F172A] text-white p-6 shadow-xl border-b-4 border-amber-500 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/archives')} className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold text-xl">←</button>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                                Dossier <span className="text-amber-500">Archive</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Consultation Historique</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-amber-500 font-mono tracking-widest">{folder.matricule}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Matricule Officiel</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10">
                {/* 1. Bloc Identité (Pochette du dossier) */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-12 flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-slate-50 p-10 flex flex-col items-center border-r">
                        <div className="w-48 h-48 bg-white rounded-[2rem] shadow-inner border-4 border-white overflow-hidden relative group">
                            {folder.photoUrl ? (
                                <img src={folder.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-100 text-slate-300">👤</div>
                            )}
                            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className={`mt-6 px-6 py-2 rounded-full text-[10px] font-black uppercase ${folder.currentStatus === 'ACTIF' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            Statut: {folder.currentStatus}
                        </div>
                    </div>
                    
                    <div className="md:w-2/3 p-10 flex flex-col justify-center">
                        <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                            {folder.lastName} <br/>
                            <span className="text-slate-400 text-4xl">{folder.postName} {folder.firstName}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-8 mt-8 border-t pt-8 border-dashed">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Père</p>
                                <p className="font-bold text-slate-700">{folder.fatherInfo || "Non renseigné"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mère</p>
                                <p className="font-bold text-slate-700">{folder.motherInfo || "Non renseigné"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Liste des Dossiers Annuels (Timeline) */}
                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3">
                    <span className="w-10 h-1 bg-amber-500 rounded-full"></span>
                    Parcours Académique & Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {folder.academicHistory.map((year, idx) => (
                        <div key={idx} className="group relative bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 hover:border-amber-400 transition-all cursor-default">
                            {/* Onglet de dossier jaune style "Windows/Office" */}
                            <div className="absolute -top-3 left-8 bg-amber-400 text-white px-4 py-1 rounded-t-lg font-black text-[10px] uppercase shadow-sm">
                                {year.academicYear}
                            </div>

                            <div className="mt-2">
                                <h4 className="text-2xl font-black text-slate-800 leading-tight mb-1">{year.className}</h4>
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{year.enrollmentType}</span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                                    <span className="text-slate-400 font-bold uppercase">Résultat</span>
                                    <span className={`font-black ${year.result === 'Admis' ? 'text-emerald-500' : 'text-slate-700'}`}>{year.result}</span>
                                </div>
                                
                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Pièces Numérisées :</p>
                                    <div className="space-y-2">
                                        {year.documents && year.documents.length > 0 ? (
                                            year.documents.map((doc, dIdx) => (
                                                <div key={dIdx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200 group/doc">
                                                    <span className="text-xl">📄</span>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[10px] font-bold text-slate-700 truncate">{doc.fileName}</p>
                                                        <p className="text-[8px] font-black text-blue-500 uppercase">{doc.type}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-slate-300 italic">Aucun document dans ce dossier.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArchiveExplorer;