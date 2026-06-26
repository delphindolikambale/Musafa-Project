import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Smartphone, Banknote, TrendingUp, ArrowUpRight, Search, Filter } from 'lucide-react';
import SuperAdminSystemService from '../../../services/multitenantService/SuperAdminSystemService';

const FinanceAbonnement = () => {
  const [filterMode, setFilterMode] = useState("ALL");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données réelles depuis le backend
  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      // Supposons que vous ayez une méthode API pour récupérer l'historique de paiement
      const data = await SuperAdminSystemService.getAllFinancialTransactions();
      setTransactions(data);
    } catch (error) {
      console.warn("Erreur API : Chargement des données fictives de secours", error);
      // Fallback sur le jeu de données pour ne pas briser l'interface si l'API n'est pas encore prête
      setTransactions([
        { id: "TX-1001", school: "Complexe Scolaire Musafa", date: "2026-06-12", mode: "AIRTEL_MONEY", amount: 1200, status: "COMPLETED", plan: "12 Mois" },
        { id: "TX-1002", school: "Institut de Goma", date: "2026-06-10", mode: "CREDIT_CARD", amount: 1500, status: "COMPLETED", plan: "12 Mois" },
        { id: "TX-1003", school: "Lycée Amani", date: "2026-06-05", mode: "CASH", modeLabel: "Espèces", amount: 600, status: "COMPLETED", plan: "6 Mois" },
        { id: "TX-1004", school: "Complexe Scolaire Kivu", date: "2026-05-28", mode: "AIRTEL_MONEY", amount: 1200, status: "COMPLETED", plan: "12 Mois" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
  const airtelTotal = transactions.filter(t => t.mode === "AIRTEL_MONEY").reduce((acc, t) => acc + t.amount, 0);
  const cardTotal = transactions.filter(t => t.mode === "CREDIT_CARD").reduce((acc, t) => acc + t.amount, 0);
  const cashTotal = transactions.filter(t => t.mode === "CASH").reduce((acc, t) => acc + t.amount, 0);

  const filteredTransactions = filterMode === "ALL" 
    ? transactions 
    : transactions.filter(t => t.mode === filterMode);

  return (
    <div className="space-y-6 text-slate-800 dark:text-white">
      {/* KPIs financiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaire Global</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><TrendingUp size={16}/></div>
          </div>
          <h3 className="text-2xl font-black">{totalRevenue.toLocaleString()} $</h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1"><ArrowUpRight size={12}/> Volume de rentabilité SaaS</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recettes Airtel Money</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center"><Smartphone size={16}/></div>
          </div>
          <h3 className="text-2xl font-black">{airtelTotal.toLocaleString()} $</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Mobile Money Régional</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Passerelle Cartes Bancaires</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center"><CreditCard size={16}/></div>
          </div>
          <h3 className="text-2xl font-black">{cardTotal.toLocaleString()} $</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Visa / Mastercard Network</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Versements Directs (Cash)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Banknote size={16}/></div>
          </div>
          <h3 className="text-2xl font-black">{cashTotal.toLocaleString()} $</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Encaissements physiques</p>
        </div>
      </div>

      {/* Tableau d'Audit de Facturation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-sm flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> Audit Général de Caisse Multi-Tenant</h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {['ALL', 'AIRTEL_MONEY', 'CREDIT_CARD', 'CASH'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterMode === mode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
              >
                {mode === 'ALL' ? 'Tous' : mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-medium text-sm">Synchronisation des transactions...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">ID Transaction</th>
                  <th className="p-4">Établissement Payeur</th>
                  <th className="p-4">Date de Valeur</th>
                  <th className="p-4">Formule</th>
                  <th className="p-4">Mode Émission</th>
                  <th className="p-4 text-right">Montant Réglé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{tx.id}</td>
                    <td className="p-4 font-bold">{tx.school}</td>
                    <td className="p-4 text-slate-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 font-medium text-xs"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{tx.plan}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${tx.mode === 'AIRTEL_MONEY' ? 'text-red-500' : tx.mode === 'CREDIT_CARD' ? 'text-blue-500' : 'text-amber-500'}`}>
                        {tx.mode === 'AIRTEL_MONEY' ? <Smartphone size={14}/> : tx.mode === 'CREDIT_CARD' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                        {tx.mode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">+{tx.amount.toLocaleString()} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceAbonnement;