import React, { useState, useEffect } from 'react';
import { 
    UserPlus, Search, Filter, Download, RefreshCw, 
    Mail, Phone, MapPin, Eye, Pencil, Trash2, User, BookOpen, CheckCircle2, XCircle
} from 'lucide-react';

import TeacherService from '../../../services/pedagogieService/TeacherService';
import AddTeacherModal from './AddTeacherModal';
import ViewTeacherModal from './ViewTeacherModal';
import EditTeacherModal from './EditTeacherModal';

const getResourceUrl = (filePath) => {
    if (!filePath) return '';
    const cleanPath = filePath.replace(/\\/g, '/');
    const timestamp = new Date().getTime();
    return `http://localhost:8080/api/resources/view?path=${encodeURIComponent(cleanPath)}&t=${timestamp}`;
};

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
        const results = teachers.filter(teacher => 
            teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.schoolRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.nationalRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.specialityDomainName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Registre des Enseignants</h2>
                    <p className="text-slate-400 font-bold text-sm mt-1">Gestion RH et dossiers académiques du personnel</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-slate-900 hover:from-blue-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200/50 uppercase tracking-widest active:scale-95 whitespace-nowrap">
                    <UserPlus size={20} /> Nouvel Enseignant
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden w-full">
                
                {/* Search & Actions Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
                    <div className="flex items-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 w-full lg:w-96 shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom, matricule, spécialité..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full font-bold text-slate-700 placeholder:text-slate-400 outline-none" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <button onClick={fetchTeachers} className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm" title="Actualiser">
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all font-bold text-sm">
                            <Filter size={18} /> <span className="hidden sm:inline">Filtrer</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all font-bold text-sm">
                            <Download size={18} /> <span className="hidden sm:inline">Exporter</span>
                        </button>
                    </div>
                </div>

                {/* Table Data */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left border-collapse table-auto min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 text-white shadow-md">
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 whitespace-nowrap">Matricule</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Identité Complète</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Contact & Résidence</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10">Date de Naissance </th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 text-center">Statut</th>
                                <th className="p-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-white/10 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center font-black text-slate-300 uppercase animate-pulse tracking-widest">
                                        Chargement des données...
                                    </td>
                                </tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center font-bold text-slate-400">
                                        Aucun enseignant trouvé.
                                    </td>
                                </tr>
                            ) : filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-blue-50/40 transition-colors group">
                                    
                                    <td className="p-5 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-black text-blue-600 whitespace-nowrap">
                                                {teacher.schoolRegistrationNumber || "SANS-MATR"}
                                            </span>
                                            {teacher.nationalRegistrationNumber && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 break-words mt-1">
                                                    ID: {teacher.nationalRegistrationNumber}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 shadow-inner group-hover:from-blue-100 group-hover:to-blue-200 transition-all border border-slate-200 group-hover:border-blue-300 overflow-hidden">
                                                {teacher.profilePicturePath ? (
                                                    <img 
                                                        src={getResourceUrl(teacher.profilePicturePath)} 
                                                        alt={`${teacher.lastName}`} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { 
                                                            e.target.onerror = null; 
                                                            e.target.src = `https://ui-avatars.com/api/?name=${teacher.lastName}+${teacher.firstName}&background=random&color=fff`; 
                                                        }}
                                                    />
                                                ) : (
                                                    <User size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">
                                                    {teacher.lastName} {teacher.middleName} {teacher.firstName}
                                                </span>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 whitespace-nowrap">
                                                    {teacher.gender === 'M' ? 'Homme' : 'Femme'} • {teacher.maritalStatus || 'N/A'}
                                                </span>
                                                
                                                {/* Badge de la Spécialité */}
                                                {teacher.domainSpecialityName && (
                                                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-lg w-fit border border-blue-100 shadow-sm">
                                                        <BookOpen size={10} className="text-blue-500" /> 
                                                        {teacher.domainSpecialityName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600">
                                                <Phone size={13} className="text-blue-500 shrink-0" /> 
                                                <span className="truncate">{teacher.phoneNumber || 'Non renseigné'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-slate-500">
                                                <Mail size={13} className="text-orange-400 shrink-0" /> 
                                                <span className="truncate max-w-[150px] lg:max-w-xs">{teacher.email || 'Email absent'}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 w-fit">
                                                <MapPin size={13} className="text-emerald-500 shrink-0 mt-0.5" /> 
                                                <span className="leading-tight line-clamp-1">{teacher.residentialAddress || 'Adresse non spécifiée'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-5 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Né(e) le</span>
                                                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{formatDate(teacher.dateOfBirth)}</span>
                                            </div>
                                            <div className="flex flex-col mt-1">
                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">À {teacher.placeOfBirth || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* COLONNE STATUT AJOUTÉE */}
                                    <td className="p-5 align-middle text-center">
                                        {teacher.active ? (
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Actif</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                                                <XCircle size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Inactif</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-5 align-middle text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleView(teacher)} className="p-2.5 bg-white hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all shadow-sm group" title="Voir détails">
                                                <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                            
                                            <button onClick={() => handleEdit(teacher)} className="p-2.5 bg-white hover:bg-amber-500 text-amber-500 hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all shadow-sm group" title="Modifier">
                                                <Pencil size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>

                                            <button onClick={() => handleDelete(teacher.id, teacher.lastName)} className="p-2.5 bg-white hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all shadow-sm group" title="Supprimer">
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