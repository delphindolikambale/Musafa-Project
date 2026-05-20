import React from 'react';
import { User, CreditCard, AlertTriangle, CheckCircle2, History } from 'lucide-react';

const StudentSummaryCard = ({ summary }) => {
    if (!summary) return null;

    const { 
        studentFullName, 
        accountNumber, 
        currentClassroom, 
        totalBalance, 
        previousYearsDebt, 
        hasDebt, 
        currency 
    } = summary;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-500">
            {/* Carte Identité Élève */}
            <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <User className="w-32 h-32 text-blue-300" />
                </div>
                
                <div className="relative z-10">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        Profil Vérifié
                    </span>
                    <h2 className="text-2xl font-black text-white mt-5 uppercase leading-tight drop-shadow-md">
                        {studentFullName}
                    </h2>
                    <p className="text-blue-400 font-bold mt-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> {accountNumber}
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Classe Actuelle</p>
                        <p className="text-white font-bold text-xl">{currentClassroom}</p>
                    </div>
                </div>
            </div>

            {/* Alerte de Dette ou Situation Saine - COULEURS CORRIGÉES ET DYNAMIQUES */}
            {hasDebt ? (
                <div className="bg-gradient-to-br from-red-900/40 to-red-500/10 border-2 border-red-500/30 p-8 rounded-[3rem] relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-500/40">
                            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-red-400 font-black uppercase tracking-wider">Reliquat Détecté</h3>
                            <p className="text-red-200/60 text-sm font-medium leading-relaxed mt-1">
                                Dette des années antérieures :
                            </p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-4xl font-black text-red-500">{previousYearsDebt.toLocaleString()}</span>
                                <span className="text-lg font-bold text-red-500/60">{currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-[#064E3B]/40 to-emerald-900/20 border-2 border-emerald-500/30 p-8 rounded-[3rem] flex items-center gap-4">
                    <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/40">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-emerald-400 font-black uppercase tracking-wider">Situation Saine</h3>
                        <p className="text-emerald-100/70 text-sm font-medium mt-1">
                            Dette antérieure : <span className="font-bold text-emerald-400">{previousYearsDebt} {currency}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Solde Global à Payer */}
            <div className="bg-[#0F172A] p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-emerald-500/5 transition-opacity group-hover:opacity-100 opacity-50"></div>
                
                <p className="text-blue-400/80 text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10">Solde Total Restant</p>
                
                <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 drop-shadow-sm">
                        {totalBalance.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold text-emerald-500/80">{currency}</span>
                </div>
                
                <button className="mt-8 relative z-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 py-3 px-6 rounded-full hover:bg-white/10">
                    <History className="w-4 h-4" /> Voir l'historique
                </button>
            </div>
        </div>
    );
};

export default StudentSummaryCard;