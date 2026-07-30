import React, { useState, useEffect } from 'react';
import { 
    UserPlus, Search, Filter, Download, RefreshCw, 
    Mail, Phone, MapPin, Eye, Pencil, Trash2, User, BookOpen, CheckCircle2, XCircle, Calendar
} from 'lucide-react';

import TeacherService, { getFileUrl } from '../../../services/pedagogieService/TeacherService';
import AddTeacherModal from './AddTeacherModal';
import ViewTeacherModal from './ViewTeacherModal';
import EditTeacherModal from './EditTeacherModal';

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [selectedTeacherToView, setSelectedTeacherToView] = useState(null);
    const [selectedTeacherToEdit, setSelectedTeacherToEdit] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    const renderPedagogicalDays = (pedagogicalDays) => {
        const days = Array.isArray(pedagogicalDays) 
            ? pedagogicalDays 
            : (typeof pedagogicalDays === 'string' ? pedagogicalDays.split(',').map(d => d.trim()).filter(Boolean) : []);

        if (days.length === 0) {
            return (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic">
                    Aucune
                </span>
            );
        }

        return (
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[160px] mx-auto">
                {days.map((day, idx) => (
                    <span 
                        key={idx} 
                        className="inline-flex items-center text-[9px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-500/20 shadow-xs"
                    >
                        {day}
                    </span>
                ))}
            </div>
        );
    };

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const data = await TeacherService.getAllTeachers();
            setTeachers(data || []);
            setFilteredTeachers(data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des enseignants:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        const searchLower = searchTerm.toLowerCase();
        const results = teachers.filter(teacher => {
            const pedDays = Array.isArray(teacher.pedagogicalDays) 
                ? teacher.pedagogicalDays.join(' ') 
                : (teacher.pedagogicalDays || teacher.journeesPedagogiques || '');

            return teacher.lastName?.toLowerCase().includes(searchLower) ||
                teacher.firstName?.toLowerCase().includes(searchLower) ||
                teacher.schoolRegistrationNumber?.toLowerCase().includes(searchLower) ||
                teacher.nationalRegistrationNumber?.toLowerCase().includes(searchLower) ||
                teacher.specialityDomainName?.toLowerCase().includes(searchLower) ||
                teacher.domainSpecialityName?.toLowerCase().includes(searchLower) ||
                pedDays.toLowerCase().includes(searchLower);
        });
        setFilteredTeachers(results);
    }, [searchTerm, teachers]);

    const handleView = (teacher) => {
        setSelectedTeacherToView(teacher);
        setIsViewModalOpen(true);
    };

    const handleEdit = (teacher) => {
        setSelectedTeacherToEdit(teacher);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'enseignant ${name} ? Cette action est irréversible.`)) {
            try {
                await TeacherService.deleteTeacher(id);
                setTeachers(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Erreur suppression:", error);
                alert("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 w-full max-w-full overflow-hidden">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Registre des Enseignants</h2>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-1">Gestion RH, journées pédagogiques et dossiers académiques du personnel</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-slate-900 dark:from-blue-500 dark:to-blue-700 hover:from-blue-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20 uppercase tracking-widest active:scale-95 whitespace-nowrap">
                    <UserPlus size={20} /> Nouvel Enseignant
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden w-full transition-colors">
                
                {/* Search & Actions Bar */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900 transition-colors">
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-full lg:w-96 shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                        <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom, matricule, spécialité, journée..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <button onClick={fetchTeachers} className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all shadow-sm" title="Actualiser">
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-bold text-sm">
                            <Filter size={18} /> <span className="hidden sm:inline">Filtrer</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-bold text-sm">
                            <Download size={18} /> <span className="hidden sm:inline">Exporter</span>
                        </button>
                    </div>
                </div>

                {/* Table Data */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse table-auto min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 dark:from-slate-800 dark:via-blue-950 dark:to-slate-800 text-white shadow-md">
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 whitespace-nowrap">Matricule</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Identité Complète</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Contact & Résidence</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Date de Naissance</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 text-center">Journées Pédagogiques</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 text-center">Statut</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center font-black text-slate-300 dark:text-slate-600 uppercase animate-pulse tracking-widest">
                                        Chargement des données...
                                    </td>
                                </tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center font-bold text-slate-400 dark:text-slate-500">
                                        Aucun enseignant trouvé.
                                    </td>
                                </tr>
                            ) : filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group">
                                    
                                    <td className="p-5 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                {teacher.schoolRegistrationNumber || "SANS-MATR"}
                                            </span>
                                            {teacher.nationalRegistrationNumber && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 break-words mt-1">
                                                    ID: {teacher.nationalRegistrationNumber}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 shadow-inner group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-slate-700 dark:group-hover:to-slate-600 transition-all border border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-slate-500 overflow-hidden">
                                                {teacher.profilePicturePath ? (
                                                    <img 
                                                        src={getFileUrl(teacher.profilePicturePath)} 
                                                        alt={`${teacher.lastName}`} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { 
                                                            e.target.onerror = null; 
                                                            e.target.src = `https://ui-avatars.com/api/?name=${teacher.lastName}+${teacher.firstName}&background=random&color=fff`; 
                                                        }}
                                                    />
                                                ) : (
                                                    <User size={20} className="text-slate-400 dark:text-slate-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">
                                                    {teacher.lastName} {teacher.middleName} {teacher.firstName}
                                                </span>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                                                    {teacher.gender === 'M' ? 'Homme' : 'Femme'} • {teacher.maritalStatus || 'N/A'}
                                                </span>
                                                
                                                {teacher.domainSpecialityName && (
                                                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg w-fit border border-blue-100 dark:border-blue-500/20 shadow-sm">
                                                        <BookOpen size={10} className="text-blue-500 dark:text-blue-400" /> 
                                                        {teacher.domainSpecialityName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                                                <Phone size={13} className="text-blue-500 dark:text-blue-400 shrink-0" /> 
                                                <span className="truncate">{teacher.phoneNumber || 'Non renseigné'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                                                <Mail size={13} className="text-orange-400 shrink-0" /> 
                                                <span className="truncate max-w-[150px] lg:max-w-xs">{teacher.email || 'Email absent'}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700 mt-1 w-fit">
                                                <MapPin size={13} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" /> 
                                                <span className="leading-tight line-clamp-1">{teacher.residentialAddress || 'Adresse non spécifiée'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Né(e) le</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{formatDate(teacher.dateOfBirth)}</span>
                                            </div>
                                            <div className="flex flex-col mt-1">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">À {teacher.placeOfBirth || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-5 align-middle text-center">
                                        {renderPedagogicalDays(teacher.pedagogicalDays || teacher.journeesPedagogiques)}
                                    </td>

                                    <td className="p-5 align-middle text-center">
                                        {teacher.active ? (
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Actif</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                                                <XCircle size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Inactif</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-5 align-middle text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleView(teacher)} className="p-2.5 bg-white dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-500 dark:text-blue-400 hover:text-white dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:border-transparent dark:hover:border-transparent transition-all shadow-sm group" title="Voir détails">
                                                <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                            
                                            <button onClick={() => handleEdit(teacher)} className="p-2.5 bg-white dark:bg-slate-800 hover:bg-amber-500 dark:hover:bg-amber-500 text-amber-500 dark:text-amber-400 hover:text-white dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:border-transparent dark:hover:border-transparent transition-all shadow-sm group" title="Modifier">
                                                <Pencil size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>

                                            <button onClick={() => handleDelete(teacher.id, teacher.lastName)} className="p-2.5 bg-white dark:bg-slate-800 hover:bg-red-500 dark:hover:bg-red-500 text-red-400 dark:text-red-400 hover:text-white dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:border-transparent dark:hover:border-transparent transition-all shadow-sm group" title="Supprimer">
                                                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals Section */}
            <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchTeachers} />
            <ViewTeacherModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} teacher={selectedTeacherToView} />
            <EditTeacherModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} teacher={selectedTeacherToEdit} onRefresh={fetchTeachers} />
        </div>
    );
};

export default TeacherManagement;