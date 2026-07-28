import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import AddStudentForm from '../structure/AddStudentForm';
import { ThemeContext } from '../../App'; 
import { Users, UserCheck, UserPlus, Printer, Search, FolderOpen, Edit3, Trash2, GraduationCap, Calendar, MapPin, ShieldAlert } from 'lucide-react';

const StudentManagement = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [students, setStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const data = await studentService.getAll();
            setStudents(data);
        } catch (err) { console.error("Erreur de chargement:", err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("❗ Voulez-vous vraiment supprimer cet élève ?")) {
            try {
                await studentService.delete(id);
                fetchStudents();
            } catch (err) { alert("Erreur lors de la suppression"); }
        }
    };

    const handleToggleStatus = async (studentToUpdate) => {
        const nextStatus = studentToUpdate.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF';
        try {
            await studentService.update(studentToUpdate.id, { 
                ...studentToUpdate, 
                status: nextStatus 
            });
            fetchStudents(); 
        } catch (err) { 
            alert("Erreur de mise à jour du statut"); 
        }
    };

    const handlePrintList = () => {
        const printContent = document.getElementById('printable-area').innerHTML;
        const printWindow = window.open('', '_blank', 'height=600,width=900');
        printWindow.document.write(`<html><head><title>Registre Musafa</title><style>body{font-family:sans-serif;padding:30px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #e2e8f0;padding:12px;font-size:11px;}th{background:#1e3a8a;color:white;}.header{text-align:center;border-bottom:3px solid #1e3a8a;margin-bottom:20px;}</style></head><body><div class="header"><h1>COMPLEXE SCOLAIRE MUSAFA</h1><p>REGISTRE GÉNÉRAL</p></div>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.print();
    };

    const handleNavigateToEnrollment = () => {
        if (location.pathname.startsWith('/prefet')) {
            navigate('/prefet/inscriptions');
        } else {
            navigate('/inscriptions');
        }
    };

    const filteredAndSorted = students
        .filter(s => {
            const fullSearch = `${s.lastName} ${s.postName} ${s.firstName}`.toLowerCase();
            return fullSearch.includes(searchTerm.toLowerCase()) || 
                   (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase()));
        })
        .slice()
        .reverse();

    const bgMain = isDark ? "bg-[#0F172A]" : "bg-[#f8fafc]";
    const cardStyle = isDark ? "bg-[#1E293B] border-slate-700/60 text-white" : "bg-white border-slate-100 text-slate-900";

    return (
        <div className={`p-4 md:p-8 min-h-screen font-sans transition-colors duration-300 ${bgMain}`}>
            
            {/* CARDS STATISTIQUES HARMONISÉES AVEC DASHBOARD ADMIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 no-print">
                <StatCard 
                    title="Effectif Total" 
                    value={students.length} 
                    icon={<Users size={20} />} 
                    borderColor="border-l-blue-600"
                    iconBgColor={isDark ? "bg-blue-900/30" : "bg-blue-50"}
                    iconColor={isDark ? "text-blue-400" : "text-blue-600"}
                    isDark={isDark} 
                />
                <StatCard 
                    title="Garçons" 
                    value={students.filter(s => s.gender === 'MASCULIN').length} 
                    icon={<UserCheck size={20} />} 
                    borderColor="border-l-orange-500"
                    iconBgColor={isDark ? "bg-orange-900/30" : "bg-orange-50"}
                    iconColor={isDark ? "text-orange-400" : "text-orange-600"}
                    isDark={isDark} 
                />
                <StatCard 
                    title="Filles" 
                    value={students.filter(s => s.gender === 'FEMININ').length} 
                    icon={<UserPlus size={20} />} 
                    borderColor="border-l-emerald-500"
                    iconBgColor={isDark ? "bg-emerald-900/30" : "bg-emerald-50"}
                    iconColor={isDark ? "text-emerald-400" : "text-emerald-600"}
                    isDark={isDark} 
                />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 no-print">
                <div>
                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Registre des élèves
                    </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un élève..." 
                            className={`w-full border rounded-2xl pl-11 pr-4 py-3 text-sm outline-none shadow-sm transition-all ${
                                isDark 
                                    ? 'bg-[#1E293B] border-slate-700/60 text-white placeholder-slate-400 focus:border-blue-500' 
                                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600'
                            }`} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={handlePrintList} 
                            className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase shadow-sm transition-all flex items-center justify-center gap-2 ${
                                isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            <Printer size={14} />
                            <span>Imprimer</span>
                        </button>
                        
                        <button 
                            onClick={handleNavigateToEnrollment} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <GraduationCap size={14} />
                            <span>Inscription</span>
                        </button>
                        
                        <button 
                            onClick={() => { setEditingStudent(null); setShowForm(true); }} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <UserPlus size={14} />
                            <span>Nouvel Élève</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id="printable-area" className={`rounded-[2.5rem] shadow-sm border overflow-hidden transition-all ${cardStyle}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#0F172A] to-blue-900 text-white">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b border-indigo-950/20">Matricule</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b border-indigo-950/20">Élève</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-indigo-950/20">N° National</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-indigo-950/20">Statut</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right no-print border-b border-indigo-950/20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                            {filteredAndSorted.map((s) => (
                                <tr key={s.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-blue-50/20'}`}>
                                    <td className="px-6 py-4 font-black text-blue-500 text-sm">{s.matricule || '---'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 min-w-[2.5rem] rounded-xl overflow-hidden border flex items-center justify-center ${
                                                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                                            }`}>
                                                {s.photoUrl ? (
                                                    <img src={s.photoUrl} className="h-full w-full object-cover" alt="Profil" />
                                                ) : (
                                                    <Users size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`font-black uppercase text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{s.lastName} {s.postName}</div>
                                                <div className="text-blue-500 text-[10px] font-bold tracking-wide">{s.firstName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">{s.permanentNumber || '—'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(s)} 
                                            className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all tracking-wider ${
                                                s.status === 'ACTIF' 
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/20' 
                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/20'
                                            }`}
                                        >
                                            {s.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right no-print">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => setSelectedStudent(s)} 
                                                className={`p-2 rounded-xl transition-all hover:scale-105 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                            >
                                                <FolderOpen size={14} />
                                            </button>
                                            <button 
                                                onClick={() => { setEditingStudent(s); setShowForm(true); }} 
                                                className={`p-2 rounded-xl transition-all hover:scale-105 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(s.id)} 
                                                className={`p-2 rounded-xl transition-all hover:scale-105 ${isDark ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'}`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className={`${isDark ? 'bg-[#1E293B] text-white border-slate-700/60' : 'bg-white text-slate-900 border-slate-200'} border rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transform transition-all`}>
                        <div className="bg-gradient-to-r from-[#0F172A] to-blue-900 p-6 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2"><FolderOpen size={16} /> Fiche de l'élève</h2>
                            <button onClick={() => setSelectedStudent(null)} className="text-2xl leading-none text-slate-300 hover:text-white transition-colors">&times;</button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left pb-6 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="h-24 w-24 shrink-0 rounded-[1.8rem] border-4 border-slate-100 dark:border-slate-700 shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {selectedStudent.photoUrl ? (
                                        <img src={selectedStudent.photoUrl} className="h-full w-full object-cover" alt="Profil" />
                                    ) : (
                                        <Users size={32} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-tight">{selectedStudent.lastName} {selectedStudent.postName}</h3>
                                    <p className="text-base font-bold text-blue-600 tracking-wide">{selectedStudent.firstName}</p>
                                    <span className="inline-block text-[10px] font-mono uppercase bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold">Matricule: {selectedStudent.matricule}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <DetailItem icon={<Calendar size={14} />} label="Naissance" value={`${selectedStudent.birthDate || '—'} à ${selectedStudent.birthPlace || '—'}`} isDark={isDark} />
                                <DetailItem icon={<Users size={14} />} label="Genre" value={selectedStudent.gender} isDark={isDark} />
                                <DetailItem icon={<UserCheck size={14} />} label="Nom du Père" value={selectedStudent.fatherName} isDark={isDark} />
                                <DetailItem icon={<UserCheck size={14} />} label="Nom de la Mère" value={selectedStudent.motherName} isDark={isDark} />
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">Fermer la fiche</button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className={`${isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-200'} border rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transform transition-all`}>
                        <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                            <h2 className={`font-black uppercase text-xs tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                                {editingStudent ? "Modification des données" : "Formulaire d'inscription"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors leading-none">&times;</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <AddStudentForm initialData={editingStudent} onStudentAdded={() => { setShowForm(false); fetchStudents(); }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// COMPOSANT COMPLEMENTAIRE: STATCARD SYNCHRONISÉ AVEC L'ADMIN
const StatCard = ({ title, subtitle, value, bottomText, icon, borderColor, iconBgColor, iconColor, isDark }) => (
    <div className={`p-6 rounded-2xl shadow-sm border-y border-r border-l-[5px] transition-all duration-200 flex items-center justify-between
        ${isDark ? 'bg-[#1E293B] border-y-slate-700/60 border-r-slate-700/60' : 'bg-white border-y-slate-100 border-r-slate-100'} 
        ${borderColor} hover:shadow-md`}
    >
      <div className="flex flex-col justify-center">
        <h3 className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </h3>
        {subtitle && <p className={`text-[10px] font-medium mt-0.5 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
        
        <div className={`text-3xl font-black ${subtitle ? 'mt-1' : 'mt-2'} ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {value}
        </div>
        
        {bottomText && <p className={`text-[10px] font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{bottomText}</p>}
      </div>
      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}>
        {icon}
      </div>
    </div>
);

// COMPOSANT COMPLEMENTAIRE: ITEMS DE COMPOSANT DE DETAIL INDIVIDUEL
const DetailItem = ({ icon, label, value, isDark }) => (
    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/30 border-slate-700/50' : 'bg-slate-50/50 border-slate-100'}`}>
        <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
        </p>
        <p className={`font-bold text-xs uppercase ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value || '—'}</p>
    </div>
);

export default StudentManagement;