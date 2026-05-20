import React from 'react';
import { TrendingUp, Layers, Activity, Wallet } from 'lucide-react';

const StatCard = ({ title, amounts = [], icon: Icon, gradientClass, iconColorClass }) => (
    <div className={`p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden ${gradientClass}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
                <div className="space-y-2">
                    {amounts.length > 0 ? amounts.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-2">
                            <h3 className={`${idx === 0 ? 'text-3xl' : 'text-xl opacity-80'} font-black text-white drop-shadow-sm`}>
                                {item.amount.toLocaleString()} 
                            </h3>
                            <span className="text-sm font-bold text-blue-400 opacity-80 uppercase">{item.currency}</span>
                        </div>
                    )) : (
                        <h3 className="text-3xl font-black text-white/20">0</h3>
                    )}
                </div>
            </div>
            <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 ${iconColorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

/**
 * Dashboard intelligent gérant la séparation CDF / USD.
 */
const PaymentDashboard = ({ reportData = null }) => {
    
    // Initialisation sécurisée
    const stats = reportData || {
        totalCollectedCdf: 0, totalCollectedUsd: 0,
        transactionCount: 0,
        scolariteCdf: 0, scolariteUsd: 0,
        diversCdf: 0, diversUsd: 0
    };

    // Construction des listes de montants par carte
    const renderAmounts = (cdf, usd) => {
        const list = [];
        if (cdf > 0) list.push({ amount: cdf, currency: 'CDF' });
        if (usd > 0) list.push({ amount: usd, currency: 'USD' });
        // Si rien n'est encaissé, on affiche au moins le CDF par défaut
        if (list.length === 0) list.push({ amount: 0, currency: 'CDF' });
        return list;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700">
            {/* CARTE : COLLECTE DU JOUR */}
            <StatCard 
                title="Collecte du Jour" 
                amounts={renderAmounts(stats.totalCollectedCdf, stats.totalCollectedUsd)} 
                icon={TrendingUp} 
                gradientClass="bg-gradient-to-br from-blue-900 to-[#0F172A]"
                iconColorClass="text-blue-400"
            />

            {/* CARTE : TRANSACTIONS (Unité simple) */}
            <div className="p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
                 <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-2">Transactions (24h)</p>
                        <h3 className="text-4xl font-black text-white">{stats.transactionCount}</h3>
                        <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-tighter italic">Paiements validés</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/10 text-slate-300">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* CARTE : ENTRÉES SCOLARITÉ */}
            <StatCard 
                title="Entrées Scolarité" 
                amounts={renderAmounts(stats.scolariteCdf, stats.scolariteUsd)} 
                icon={Layers} 
                gradientClass="bg-gradient-to-br from-emerald-800 to-[#0F172A]"
                iconColorClass="text-emerald-400"
            />

            {/* CARTE : ENTRÉES DIVERS */}
            <StatCard 
                title="Entrées Divers" 
                amounts={renderAmounts(stats.diversCdf, stats.diversUsd)} 
                icon={Wallet} 
                gradientClass="bg-gradient-to-br from-blue-800 to-emerald-900"
                iconColorClass="text-emerald-300"
            />
        </div>
    );
};

export default PaymentDashboard;