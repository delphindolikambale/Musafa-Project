import React, { useState } from 'react';
import { Banknote, Send, Printer } from 'lucide-react';
import { paymentService } from "../../services/paymentService";
import { receiptPaymentService } from "../../services/receiptPayment"; // Ajout du service dédié
import ReceiptPayment from './ReceiptPayment';

const PaymentForm = ({ studentSummary, onPaymentSuccess }) => {
    const [amount, setAmount] = useState('');
    const [method] = useState('CASH'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastPaymentId, setLastPaymentId] = useState(null);
    
    // États pour le reçu
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0 || !studentSummary?.annualProfileId) {
            console.error("Données de paiement incomplètes");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                annualProfileId: studentSummary.annualProfileId,
                amountPaid: parseFloat(amount),
                paymentMethod: method,
                currency: studentSummary.currency 
            };
            
            // On attend la réponse brute du paiement
            const response = await onPaymentSuccess(payload);
            
            if (response && response.id) {
                setLastPaymentId(response.id);
                
                try {
                    // NOUVEAU : On récupère les données exactes et formées pour le reçu
                    const fullReceiptData = await receiptPaymentService.getReceiptData(response.id);
                    setReceiptData(fullReceiptData);
                    setShowReceipt(true); // Affichage
                } catch (receiptErr) {
                    console.error("Erreur récupération DTO du reçu:", receiptErr);
                    // Secours au cas où
                    setReceiptData(response);
                    setShowReceipt(true);
                }
                
                setAmount('');
            }
        } catch (err) {
            console.error("Erreur lors du traitement:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = async (id) => {
        try {
            window.print(); // Puisque le composant gère son propre CSS print, un simple window.print() suffit si le modal est ouvert
        } catch (error) {
            console.error("Erreur d'impression :", error);
            alert("Erreur lors de l'impression du reçu.");
        }
    };

    if (!studentSummary) {
        return (
            <div className="bg-[#1E293B] p-12 rounded-[3rem] border border-white/5 border-dashed flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-center">
                Sélectionnez un élève pour<br/>activer l'encaissement
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#1E293B] p-8 lg:p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Banknote className="text-blue-500" /> Enregistrer un versement
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                            <div className="bg-blue-500/20 p-1.5 rounded-lg">
                                <Banknote className="text-blue-400 w-4 h-4" />
                            </div>
                            <div>
                                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Mode Actif</span>
                                <span className="block text-sm text-white font-bold leading-none">Espèces ({method})</span>
                            </div>
                        </div>

                        {lastPaymentId && receiptData && (
                            <button 
                                type="button"
                                onClick={() => setShowReceipt(true)} 
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-colors bg-blue-500/10 px-3 py-2 rounded-lg"
                            >
                                <Printer size={16} /> Voir / Imprimer reçu
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <label className="text-slate-500 text-xs font-black uppercase mb-3 block px-4">
                            Montant à encaisser ({studentSummary.currency})
                        </label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/20 border-2 border-white/5 rounded-3xl px-8 py-5 text-3xl font-black text-white outline-none focus:border-blue-500 transition-all"
                            required
                            step="any"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting || !amount}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white font-black py-5 rounded-3xl transition-all uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 mt-2"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Traitement & Génération...</span>
                        ) : (
                            <>Valider l'encaissement <Send size={20} /></>
                        )}
                    </button>
                </form>
            </div>

            {/* Affichage de la modale de reçu si activée */}
            {showReceipt && (
                <ReceiptPayment 
                    data={receiptData} 
                    onClose={() => setShowReceipt(false)} 
                    onPrint={() => handlePrint(lastPaymentId)}
                />
            )}
        </>
    );
};

export default PaymentForm;