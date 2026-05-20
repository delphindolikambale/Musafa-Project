import React, { useState, useEffect } from 'react';
import { transactionHistoryService } from '../../services/transactionHistoryService';
import { receiptPaymentService } from '../../services/receiptPayment';
import ReceiptPayment from '../structure/ReceiptPayment';
import { Loader2, ArrowUpCircle, ArrowDownCircle, FileText, Search, Trash2 } from 'lucide-react';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchTerm, setSearchTerm] = useState("");
    
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [activeFilter]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await transactionHistoryService.getHistory(activeFilter);
            setTransactions(data);
        } catch (error) {
            console.error("Erreur historique:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReprint = async (sourceId) => {
        try {
            const data = await receiptPaymentService.getReceiptData(sourceId);
            setSelectedReceipt(data);
            setShowReceipt(true);
        } catch (error) {
            alert("Erreur lors de la récupération du reçu.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet historique ? Cette action est irréversible.")) {
            try {
                await transactionHistoryService.deleteTransaction(id);
                // Mise à jour locale de la liste
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (error) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const filteredTransactions = transactions.filter(t => 
        t.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[2.5rem] p-4 lg:p-6 shadow-sm border border-slate-50 space-y-6 animate-in fade-in duration-700 -mt-6 lg:-mt-10">
            
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-[2rem] p-3 lg:p-4 shadow-lg shadow-blue-200/50 flex flex-col lg:flex-row justify-between items-center gap-4">
                
                <div className="text-center lg:text-left pl-2">
                    <h2 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-wider leading-tight">Journal d'Audit</h2>
                    <p className="text-[8px] font-bold text-blue-100 uppercase tracking-[0.2em] opacity-80">Historique des flux</p>
                </div>
                
                <div className="flex flex-row items-center gap-2 lg:gap-3 w-full lg:w-auto justify-center lg:justify-end">
                    
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-600 transition-colors" size={13} />
                        <input 
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-bold text-white placeholder-blue-200 focus:bg-white focus:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all w-32 sm:w-44 lg:w-56"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-black/10 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
                        {["Tout", "Aujourd'hui", "Entrées", "Sorties"].map((f) => (
                            <button 
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-3 py-1.5 lg:px-4 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${
                                    activeFilter === f 
                                    ? "bg-white text-blue-600 shadow-md scale-105" 
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2.5 px-1">
                {loading ? (
                    <div className="flex flex-col items-center py-20 text-slate-300">
                        <Loader2 className="animate-spin mb-3 text-blue-500" size={28} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Mise à jour du journal...</span>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Aucune transaction trouvée</p>
                    </div>
                ) : (
                    filteredTransactions.map((tx) => (
                        <div key={tx.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50/40 rounded-2xl gap-3 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group">
                            <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 ${
                                    tx.type === 'IN' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                }`}>
                                    {tx.type === 'IN' ? <ArrowUpCircle size={17} /> : <ArrowDownCircle size={17} />}
                                </div>
                                <div>
                                    <p className="text-[12px] font-black text-[#0F172A] uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                        {tx.label}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase">
                                        {new Date(tx.transactionDate).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right">
                                    <p className={`font-black text-xs ${tx.type === 'IN' ? "text-emerald-600" : "text-red-600"}`}>
                                        {tx.type === 'IN' ? '+' : '-'} {tx.amount.toLocaleString()} <span className="text-[12px]">{tx.currency}</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">REF: {tx.referenceNumber}</p>
                                </div>
                                
                                <div className="flex gap-2">
                                    {tx.type === 'IN' && (
                                        <button 
                                            onClick={() => handleReprint(tx.sourceId)}
                                            className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm"
                                            title="Imprimer Reçu"
                                        >
                                            <FileText size={14} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(tx.id)}
                                        className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-sm"
                                        title="Supprimer l'historique"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {!loading && filteredTransactions.length > 8 && (
                <div className="pt-2 text-center">
                    <button className="text-[9px] font-black text-blue-500/60 hover:text-blue-600 uppercase tracking-[0.2em] transition-all">
                        Afficher plus d'entrées
                    </button>
                </div>
            )}

            {showReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl">
                        <ReceiptPayment 
                            data={selectedReceipt} 
                            onClose={() => setShowReceipt(false)} 
                            onPrint={() => window.print()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;