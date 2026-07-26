import React, { useState, useEffect, useContext } from "react";
import dashboardService from "../../services/dashboardService";
import { 
  Loader2, Users, GraduationCap, Wallet, Activity, Landmark, TrendingDown 
} from "lucide-react";
import { ThemeContext } from "../../App"; 
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext) || { theme: 'light' }; 

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Erreur Dashboard:", err);
        setStats({
          totalStudents: 0, totalBoys: 0, totalGirls: 0,
          totalReenrolled: 0, totalReenrolledBoys: 0, totalReenrolledGirls: 0,
          totalTeachers: 0, totalMaleTeachers: 0, totalFemaleTeachers: 0, totalClasses: 0,
          totalExpectedRevenueUSD: 0, totalExpectedRevenueCDF: 0,
          totalExpensesUSD: 0, totalExpensesCDF: 0,
          actualCashBalanceUSD: 0, actualCashBalanceCDF: 0,
          studentsByClass: {}, previousYearStudentsByClass: {}
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0,00";
    return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- CALCULS SÉCURISÉS POUR L'AFFICHAGE ---
  const boysNouveaux = Math.max(0, (stats?.totalBoys || 0) - (stats?.totalReenrolledBoys || 0));
  const girlsNouvelles = Math.max(0, (stats?.totalGirls || 0) - (stats?.totalReenrolledGirls || 0));

  // --- CONFIGURATION DU DESIGN RÉDUIT (Padding p-4, Arrondi rounded-2xl, Textes ajustés) ---
  const cards = [
    { 
      title: "TOTAL ÉLÈVES", 
      subtitle: "(Base de données globale)",
      values: [{ amount: stats?.totalStudents || 0, currency: '' }], 
      footerText: `Garçons : ${stats?.totalBoys || 0} • Filles : ${stats?.totalGirls || 0}`,
      icon: <Users size={20} />, 
      colorClass: "bg-blue-500", iconBg: "bg-blue-50 dark:bg-blue-900/30", iconColor: "text-blue-500" 
    },
    { 
      title: "INSCRITS & RÉINSCRITS", 
      subtitle: "Année scolaire active",
      values: [{ amount: stats?.totalStudents || 0, currency: '' }], 
      // Affichage combiné tel que demandé (Nouveaux et Réinscrits détaillés G/F)
      footerText: `Nouv: ${boysNouveaux}G / ${girlsNouvelles}F  •  Réinsc: ${stats?.totalReenrolledBoys || 0}G / ${stats?.totalReenrolledGirls || 0}F`,
      icon: <Activity size={20} />, 
      colorClass: "bg-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/30", iconColor: "text-indigo-500" 
    },
    { 
      title: "ENSEIGNANTS", 
      subtitle: "Effectif actif et dynamique",
      values: [{ amount: stats?.totalTeachers || 0, currency: '' }], 
      footerText: `Hommes : ${stats?.totalMaleTeachers || 0} • Femmes : ${stats?.totalFemaleTeachers || 0}`,
      icon: <GraduationCap size={20} />, 
      colorClass: "bg-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/30", iconColor: "text-emerald-500" 
    },
    { 
      title: "TOTAL À RECOUVRER", 
      subtitle: "Sur toute l'année active",
      values: [
        { amount: formatCurrency(stats?.totalExpectedRevenueUSD), currency: 'USD' },
        { amount: formatCurrency(stats?.totalExpectedRevenueCDF), currency: 'CDF' }
      ], 
      icon: <Landmark size={20} />, 
      colorClass: "bg-blue-500", iconBg: "bg-blue-50 dark:bg-blue-900/30", iconColor: "text-blue-500" 
    },
    { 
      title: "TOTAL DES DÉPENSES", 
      subtitle: "Sorties d'année scolaire",
      values: [
        { amount: formatCurrency(stats?.totalExpensesUSD), currency: 'USD' },
        { amount: formatCurrency(stats?.totalExpensesCDF), currency: 'CDF' }
      ], 
      icon: <TrendingDown size={20} />, 
      colorClass: "bg-red-500", iconBg: "bg-red-50 dark:bg-red-900/30", iconColor: "text-red-500" 
    },
    { 
      title: "SOLDE RÉEL EN CAISSE", 
      subtitle: "Trésorerie disponible",
      values: [
        { amount: formatCurrency(stats?.actualCashBalanceUSD), currency: 'USD' },
        { amount: formatCurrency(stats?.actualCashBalanceCDF), currency: 'CDF' }
      ], 
      icon: <Wallet size={20} />, 
      colorClass: "bg-slate-800 dark:bg-slate-600", iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-800 dark:text-slate-300" 
    },
  ];

  const classes = Array.from(new Set([
    ...Object.keys(stats?.studentsByClass || {}), 
    ...Object.keys(stats?.previousYearStudentsByClass || {})
  ]));

  const evolutionData = classes.map(cls => ({
    name: cls,
    anneeAct: stats?.studentsByClass?.[cls] || 0,
    anneePrec: stats?.previousYearStudentsByClass?.[cls] || 0
  }));

  const pieData = [
    { name: 'Garçons Nouveaux', value: boysNouveaux, color: '#3b82f6' },
    { name: 'Filles Nouvelles', value: girlsNouvelles, color: '#f97316' },
    { name: 'Garçons Réinscrits', value: stats?.totalReenrolledBoys || 0, color: '#22c55e' },
    { name: 'Filles Réinscrites', value: stats?.totalReenrolledGirls || 0, color: '#38bdf8' }
  ].filter(d => d.value > 0);

  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6 p-4">
      {/* SECTION CARTES : Tailles réduites via p-4 et rounded-2xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${card.colorClass}`}></div>
            
            <div className="flex justify-between items-start pl-2">
              <div>
                <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.title}</h4>
                {card.subtitle && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{card.subtitle}</p>}
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pl-2">
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
              ) : (
                <div className="space-y-0.5">
                  {card.values.map((v, idx) => (
                    <div key={idx} className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100">{v.amount}</span>
                      {v.currency && <span className="text-[10px] font-bold text-slate-500">{v.currency}</span>}
                    </div>
                  ))}
                </div>
              )}
              
              {card.footerText && !loading && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {card.footerText}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPHIQUE 1 : Évolution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[350px]">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">Évolution des Effectifs</h3>
          <p className="text-[10px] font-medium text-slate-400 mb-5 uppercase">Année Précédente vs Année Actuelle</p>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                <Bar dataKey="anneePrec" name="Effectif Précédent" fill="#f97316" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="anneeAct" name="Effectif Actuel" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={16} />
                <Line type="monotone" dataKey="anneePrec" name="Tendance Précédente" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="anneeAct" name="Tendance Actuelle" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPHIQUE 2 : Camembert */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[350px]">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-5">Répartition : Nouveaux vs Réinscrits</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={90}
                    dataKey="value"
                    stroke={theme === 'dark' ? '#0f172a' : '#fff'}
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#334155', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                </PieChart>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  {loading ? "Chargement..." : "Aucune donnée disponible"}
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DashboardStats;