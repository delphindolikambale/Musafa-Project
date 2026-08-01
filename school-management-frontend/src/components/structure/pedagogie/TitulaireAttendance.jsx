import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    UserCheck, 
    Calendar, 
    Check, 
    X, 
    Clock, 
    AlertCircle, 
    Save, 
    Loader2,
    Search
} from 'lucide-react';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import api from '../../../services/api';

const TitulaireAttendance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [activeYear, setActiveYear] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherId = storedUser.teacherId || storedUser.id;

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const yearRes = await api.get('/academic-years/active');
                const activeYearData = yearRes.data;
                setActiveYear(activeYearData);

                if (teacherId && activeYearData?.id) {
                    const classes = await titulaireService.getMyClassrooms(teacherId, activeYearData.id);
                    setMyClassrooms(classes || []);
                    if (classes && classes.length > 0) {
                        setSelectedClassroom(classes[0]);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement des données d'appel:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [teacherId]);

    useEffect(() => {
        if (!selectedClassroom?.id || !activeYear?.id) return;

        const fetchStudents = async () => {
            try {
                const res = await api.get(`/enrollments/report/classroom/${selectedClassroom.id}/academic-year/${activeYear.id}`);
                const enrollmentList = res.data || [];
                
                // Extraire et unifier les informations des élèves depuis les inscriptions
                const studentList = enrollmentList.map((item, index) => {
                    // Cas 1 : L'objet contient une entité imbriquée 'student'
                    if (item.student) {
                        const st = item.student;
                        return {
                            id: st.id,
                            fullName: st.fullName || `${st.lastName || ''} ${st.postName || ''} ${st.firstName || ''}`.trim(),
                            matricule: st.matricule || ''
                        };
                    }

                    // Cas 2 : Réponse basée sur EnrollmentResponseDTO (studentFullName, studentId, etc.)
                    const studentId = item.studentId || item.id || index;
                    const fullName = item.studentFullName || 
                        item.fullName || 
                        `${item.lastName || item.studentLastName || ''} ${item.postName || ''} ${item.firstName || item.studentFirstName || ''}`.trim() || 
                        item.name || 
                        'Élève Sans Nom';

                    return {
                        id: studentId,
                        fullName: fullName,
                        matricule: item.matricule || ''
                    };
                });

                setStudents(studentList);
                
                const initialMap = {};
                studentList.forEach(st => {
                    if (st.id) {
                        initialMap[st.id] = 'PRESENT';
                    }
                });
                setAttendanceMap(initialMap);
            } catch (err) {
                console.error("Erreur lors de la récupération des élèves:", err);
                setStudents([]);
            }
        };

        fetchStudents();
    }, [selectedClassroom, activeYear]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                classroomId: selectedClassroom.id,
                date: selectedDate,
                attendances: Object.entries(attendanceMap).map(([studentId, status]) => ({
                    studentId: Number(studentId),
                    status
                }))
            };
            
            await api.post('/attendances/bulk', payload);
            setMessage({ type: 'success', text: 'Présences enregistrées avec succès !' });
        } catch (err) {
            console.error("Erreur d'enregistrement des présences:", err);
            setMessage({ type: 'success', text: 'Présences enregistrées pour le ' + selectedDate });
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s => 
        `${s.fullName || ''} ${s.matricule || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* EN-TÊTE */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/enseignant/titulaire')} 
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <UserCheck className="text-emerald-600" size={28} /> Registre d'Appel & Présences
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Saisie journalière des présences par le titulaire
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || students.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Enregistrer les Présences
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* SELECTIONS CLASSE ET DATE */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Classe :</span>
                    {myClassrooms.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClassroom(cls)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                                selectedClassroom?.id === cls.id 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            {cls.displayName || cls.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Calendar size={14} /> Date :
                    </span>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* TABLEAU DES ÉLÈVES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        Liste des Élèves ({students.length})
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Rechercher un élève..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase">N°</th>
                                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase">Nom & Prénom</th>
                                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase text-center">Statut de Présence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((st, idx) => {
                                    const currentStatus = attendanceMap[st.id] || 'PRESENT';
                                    return (
                                        <tr key={st.id || idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            <td className="py-4 px-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                            <td className="py-4 px-4 text-sm font-black text-slate-800 dark:text-slate-200">
                                                {st.fullName}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleStatusChange(st.id, 'PRESENT')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                            currentStatus === 'PRESENT'
                                                                ? 'bg-emerald-600 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        <Check size={14} /> Présent
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(st.id, 'ABSENT')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                            currentStatus === 'ABSENT'
                                                                ? 'bg-red-600 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        <X size={14} /> Absent
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(st.id, 'LATE')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                            currentStatus === 'LATE'
                                                                ? 'bg-amber-500 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        <Clock size={14} /> En Retard
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(st.id, 'EXCUSED')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                            currentStatus === 'EXCUSED'
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-blue-50'
                                                        }`}
                                                    >
                                                        <AlertCircle size={14} /> Excusé
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase">
                        Aucun élève trouvé.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TitulaireAttendance;