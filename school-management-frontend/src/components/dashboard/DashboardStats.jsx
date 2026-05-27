import React, { useState, useEffect, useContext } from "react";
import dashboardService from "../../services/dashboardService";
import { Loader2, Users, GraduationCap, School, BadgeDollarSign } from "lucide-react";
import { ThemeContext } from "../../App"; // Pour adapter les couleurs des graphiques
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext) || { theme: 'light' }; // Fallback au cas où

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Erreur Dashboard:", err);
        // Mock de données en cas d'erreur pour voir le design UI
        setStats({
          totalStudents: 1250,
          totalTeachers: 48,
          totalClasses: 32,
          recoveryRate: 85
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Élèves", value: stats?.totalStudents || 0, icon: <Users size={32} />, color: "from-blue-500 to-blue-700", shadow: "shadow-blue-500/30" },
    { label: "Enseignants", value: stats?.totalTeachers || 0, icon: <GraduationCap size={32} />, color: "from-emerald-500 to-emerald-700", shadow: "shadow-emerald-500/30" },
    { label: "Classes", value: stats?.totalClasses || 0, icon: <School size={32} />, color: "from-purple-500 to-purple-700", shadow: "shadow-purple-500/30" },
    { label: "Recouvrement", value: `${stats?.recoveryRate || 0}%`, icon: <BadgeDollarSign size={32} />, color: "from-amber-400 to-orange-600", shadow: "shadow-orange-500/30" },
  ];

  // --- Données Mockées pour les graphiques ---
  const barData = [
    { name: 'Lun', presence: 95, absence: 5 },
    { name: 'Mar', presence: 92, absence: 8 },
    { name: 'Mer', presence: 88, absence: 12 },
    { name: 'Jeu', presence: 96, absence: 4 },
    { name: 'Ven', presence: 90, absence: 10 },
  ];

  const pieData = [
    { name: 'Payé', value: 85 },
    { name: 'En attente', value: 10 },
    { name: 'Non payé', value: 5 },
  ];
  
  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-8 p-4">
      {/* SECTION CARTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800 flex items-center gap-5">
            <div className={`bg-gradient-to-br ${card.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? <Loader2 className="animate-spin w-5 h-5 text-slate-400" /> : typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graphique en Bâtons */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[350px]">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6">Taux de Présence Hebdomadaire</h3>
          {/* CORRECTION : Remplacement des classes flex par une hauteur stricte (h-[300px]) */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="presence" name="Présents" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="absence" name="Absents" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique en Camembert */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[350px]">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6">Situation Financière (Frais)</h3>
          {/* CORRECTION : Remplacement des classes flex par une hauteur stricte (h-[300px]) */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#334155', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DashboardStats;