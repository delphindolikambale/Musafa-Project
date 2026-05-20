// src/components/dashboard/CashierDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Wallet, TrendingUp, Landmark, AlertCircle, TrendingDown } from 'lucide-react';
import { CashierDashboardService } from '../../services/CashierDashboardService';

const CashierDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [currentAcademicYearId, setCurrentAcademicYearId] = useState(1);
    
    // Toggle intelligent pour les graphiques
    const [chartCurrency, setChartCurrency] = useState('USD');

    const [dashboardData, setDashboardData] = useState({
        academicYearLabel: '', // Ajout pour l'affichage dynamique
        totalExpectedUsd: 0, totalExpectedCdf: 0,
        totalReceivedUsd: 0, totalReceivedCdf: 0,
        totalDebtsUsd: 0, totalDebtsCdf: 0,
        totalExpensesUsd: 0, totalExpensesCdf: 0,
        netCashUsd: 0, netCashCdf: 0,
        monthlyFlows: [],
        classPerformances: []
    });

    useEffect(() => {
        fetchDashboardData();
        const handleNewTransaction = () => fetchDashboardData();
        window.addEventListener('new-financial-transaction', handleNewTransaction);
        return () => window.removeEventListener('new-financial-transaction', handleNewTransaction);
    }, [currentAcademicYearId]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const data = await CashierDashboardService.getDashboardStats(currentAcademicYearId);
            setDashboardData(data);
        } finally {
            setLoading(false);
        }
    };

    const { 
        academicYearLabel,
        totalExpectedUsd, totalExpectedCdf, 
        totalReceivedUsd, totalReceivedCdf, 
        totalDebtsUsd, totalDebtsCdf, 
        totalExpensesUsd, totalExpensesCdf,
        netCashUsd, netCashCdf, 
        monthlyFlows, classPerformances 
    } = dashboardData;

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/30 space-y-6 lg:space-y-8">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <div>
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Tableau de Bord Caisse</h2>
                        {/* Affichage dynamique de l'année scolaire récupérée du backend */}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Année Scolaire : {academicYearLabel || "Chargement..."}
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard 
                    label="Total à Recouvrer" 
                    valueUsd={totalExpectedUsd} valueCdf={totalExpectedCdf}
                    icon={<Landmark className="w-6 h-6 text-blue-500" />}
                    borderColor="border-blue-500" bgColor="bg-blue-50"
                />
                <StatCard 
                    label="Total Perçu (Entrées)" 
                    valueUsd={totalReceivedUsd} valueCdf={totalReceivedCdf}
                    icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
                    borderColor="border-emerald-500" bgColor="bg-emerald-50"
                />
                <StatCard 
                    label="Total des Sorties" 
                    valueUsd={totalExpensesUsd} valueCdf={totalExpensesCdf}
                    icon={<TrendingDown className="w-6 h-6 text-red-500" />}
                    borderColor="border-red-500" bgColor="bg-red-50"
                />
                <StatCard 
                    label="Solde Réel en Caisse" 
                    valueUsd={netCashUsd} valueCdf={netCashCdf}
                    icon={<Wallet className="w-6 h-6 text-[#0F172A]" />}
                    borderColor="border-[#0F172A]" bgColor="bg-slate-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Evolution Mensuelle */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2 flex flex-col min-h-[400px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg">Évolution des Flux Financiers</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entrées vs Sorties par mois</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                            <button 
                                onClick={() => setChartCurrency('USD')} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartCurrency === 'USD' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                USD ($)
                            </button>
                            <button 
                                onClick={() => setChartCurrency('CDF')} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartCurrency === 'CDF' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                CDF (Fc)
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <LoadingState />
                    ) : monthlyFlows.length === 0 ? (
                        <EmptyState message="Aucune donnée financière pour le moment." />
                    ) : (
                        <div className="flex-grow w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyFlows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => value.toLocaleString()} />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }} 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [value.toLocaleString(), chartCurrency]}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                                    
                                    <Bar name="Entrées" dataKey={chartCurrency === 'USD' ? 'incomeUsd' : 'incomeCdf'} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar name="Sorties" dataKey={chartCurrency === 'USD' ? 'expensesUsd' : 'expensesCdf'} fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Performance par Classe */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="font-black text-slate-800 text-lg">Taux de Recouvrement</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performances par classe (%)</p>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : classPerformances.length === 0 ? (
                        <EmptyState message="Aucune classe n'a été évaluée." />
                    ) : (
                        <div className="flex-grow w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={classPerformances} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="className" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 10, fill: '#475569', fontWeight: 800 }} />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Recouvrement']} />
                                    <Bar dataKey="ratio" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// --- Sous-composants ---

const StatCard = ({ label, valueUsd, valueCdf, icon, borderColor, bgColor }) => (
    <div className={`bg-white p-5 rounded-[2rem] border-l-8 ${borderColor} shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] group flex flex-col h-full`}>
        <div className="flex justify-between items-start mb-4 gap-2">
            <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wide leading-snug break-words">
                {label}
            </p>
            <div className={`p-2.5 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform shrink-0`}>
                {icon}
            </div>
        </div>
        
        <div className="flex flex-col gap-1.5 mt-auto">
            <h4 className="text-base lg:text-lg font-black text-[#0F172A] break-words leading-none" title={`${valueUsd} USD`}>
                {Number(valueUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] font-bold text-slate-400">USD</span>
            </h4>
            <h4 className="text-base lg:text-lg font-black text-slate-600 break-words leading-none" title={`${valueCdf} CDF`}>
                {Number(valueCdf).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] font-bold text-slate-400">CDF</span>
            </h4>
        </div>
    </div>
);

const LoadingState = () => (
    <div className="flex-grow flex flex-col items-center justify-center opacity-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des graphiques...</p>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-6 opacity-60">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-400">{message}</p>
    </div>
);

export default CashierDashboard;