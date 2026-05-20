import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';

const ExpenseManagerTable = ({ expenses, loading }) => {
    const formatCurrency = (amount, currency) => {
        return `${Number(amount).toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${currency}`;
    };

    // Fonction pour générer une impression propre du Bon de Sortie
    const handlePrintVoucher = (expense) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bon de Sortie - ${expense.voucherNumber}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #333; }
                        .voucher { border: 2px solid #000; padding: 20px; max-width: 600px; margin: auto; }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #000; width: 150px; text-align: center; font-size: 12px; margin-top: 40px; }
                        .stamp { color: #ccc; font-weight: bold; font-size: 40px; transform: rotate(-20deg); position: absolute; z-index: -1; opacity: 0.2; }
                    </style>
                </head>
                <body>
                    <div class="voucher">
                        <div class="header">
                            <h2>BON DE SORTIE DE CAISSE</h2>
                            <p>N° ${expense.voucherNumber}</p>
                        </div>
                        <div class="row"><strong>Date:</strong> <span>${new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</span></div>
                        <div class="row"><strong>Motif:</strong> <span>${expense.description}</span></div>
                        <div class="row"><strong>Catégorie:</strong> <span>${expense.feesItemName}</span></div>
                        <div class="row"><strong>Montant:</strong> <span style="font-size: 1.2rem; font-weight: bold;">${formatCurrency(expense.amount, expense.currency)}</span></div>
                        <div class="row"><strong>Bénéficiaire:</strong> <span>${expense.requestedBy}</span></div>
                        
                        <div class="footer">
                            <div class="signature">Bénéficiaire</div>
                            <div class="signature">Caisse (${expense.authorizedBy})</div>
                        </div>
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-600" size={18} />
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">Journal des Sorties</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total:</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{expenses.length}</span>
                </div>
            </div>
            
            <div className="overflow-x-auto p-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                            <th className="pb-3 pl-4 text-center">N° Bon</th>
                            <th className="pb-3">Catégorie / Motif</th>
                            <th className="pb-3">Bénéficiaire</th>
                            <th className="pb-3 text-right">Montant</th>
                            <th className="pb-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="py-20 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-medium italic">Aucun enregistrement trouvé.</td></tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="group bg-slate-50 hover:bg-blue-50 transition-all">
                                    <td className="py-4 pl-4 text-center rounded-l-2xl">
                                        <span className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-300">
                                            {expense.voucherNumber}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-blue-600 uppercase">{expense.feesGroupName} › {expense.feesItemName}</span>
                                            <span className="text-sm font-bold text-slate-800 line-clamp-1">{expense.description}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-xs font-bold text-slate-600 italic">
                                        {expense.requestedBy}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <span className="text-sm font-black text-rose-600">
                                            {formatCurrency(expense.amount, expense.currency)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center rounded-r-2xl pr-4">
                                        <button 
                                            onClick={() => handlePrintVoucher(expense)}
                                            title="Imprimer le Bon de Sortie" 
                                            className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-200 transition-all"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseManagerTable;