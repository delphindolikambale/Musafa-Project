import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import AddStudentForm from '../structure/AddStudentForm';
import { ThemeContext } from '../../App'; // Import du contexte

const StudentManagement = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    
    const navigate = useNavigate();
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

    const filtered = students.filter(s => {
        const fullSearch = `${s.lastName} ${s.postName} ${s.firstName}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase()) || 
               (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    // Styles dynamiques
    const bgMain = isDark ? "bg-[#0F172A]" : "bg-[#f8fafc]";
    const cardStyle = isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-slate-100 text-slate-900";

    return (
        <div className={`p-4 md:p-8 min-h-screen font-sans transition-colors duration-300 ${bgMain}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 no-print">
                <StatCard label="Effectif Total" value={students.length} color="bg-blue-900" icon="👥" isDark={isDark} />
                <StatCard label="Garçons" value={students.filter(s => s.gender === 'MASCULIN').length} color="bg-blue-600" icon="👦" isDark={isDark} />
                <StatCard label="Filles" value={students.filter(s => s.gender === 'FEMININ').length} color="bg-blue-400" icon="👧" isDark={isDark} />
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6 no-print">
                <div>
                    <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase leading-none ${isDark ? 'text-white' : 'text-blue-950'}`}>
                        REGISTRE <span className="text-blue-600 italic">MUSAFA</span>
                    </h1>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-2">Gestion administrative</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-3 rounded-2xl shadow-lg transition-all active:scale-95 border-2 flex-grow sm:flex-grow-0 text-center ${isDark ? 'bg-amber-400 border-amber-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'}`}
                    >
                        {isDark ? '☀️ Clair' : '🌙 Sombre'}
                    </button>

                    <input 
                        type="text" 
                        placeholder="Recherche..." 
                        className={`border-2 rounded-2xl px-5 py-3 w-full sm:w-64 text-sm outline-none shadow-sm flex-grow ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-100 placeholder-slate-400'}`} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    
                    <button onClick={handlePrintList} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg hover:bg-slate-700 flex-grow sm:flex-grow-0">🖨️ Imprimer</button>
                    <button onClick={() => navigate('/inscriptions')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-xs uppercase transition-all transform hover:scale-105 flex-grow sm:flex-grow-0">🎓 Inscription</button>
                    <button onClick={() => { setEditingStudent(null); setShowForm(true); }} className="bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-xs uppercase hover:bg-blue-800 transition-all flex-grow sm:flex-grow-0">+ Nouvel Élève</button>
                </div>
            </div>

            <div id="printable-area" className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${cardStyle}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className={isDark ? "bg-slate-900 text-white" : "bg-blue-900 text-white"}>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Matricule</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Élève</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">N° National</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Statut</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                            {filtered.map((s) => (
                                <tr key={s.id} className={isDark ? "hover:bg-slate-800/50" : "hover:bg-blue-50/30"}>
                                    <td className="px-6 py-4 font-black text-blue-500 text-sm">{s.matricule || '---'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-slate-100 overflow-hidden border">
                                                {s.photoUrl ? <img src={s.photoUrl} className="h-full w-full object-cover" alt="Profil" /> : <div className="h-full w-full flex items-center justify-center">👤</div>}
                                            </div>
                                            <div>
                                                <div className={`font-black uppercase text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{s.lastName} {s.postName}</div>
                                                <div className="text-blue-500 text-[10px] font-bold">{s.firstName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-[10px] text-slate-500">{s.permanentNumber}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleToggleStatus(s)} className={`text-[9px] font-black px-3 py-1 rounded-md transition-all ${s.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</button>
                                    </td>
                                    <td className="px-6 py-4 text-right no-print">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setSelectedStudent(s)} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>📂</button>
                                            <button onClick={() => { setEditingStudent(s); setShowForm(true); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>✏️</button>
                                            <button onClick={() => handleDelete(s.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-700 hover:bg-red-900/50' : 'bg-slate-100 hover:bg-red-100'}`}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fiche Individuelle Responsive */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'} border rounded-[2rem] md:rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col`}>
                        <div className="bg-blue-900 p-6 md:p-8 text-white flex justify-between items-start shrink-0">
                            <h2 className="text-xl md:text-2xl font-black uppercase italic">Fiche Individuelle</h2>
                            <button onClick={() => setSelectedStudent(null)} className="text-3xl leading-none hover:text-red-400 transition-colors">&times;</button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 mb-8 pb-8 border-b border-slate-700 items-center sm:items-start text-center sm:text-left">
                                <div className="h-28 w-28 md:h-32 md:w-32 shrink-0 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                                    {selectedStudent.photoUrl ? <img src={selectedStudent.photoUrl} className="h-full w-full object-cover" alt="Profil" /> : <div className="h-full w-full flex items-center justify-center text-4xl">👤</div>}
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black uppercase break-words">{selectedStudent.lastName}</h3>
                                    <p className="text-xl md:text-2xl font-bold text-blue-600 uppercase break-words">{selectedStudent.postName} {selectedStudent.firstName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DetailItem label="Naissance" value={`${selectedStudent.birthDate} à ${selectedStudent.birthPlace}`} isDark={isDark} />
                                <DetailItem label="Genre" value={selectedStudent.gender} isDark={isDark} />
                                <DetailItem label="Père" value={selectedStudent.fatherName} isDark={isDark} />
                                <DetailItem label="Mère" value={selectedStudent.motherName} isDark={isDark} />
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="mt-8 w-full py-4 bg-blue-900 hover:bg-blue-800 transition-colors text-white rounded-2xl font-black uppercase">Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire Responsive */}
            {showForm && (
                <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col`}>
                        <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h2 className={`font-black uppercase text-sm md:text-base ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>{editingStudent ? "Modification" : "Enregistrement"}</h2>
                            <button onClick={() => setShowForm(false)} className="text-3xl text-slate-400 hover:text-red-500 transition-colors leading-none">&times;</button>
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

const StatCard = ({ label, value, color, icon, isDark }) => (
    <div className={`${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 hover:shadow-md transition-shadow`}>
        <div className={`h-14 w-14 shrink-0 ${color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg`}>{icon}</div>
        <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-blue-900'}`}>{value}</p>
        </div>
    </div>
);

const DetailItem = ({ label, value, isDark }) => (
    <div>
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`font-bold text-sm md:text-base uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{value || '—'}</p>
    </div>
);

export default StudentManagement;