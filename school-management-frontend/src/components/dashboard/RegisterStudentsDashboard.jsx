import React, { useState, useEffect, useContext } from 'react';
import { Users, UserPlus, UserCheck, GraduationCap, Loader2 } from 'lucide-react';
import { RegisterStudentDashboardService } from '../../services/RegisterStudentDashboardService';
import { ThemeContext } from '../../App'; // Assurez-vous que le chemin est correct selon votre arborescence
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

// Nouveau composant StatCard fidèle au design Admin
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

const RegisterStudentsDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

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
      <div className={`flex h-64 items-center justify-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className={`ml-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* En-tête Responsive */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Tableau de Bord
          </h2>
          <p className={isDark ? 'text-slate-400 text-sm' : 'text-slate-500 text-sm'}>
            Gestion des inscriptions et effectifs en temps réel.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest self-start md:self-auto ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
          Année Scolaire {stats.activeYear}
        </div>
      </div>

      {/* Cartes de statistiques (Standardisées avec l'admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Élèves" 
          subtitle="(Base de données globale)"
          value={stats.totalStudents} 
          icon={<Users size={20} />} 
          borderColor="border-l-blue-600"
          iconBgColor={isDark ? "bg-blue-900/30" : "bg-blue-50"}
          iconColor={isDark ? "text-blue-400" : "text-blue-600"}
          isDark={isDark}
        />
        <StatCard 
          title="Garçons" 
          subtitle="(Effectif Global)"
          value={stats.totalBoys} 
          icon={<GraduationCap size={20} />} 
          borderColor="border-l-orange-500"
          iconBgColor={isDark ? "bg-orange-900/30" : "bg-orange-50"}
          iconColor={isDark ? "text-orange-400" : "text-orange-600"}
          isDark={isDark}
        />
        <StatCard 
          title="Filles" 
          subtitle="(Effectif Global)"
          value={stats.totalGirls} 
          icon={<GraduationCap size={20} />} 
          borderColor="border-l-emerald-500"
          iconBgColor={isDark ? "bg-emerald-900/30" : "bg-emerald-50"}
          iconColor={isDark ? "text-emerald-400" : "text-emerald-600"}
          isDark={isDark}
        />
        <StatCard 
          title="Inscriptions" 
          subtitle={`Année active (${stats.activeYear})`}
          value={stats.activeYearEnrollments} 
          icon={<UserPlus size={20} />} 
          borderColor="border-l-[#0F172A] dark:border-l-indigo-400" // Bleu de nuit
          iconBgColor={isDark ? "bg-indigo-900/30" : "bg-slate-100"}
          iconColor={isDark ? "text-indigo-400" : "text-slate-800"}
          isDark={isDark}
        />
      </div>

      {/* Section Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Graphique à barres */}
          <div className={`p-6 rounded-3xl border shadow-sm h-[350px] transition-colors ${isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-100'}`}>
             <h3 className={`font-bold uppercase text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Effectif Inscriptions par Genre (Année: {stats.activeYear})
             </h3>
             <ResponsiveContainer width="100%" height="90%">
                <BarChart data={stats.activeYearChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b'}} />
                  <RechartsTooltip 
                    cursor={{fill: isDark ? '#334155' : '#f8fafc'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: isDark ? '#0F172A' : '#fff', color: isDark ? '#fff' : '#000'}} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.activeYearChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>

          {/* Graphique Circulaire */}
          <div className={`p-6 rounded-3xl border shadow-sm h-[300px] transition-colors ${isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-100'}`}>
             <h3 className={`font-bold uppercase text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Proportion Élèves Base de Données Globale
             </h3>
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
                  <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: isDark ? '#0F172A' : '#fff', color: isDark ? '#fff' : '#000'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#475569' }} />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Dernières Inscriptions */}
        <div className={`p-8 rounded-3xl border shadow-sm h-fit transition-colors ${isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-100'}`}>
          <h3 className={`font-bold uppercase text-sm mb-6 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <UserCheck size={18} className="text-emerald-500" />
            Dernières Inscriptions
          </h3>
          <div className="space-y-4">
            {stats.recentRegistrations.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-colors border border-transparent ${isDark ? 'hover:bg-slate-800/50 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {item.matricule}
                </div>
                <div className="truncate">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.fullName}</p>
                  <p className={`text-[10px] font-medium italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Statut: {item.status}</p>
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