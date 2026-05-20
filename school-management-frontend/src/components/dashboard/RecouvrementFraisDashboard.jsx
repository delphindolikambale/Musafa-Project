import React from 'react';

const RecouvrementFraisDashboard = ({ stats, currency }) => {
    // Formatage de la devise pour l'affichage (USD au lieu de $)
    const displayCurrency = currency === 'USD' ? 'USD' : currency;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
            {/* Carte 1 : Attendu */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Attendu</p>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800">
                                {stats.totalExpected.toLocaleString()} <span className="text-sm">{displayCurrency}</span>
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <span className="text-xl">📊</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-full"></div>
                    </div>
                </div>
            </div>

            {/* Carte 2 : Payé */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recouvré</p>
                            <h3 className="text-xl md:text-2xl font-black text-emerald-600">
                                {stats.totalPaid.toLocaleString()} <span className="text-sm">{displayCurrency}</span>
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <span className="text-xl">💵</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${stats.percentage}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Carte 3 : Reste */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reste à Percevoir</p>
                            <h3 className="text-xl md:text-2xl font-black text-orange-500">
                                {stats.totalRemaining.toLocaleString()} <span className="text-sm">{displayCurrency}</span>
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                            <span className="text-xl">🎯</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${100 - stats.percentage}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Carte 4 : Taux */}
            <div className="bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#081a3a] rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden border border-blue-900/30">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Taux de Réalisation</p>
                        <span className="text-emerald-400 text-xl">📈</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <h3 className="text-3xl md:text-4xl font-black text-white">{stats.percentage.toFixed(1)}</h3>
                        <span className="text-lg font-bold text-slate-400">%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecouvrementFraisDashboard;