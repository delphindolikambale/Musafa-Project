import React from 'react';

const FeeBreakdownModal = ({ isOpen, onClose, profile, studentName }) => {
    if (!isOpen || !profile) return null;

    const breakdownList = profile.feeBreakdown || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                
                {/* Header - Adapté Responsive */}
                <div className="p-6 md:p-10 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-blue-900 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate">Répartition du Barème</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] font-black rounded-lg uppercase border border-emerald-500/30 whitespace-nowrap">
                                    Année {profile.academicYear}
                                </span>
                                <span className="text-slate-300 text-[10px] md:text-[11px] font-bold uppercase tracking-widest italic truncate">
                                    Élève : <span className="text-white not-italic">{studentName}</span>
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-red-500 transition-all border border-white/20 active:scale-90">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 bg-slate-50/30 grow">
                    
                    {breakdownList.length > 0 ? breakdownList.map((group, index) => {
                        // Sécurisation des sommes avec fallback à 0
                        const groupPercentage = Number(group.percentage) || 0;
                        const sumPercentages = group.feesItems?.reduce((acc, item) => acc + (Number(item.percentage) || 0), 0) || 0;
                        const sumAmounts = group.feesItems?.reduce((acc, item) => acc + (Number(item.calculatedAmount) || 0), 0) || 0;
                        const sumPaid = group.feesItems?.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0) || 0;

                        // Progression du groupe entier (sécurisé contre division par 0)
                        const groupCalcAmount = Number(group.calculatedAmount) || 0;
                        const groupPaidAmount = Number(group.paidAmount) || 0;
                        const groupProgress = groupCalcAmount > 0 ? Math.min((groupPaidAmount / groupCalcAmount) * 100, 100) : 0;
                        const isGroupFullyPaid = groupProgress >= 100 && groupCalcAmount > 0;

                        return (
                            <div key={index} className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group">
                                
                                {/* Group Header */}
                                <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isGroupFullyPaid ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                            <h4 className="text-sm md:text-base font-black text-[#0F172A] uppercase tracking-wide">{group.type}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase italic">Catégorie mère du barème</p>
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Part: {groupPercentage}%</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end border-t sm:border-t-0 pt-3 sm:pt-0">
                                        <div className="text-right">
                                            <span className="block text-lg md:text-xl font-black text-[#0F172A]">
                                                <span className={isGroupFullyPaid ? "text-emerald-600" : "text-blue-600"}>{groupPaidAmount.toLocaleString('fr-FR')}</span> 
                                                <span className="text-sm text-slate-300 mx-1">/</span> 
                                                {groupCalcAmount.toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-bold">{profile.currency}</span>
                                            </span>
                                        </div>
                                        {/* Barre de progression du Groupe */}
                                        <div className="w-full sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                                            <div 
                                                className={`h-full transition-all duration-700 ${isGroupFullyPaid ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${groupProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="bg-slate-50/50 p-3 md:p-4 space-y-2">
                                    {group.feesItems && group.feesItems.map((item, idx) => {
                                        // Progression de l'item (sécurisée)
                                        const itemCalcAmount = Number(item.calculatedAmount) || 0;
                                        const itemPaidAmount = Number(item.paidAmount) || 0;
                                        const itemProgress = itemCalcAmount > 0 ? Math.min((itemPaidAmount / itemCalcAmount) * 100, 100) : 0;
                                        const isItemFullyPaid = itemProgress >= 100 && itemCalcAmount > 0;

                                        return (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100/50 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="hidden xs:flex w-7 h-7 shrink-0 rounded-lg bg-slate-50 items-center justify-center text-slate-400 text-[9px] font-black border border-slate-100">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase truncate">{item.nameFeesItem}</p>
                                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase italic">Poids global: {item.percentage}% (Groupe: {groupPercentage}%)</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end shrink-0 ml-2 min-w-[100px] md:min-w-[120px]">
                                                    <div className="font-mono text-[10px] md:text-[12px] font-black flex items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                                                        <span className={isItemFullyPaid ? 'text-emerald-600' : 'text-blue-600'}>
                                                            {itemPaidAmount.toLocaleString('fr-FR')}
                                                        </span>
                                                        <span className="text-slate-300 mx-1">/</span>
                                                        <span className="text-slate-700">
                                                            {itemCalcAmount.toLocaleString('fr-FR')}
                                                        </span>
                                                    </div>
                                                    {/* Barre de progression de l'Item */}
                                                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ${isItemFullyPaid ? 'bg-emerald-400' : 'bg-blue-400'}`} 
                                                            style={{ width: `${itemProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* SOMMATION EN BAS DES ITEMS */}
                                    <div className="mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-100/50 flex flex-col md:flex-row justify-between items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 bg-white rounded-md border border-blue-200 text-[9px] font-black text-blue-600 uppercase">
                                                Somme des répartitions
                                            </div>
                                            <span className="text-[11px] font-black text-slate-600">{sumPercentages.toFixed(2)}% / {groupPercentage}%</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total :</span>
                                                <span className="text-sm md:text-base font-black text-[#0F172A]">
                                                    <span className={sumPaid >= sumAmounts && sumAmounts > 0 ? "text-emerald-600" : "text-blue-600"}>{sumPaid.toLocaleString('fr-FR')}</span>
                                                    <span className="text-slate-300 mx-1 text-xs">/</span>
                                                    {sumAmounts.toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400">{profile.currency}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10">
                            <p className="text-slate-400 font-bold uppercase text-xs">Aucune donnée de répartition disponible</p>
                        </div>
                    )}
                </div>

                {/* Footer Responsive */}
                <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg shadow-blue-100">
                           <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Barème Total Global</p>
                            <p className="text-xl md:text-2xl font-black text-[#0F172A]">
                                <span className="text-blue-600">{(Number(profile.totalAmountPaid) || 0).toLocaleString('fr-FR')}</span>
                                <span className="text-slate-300 mx-2 text-lg">/</span>
                                {(Number(profile.totalAmountDue) || 0).toLocaleString('fr-FR')} <span className="text-xs font-bold opacity-40">{profile.currency}</span>
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] md:text-[11px] font-black uppercase hover:bg-blue-600 transition-all active:scale-95 tracking-widest shadow-lg shadow-slate-200"
                    >
                        Fermer l'Analyse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeBreakdownModal;