import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, UserCheck, Loader2 } from 'lucide-react';
import titulaireService from '../../../services/pedagogieService/titulaireService';
import api from '../../../services/api';
import { DailyAttendanceEntry } from './attendance/DailyAttendanceEntry';
import { MonthlyAttendanceRegister } from './attendance/MonthlyAttendanceRegister';

const TitulaireAttendance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [activeYear, setActiveYear] = useState(null);
    const [activeTab, setActiveTab] = useState('DAILY'); // 'DAILY' ou 'MONTHLY'

    // Récupération des informations de session de l'enseignant
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherId = storedUser.teacherId || storedUser.id;
    const schoolId = storedUser.schoolId || 1; // Ajustez selon votre logique multitenant

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
                console.error("Erreur d'initialisation du module présences:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [teacherId]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* EN-TÊTE PRINCIPAL */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/enseignant/titulaire')} 
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            <UserCheck className="text-emerald-600" size={28} /> 
                            Gestion des Présences
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Année Académique: {activeYear?.name || 'En cours'}
                        </p>
                    </div>
                </div>

                {/* SÉLECTEUR DE CLASSE GLOBAL */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider ml-2">Classe :</span>
                    <div className="flex gap-2">
                        {myClassrooms.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClassroom(cls)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                                    selectedClassroom?.id === cls.id 
                                        ? 'bg-emerald-600 text-white shadow-md' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {cls.displayName || cls.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* NAVIGATION ONGLETS */}
            <div className="flex gap-4 px-2 print:hidden">
                <button
                    onClick={() => setActiveTab('DAILY')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeTab === 'DAILY'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                    <UserCheck size={16} />
                    Appel Journalier
                </button>
                <button
                    onClick={() => setActiveTab('MONTHLY')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeTab === 'MONTHLY'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                    <BookOpen size={16} />
                    Registre Mensuel
                </button>
            </div>

            {/* CONTENU DYNAMIQUE */}
            <div className="w-full">
                {activeTab === 'DAILY' ? (
                    <DailyAttendanceEntry
                        schoolId={schoolId}
                        classroomId={selectedClassroom?.id}
                        academicYearId={activeYear?.id}
                        teacherId={teacherId}
                    />
                ) : (
                    <MonthlyAttendanceRegister
                        schoolId={schoolId}
                        classroomId={selectedClassroom?.id}
                        academicYearId={activeYear?.id}
                    />
                )}
            </div>
        </div>
    );
};

export default TitulaireAttendance;