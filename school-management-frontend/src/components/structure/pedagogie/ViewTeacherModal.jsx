import React, { useMemo } from 'react';
import { 
    X, User, Mail, Phone, MapPin, Calendar, 
    Shield, Briefcase, GraduationCap, FileText, ExternalLink, BookOpen,
    CheckCircle2, XCircle
} from 'lucide-react';

const ViewTeacherModal = ({ isOpen, onClose, teacher }) => {
    if (!isOpen || !teacher) return null;

    const getResourceUrl = (path) => {
        if (!path) return '';
        return `http://localhost:8080/api/resources/view?path=${encodeURIComponent(path)}`;
    };

    const profileImageUrl = useMemo(() => {
        return getResourceUrl(teacher.profilePicturePath);
    }, [teacher.id, teacher.profilePicturePath]);

    const handleViewDocument = (path) => {
        if (!path) return;
        const docUrl = `${getResourceUrl(path)}&t=${new Date().getTime()}`;
        window.open(docUrl, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 shadow-inner overflow-hidden">
                            {teacher.profilePicturePath ? (
                                <img 
                                    src={profileImageUrl} 
                                    alt="Profil" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${teacher.lastName}+${teacher.firstName}&background=0284c7&color=fff`; }}
                                />
                            ) : (
                                <User size={28} className="text-blue-500" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight break-words leading-tight">
                                {teacher.lastName} {teacher.middleName} {teacher.firstName}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-blue-600 font-bold text-xs sm:text-sm">
                                    Matricule : {teacher.schoolRegistrationNumber || 'N/A'}
                                </p>
                                {/* Badge Statut Rapide */}
                                {teacher.active ? (
                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-200">
                                        <CheckCircle2 size={10} /> Actif
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-500 px-2 py-0.5 rounded-lg border border-rose-200">
                                        <XCircle size={10} /> Inactif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bloc Identité */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                <Shield size={16} /> Identité Personnelle
                            </h3>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                                <DetailRow 
                                    icon={<Shield />} 
                                    label="Statut du Compte" 
                                    value={
                                        <span className={teacher.active ? "text-emerald-600 font-black" : "text-rose-500 font-black"}>
                                            {teacher.active ? "OPÉRATIONNEL (ACTIF)" : "COMPTE DÉSACTIVÉ"}
                                        </span>
                                    } 
                                />
                                <DetailRow icon={<User />} label="Genre" value={teacher.gender === 'M' ? 'Masculin' : 'Féminin'} />
                                <DetailRow icon={<Shield />} label="État Civil" value={teacher.maritalStatus} />
                                
                                <DetailRow 
                                    icon={<BookOpen className="text-blue-500" />} 
                                    label="Spécialité / Domaine" 
                                    value={teacher.domainSpecialityName || "Généraliste / Non définie"}
                                />
                                
                                <DetailRow icon={<Calendar />} label="Date de naissance" value={formatDate(teacher.dateOfBirth)} />
                                <DetailRow icon={<MapPin />} label="Lieu de naissance" value={teacher.placeOfBirth} />
                                <DetailRow icon={<FileText />} label="Numéro National" value={teacher.nationalRegistrationNumber || 'N/A'} />
                            </div>
                        </div>

                        {/* Bloc Contact */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                <Phone size={16} /> Coordonnées & Contact
                            </h3>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                                <DetailRow icon={<Phone />} label="Téléphone" value={teacher.phoneNumber || 'Non renseigné'} />
                                <DetailRow icon={<Mail />} label="Email" value={teacher.email || 'Non renseigné'} />
                                <DetailRow icon={<MapPin />} label="Résidence" value={teacher.residentialAddress || 'Non renseignée'} />
                                <div className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-xl hover:bg-white transition-colors" onClick={() => handleViewDocument(teacher.cvPath)}>
                                    <DetailRow icon={<FileText />} label="Curriculum Vitae" value={teacher.cvPath ? "Consulter le CV" : "Non disponible"} />
                                    {teacher.cvPath && <ExternalLink size={16} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloc Professionnel */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Briefcase size={16} /> Titres & Formations
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Titres Académiques */}
                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                <h4 className="text-blue-700 font-bold mb-4 flex items-center gap-2 text-sm">
                                    <GraduationCap size={18}/> Titres Académiques
                                </h4>
                                {teacher.academicTitles && teacher.academicTitles.length > 0 ? (
                                    <div className="space-y-2">
                                        {teacher.academicTitles.map((title, index) => (
                                            <div key={index} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-blue-200 transition-colors">
                                                <span className="text-sm font-bold text-slate-700">{title.titleName}</span>
                                                {title.documentPath && (
                                                    <button onClick={() => handleViewDocument(title.documentPath)} title="Ouvrir le document" className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg transition-colors">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-slate-400 italic">Aucun titre enregistré.</p>}
                            </div>

                            {/* Formations & Stages */}
                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
                                <h4 className="text-emerald-700 font-bold mb-4 flex items-center gap-2 text-sm">
                                    <Briefcase size={18}/> Formations & Stages
                                </h4>
                                {teacher.trainings && teacher.trainings.length > 0 ? (
                                    <div className="space-y-2">
                                        {teacher.trainings.map((training, index) => (
                                            <div key={index} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-emerald-200 transition-colors">
                                                <span className="text-sm font-bold text-slate-700">{training.trainingName}</span>
                                                {training.documentPath && (
                                                    <button onClick={() => handleViewDocument(training.documentPath)} title="Ouvrir le document" className="text-emerald-500 hover:text-emerald-700 p-1.5 bg-emerald-50 rounded-lg transition-colors">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-slate-400 italic">Aucune formation enregistrée.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-10 py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                        Fermer le Dossier
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sous-composant pour l'affichage propre des lignes de détails
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 group">
        <div className="text-slate-300 mt-0.5 group-hover:text-blue-500 transition-colors">{React.cloneElement(icon, { size: 14 })}</div>
        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{label}</span>
            <div className="text-sm font-bold text-slate-700">{value || 'N/A'}</div>
        </div>
    </div>
);

export default ViewTeacherModal;