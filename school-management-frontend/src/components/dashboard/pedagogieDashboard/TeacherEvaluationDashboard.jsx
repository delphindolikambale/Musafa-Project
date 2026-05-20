import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Loader2, AlertCircle, TrendingUp, Calendar, ArrowRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { enrollmentService } from '../../../services/enrollmentService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';

// Données statiques pour donner vie aux graphiques (à remplacer par des données API réelles plus tard)
const performanceData = [
    { period: 'Période 1', moyenne: 68, tauxReussite: 75 },
    { period: 'Période 2', moyenne: 72, tauxReussite: 82 },
    { period: 'Période 3', moyenne: 65, tauxReussite: 68 },
    { period: 'Période 4', moyenne: 78, tauxReussite: 88 },
];

const distributionData = [
    { name: 'Excellente (80-100%)', value: 25 },
    { name: 'Bonne (60-79%)', value: 45 },
    { name: 'Moyenne (50-59%)', value: 20 },
    { name: 'Échec (<50%)', value: 10 },
];

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']; // Vert, Bleu, Orange, Rouge

const TeacherEvaluationDashboard = () => {
    const [activeYear, setActiveYear] = useState(null);
    const [stats, setStats] = useState({ classes: 0, courses: 0, hours: 0, totalStudents: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const year = await enrollmentService.getActiveYear();
                if (!year || !year.id) throw new Error("Aucune année académique active trouvée.");
                setActiveYear(year);

                const teacherId = user?.teacherId; 
                if (!teacherId) {
                    setError("NON_LIE");
                    setLoading(false);
                    return;
                }

                const assignmentsRes = await TeacherAssignmentService.getAssignmentsByTeacher(teacherId, year.id);
                const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes?.data || []);
                
                // Calcul des statistiques basées sur les affectations
                const uniqueClasses = new Set(assignments.map(a => a.classroomId));
                const totalHours = assignments.reduce((acc, curr) => acc + (curr.hoursPerWeek || 0), 0);
                
                setStats({
                    classes: uniqueClasses.size,
                    courses: assignments.length,
                    hours: totalHours,
                    totalStudents: uniqueClasses.size * 35 // Estimation/Mock pour l'UI, à lier au vrai compte
                });

            } catch (err) {
                console.error("Erreur de chargement du dashboard :", err);
                setError(err.message || "Une erreur est survenue lors du chargement des données.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.teacherId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
            </div>
        );
    }

    if (error === "NON_LIE") {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center text-center p-6">
                <AlertCircle className="text-amber-500 mb-4" size={60} />
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Compte non lié</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    Votre compte utilisateur n'est pas encore associé à un profil d'enseignant. Veuillez contacter l'administration.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">
                    Tableau de Bord Enseignant
                </h1>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Calendar size={16} /> Année Scolaire: <span className="text-blue-600 dark:text-blue-400">{activeYear?.name || "En cours"}</span>
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classes</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.classes}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Dispensés</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.courses}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Heures / Semaine</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.hours}h</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Élèves Suivis</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.totalStudents}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Conteneur Graphique en Bâton */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[320px]">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex justify-between items-end">
                        <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 size={16} className="text-blue-500" /> Évolution des Moyennes Globales
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Moyenne des élèves (%) par période d'évaluation</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                <Bar dataKey="moyenne" name="Moyenne (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="tauxReussite" name="Taux de réussite (%)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conteneur Graphique Camembert */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[320px]">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <PieChartIcon size={16} className="text-indigo-500" /> Seuils de Réussite
                        </h4>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">Répartition globale des niveaux de maîtrise</p>
                    </div>
                    <div className="flex-1 w-full h-[250px] flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    formatter={(value) => [`${value}% des élèves`, 'Répartition']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4 w-full px-2">
                            {distributionData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                                    <span className="truncate">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links / Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black mb-1">Prêt à gérer vos classes ?</h3>
                    <p className="text-blue-100 text-sm font-medium">Accédez à vos carnets de cotes, saisissez les notes et transmettez-les au proviseur.</p>
                </div>
                <Link 
                    to="/teacher/classes" 
                    className="shrink-0 bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    Mes Classes <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default TeacherEvaluationDashboard;