import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, GraduationCap, Loader2 } from 'lucide-react';
import { RegisterStudentDashboardService } from '../../services/RegisterStudentDashboardService';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${bgColor} ${color}`}>
      {icon}
    </div>
  </div>
);

const RegisterStudentsDashboard = () => {
  const [stats, setStats] = useState({
    activeYear: "...",
    totalStudents: 0,
    totalBoys: 0,
    totalGirls: 0,
    activeYearEnrollments: 0,
    recentRegistrations: [],
    activeYearChartData: [],
    globalGenderChartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await RegisterStudentDashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Erreur lors de la synchronisation du tableau de bord", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-500 font-medium">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête Responsive */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Tableau de Bord</h2>
          <p className="text-slate-500 text-sm">Gestion des inscriptions et effectifs en temps réel.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest self-start md:self-auto">
          Année Scolaire {stats.activeYear}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Élèves" 
          value={stats.totalStudents} 
          icon={<Users size={24} />} 
          color="text-blue-600" 
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Garçons (Global)" 
          value={stats.totalBoys} 
          icon={<GraduationCap size={24} />} 
          color="text-orange-600" 
          bgColor="bg-orange-50"
        />
        <StatCard 
          title="Filles (Global)" 
          value={stats.totalGirls} 
          icon={<GraduationCap size={24} />} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Inscriptions" 
          value={stats.activeYearEnrollments} 
          icon={<UserPlus size={24} />} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50"
        />
      </div>

      {/* Section Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Graphique à barres : Effectif RÉEL de l'année active */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[350px]">
             <h3 className="font-bold text-slate-800 uppercase text-xs mb-4">Effectif Inscriptions par Genre Annee Scolaire: {stats.activeYear}</h3>
             <ResponsiveContainer width="100%" height="90%">
                <BarChart data={stats.activeYearChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.activeYearChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>

          {/* Graphique Circulaire : Proportion Globale */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[300px]">
             <h3 className="font-bold text-slate-800 uppercase text-xs mb-4">Proportion Elève base de données Genre (Totalité)</h3>
             <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={stats.globalGenderChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.globalGenderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Dernières Inscriptions */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 uppercase text-sm mb-6 flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-500" />
            Dernières Inscriptions
          </h3>
          <div className="space-y-4">
            {stats.recentRegistrations.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                  {item.matricule}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-medium italic">Statut: {item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterStudentsDashboard;