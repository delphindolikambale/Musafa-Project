import React, { useState, useEffect } from 'react';
import { RecouvrementFraisService } from '../../services/RecouvrementFraisService';
import RecouvrementFraisDashboard from '../dashboard/RecouvrementFraisDashboard';

const RecouvrementFraisManager = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    
    const [installments, setInstallments] = useState([]);
    const [currency, setCurrency] = useState('USD'); 

    const [selectedClasse, setSelectedClasse] = useState(''); 
    const [selectedTranche, setSelectedTranche] = useState('solde');

    const [stats, setStats] = useState({
        totalExpected: 0,
        totalPaid: 0,
        totalRemaining: 0,
        percentage: 0
    });

    useEffect(() => {
        const loadInitialData = async () => {
            const classList = await RecouvrementFraisService.getClassrooms();
            setClasses(classList);
            if (classList.length > 0) {
                setSelectedClasse(classList[0].id);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClasse) {
            fetchSituation();
        }
    }, [selectedClasse, selectedTranche]);

    const fetchSituation = async () => {
        setLoading(true);
        try {
            const data = await RecouvrementFraisService.getSituationRecouvrement(selectedClasse, selectedTranche);
            
            setStudentsData(data.profiles);
            setInstallments(data.installments);
            
            if (data.profiles && data.profiles.length > 0) {
                setCurrency(data.profiles[0].currency); 
            }
            
            const totals = data.profiles.reduce((acc, curr) => ({
                expected: acc.expected + curr.expected,
                paid: acc.paid + curr.paid,
            }), { expected: 0, paid: 0 });

            setStats({
                totalExpected: totals.expected,
                totalPaid: totals.paid,
                totalRemaining: totals.expected - totals.paid,
                percentage: totals.expected > 0 ? (totals.paid / totals.expected) * 100 : 0
            });
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
            {/* Header section responsive */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-10 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Recouvrement des Frais</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="flex flex-col w-full sm:w-1/2 lg:w-64">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classe</label>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
                            value={selectedClasse}
                            onChange={(e) => setSelectedClasse(e.target.value)}
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col w-full sm:w-1/2 lg:w-72">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Filtrer par tranche</label>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
                            value={selectedTranche}
                            onChange={(e) => setSelectedTranche(e.target.value)}
                        >
                            <option value="solde">Solde Global (Annuel)</option>
                            {installments.map((inst) => (
                                <option key={inst.value} value={inst.value}>{inst.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Dashboard Cards Section */}
            <div className="mb-8">
                <RecouvrementFraisDashboard stats={stats} currency={currency} />
            </div>

            {/* Table Section avec gestion du scroll horizontal sur mobile */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#2563eb]">
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10">Nom</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10">Postnom & Prénom</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Attendu ({currency})</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Payé ({currency})</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right border-b border-white/10">Reste</th>
                                <th className="py-5 px-6 text-[10px] font-black text-white uppercase tracking-widest text-center border-b border-white/10">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">Mise à jour...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : studentsData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center text-slate-300">
                                            <span className="text-5xl mb-2">📂</span>
                                            <p className="font-bold italic">Aucune donnée disponible pour cette classe.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                studentsData.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{student.nom}</td>
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">{student.postnom}</td>
                                        <td className="py-4 px-6 text-sm font-black text-slate-800 text-right whitespace-nowrap">{student.expected.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="py-4 px-6 text-sm font-black text-emerald-600 text-right whitespace-nowrap">{student.paid.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="py-4 px-6 text-sm font-black text-orange-500 text-right whitespace-nowrap">
                                            {student.remaining > 0 ? student.remaining.toLocaleString(undefined, {minimumFractionDigits: 2}) : <span className="text-emerald-500">Soldé</span>}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border
                                                ${student.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                                                ${student.status === 'Partiel' ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}
                                                ${student.status === 'Non Payé' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                            `}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer informatif du tableau adaptable */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Système de Recouvrement Temps Réel</span>
                    </div>
                    <div className="flex gap-4">
                        <span>Total: {studentsData.length} Élèves</span>
                        <span className="text-blue-500">FinancePro V1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecouvrementFraisManager;