import React, { useState, useEffect } from 'react';
import { detailsCashTransactionService } from '../../services/detailsCashTransactionService';
import academicService from '../../services/academicYearService';

const DetailsCashTransaction = ({ onBack }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeYearLabel, setActiveYearLabel] = useState('Chargement...');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // 1. Récupération de l'année active
                const activeYearRes = await academicService.getActiveYear();
                
                // Utilisation du champ "annee" défini dans l'entité AcademicYear
                const yearLabel = activeYearRes.data?.annee;
                
                if (yearLabel) {
                    setActiveYearLabel(yearLabel);
                    // 2. Récupération des transactions avec le bon label
                    const data = await detailsCashTransactionService.getJournalDetails(yearLabel);
                    setTransactions(data || []);
                } else {
                    console.warn("L'API n'a pas retourné le champ 'annee' pour l'année active.");
                    setActiveYearLabel("Non définie");
                    setTransactions([]);
                }

            } catch (err) {
                console.error("Erreur complète:", err);
                setError("Impossible de charger les détails des transactions. Vérifiez votre connexion au serveur.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0,00";
        return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 p-2 rounded-lg transition-colors shadow-sm">
                            ⬅️ Retour
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Détails Transactions</h1>
                        <p className="text-sm font-bold text-emerald-600 uppercase">Exercice Actif : {activeYearLabel}</p>
                    </div>
                </div>
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                    onClick={() => window.print()}
                >
                    🖨️ Imprimer
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-4 border border-red-200 shadow-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800 text-white">
                            <tr>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700 text-center w-12">#</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700">Année Scolaire</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700 whitespace-nowrap">Date</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700">Mois</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700">N° Document</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700">Acteur</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700">Motif / Description</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700 text-center">Type</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase border-r border-slate-700 text-center">Devise</th>
                                <th className="px-3 py-3 text-[11px] font-bold uppercase text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="mt-4 font-bold text-slate-500">Chargement des données...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center font-bold text-slate-400 italic bg-slate-50">
                                        Aucune transaction enregistrée pour l'exercice {activeYearLabel}.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx, index) => (
                                    <tr key={tx.id || index} className="hover:bg-slate-50 border-b border-slate-200 last:border-0 even:bg-slate-50/50">
                                        <td className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-500">{index + 1}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 font-bold text-blue-600">{activeYearLabel}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 font-medium whitespace-nowrap">{formatDate(tx.transactionDate)}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 font-bold uppercase">{tx.month}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 font-bold text-slate-800 whitespace-nowrap">{tx.documentNumber}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 font-semibold">{tx.actor}</td>
                                        <td className="px-3 py-2 border-r border-slate-200">{tx.description}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${
                                                tx.type === 'ENTREE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-500">{tx.currency}</td>
                                        <td className={`px-3 py-2 text-right font-black whitespace-nowrap ${
                                            tx.type === 'ENTREE' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailsCashTransaction;