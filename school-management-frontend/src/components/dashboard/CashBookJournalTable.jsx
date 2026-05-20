import React, { useMemo } from 'react';

const CashBookJournalTable = ({ 
    journalData, 
    loading, 
    formatCurrency, 
    formatDate, 
    totalsLabel = "TOTAUX PÉRIODE", 
    isPrint = false 
}) => {

    const { enrichedData, totals } = useMemo(() => {
        let runBalanceUSD = 0;
        let runBalanceFC = 0;
        
        let sumEntreesUSD = 0;
        let sumEntreesFC = 0;
        let sumSortiesUSD = 0;
        let sumSortiesFC = 0;

        const groupedMap = {};
        const validData = Array.isArray(journalData) ? journalData : [];

        validData.forEach(tx => {
            const dateKey = tx.transactionDate ? String(tx.transactionDate).split('T')[0] : 'Inconnue';

            if (!groupedMap[dateKey]) {
                groupedMap[dateKey] = {
                    originalDate: tx.transactionDate,
                    entreeUSD: 0,
                    entreeFC: 0,
                    sortieUSD: 0,
                    sortieFC: 0
                };
            }

            const isUSD = tx.currency === 'USD';
            const isCDF = tx.currency === 'CDF' || tx.currency === 'FC';
            
            const entree = Number(tx.entryAmount) || 0;
            const sortie = Number(tx.exitAmount) || 0;

            if (isUSD) {
                groupedMap[dateKey].entreeUSD += entree;
                groupedMap[dateKey].sortieUSD += sortie;
            } else if (isCDF) {
                groupedMap[dateKey].entreeFC += entree;
                groupedMap[dateKey].sortieFC += sortie;
            }
        });

        // Tri chronologique (ASC)
        const sortedDateKeys = Object.keys(groupedMap).sort((a, b) => new Date(a) - new Date(b));

        const finalData = sortedDateKeys.map(dateKey => {
            const row = groupedMap[dateKey];

            let dynamicDescription = "OPÉRATIONS";
            const hasEntrees = row.entreeUSD > 0 || row.entreeFC > 0;
            const hasSorties = row.sortieUSD > 0 || row.sortieFC > 0;

            if (hasEntrees && !hasSorties) dynamicDescription = "PAIEMENTS";
            else if (!hasEntrees && hasSorties) dynamicDescription = "DÉPENSES";
            else if (hasEntrees && hasSorties) dynamicDescription = "PAIEMENTS ET DÉPENSES";

            runBalanceUSD = runBalanceUSD + row.entreeUSD - row.sortieUSD;
            runBalanceFC = runBalanceFC + row.entreeFC - row.sortieFC;

            sumEntreesUSD += row.entreeUSD;
            sumEntreesFC += row.entreeFC;
            sumSortiesUSD += row.sortieUSD;
            sumSortiesFC += row.sortieFC;

            return {
                ...row,
                description: dynamicDescription,
                currentBalanceUSD: runBalanceUSD,
                currentBalanceFC: runBalanceFC
            };
        });

        return {
            enrichedData: finalData,
            totals: {
                entreesUSD: sumEntreesUSD,
                entreesFC: sumEntreesFC,
                sortiesUSD: sumSortiesUSD,
                sortiesFC: sumSortiesFC,
                soldeUSD: runBalanceUSD,
                soldeFC: runBalanceFC
            }
        };
    }, [journalData]);

    return (
        <div className={`bg-white shadow-sm flex flex-col flex-1 border-2 border-emerald-500 rounded-xl mt-2 ${isPrint ? "" : "overflow-hidden"}`}>
            <div className={isPrint ? "w-full" : "overflow-x-auto overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent"}>
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className={isPrint ? "" : "sticky top-0 z-10 shadow-sm"}>
                        <tr className="bg-emerald-600 text-white text-[10px] uppercase tracking-wider">
                            <th rowSpan="2" className="border border-emerald-700 px-3 py-2 text-center font-black align-middle w-24">Date</th>
                            <th rowSpan="2" className="border border-emerald-700 px-4 py-2 font-black align-middle min-w-[150px]">Type de Transaction</th>
                            <th colSpan="2" className="border border-emerald-700 px-3 py-2 text-center font-black">Entrées</th>
                            <th colSpan="2" className="border border-emerald-700 px-3 py-2 text-center font-black">Sorties</th>
                            <th colSpan="2" className="border border-emerald-700 px-3 py-2 text-center font-black">Solde</th>
                        </tr>
                        <tr className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider text-center">
                            <th className="border border-emerald-700 px-2 py-1 w-20">USD</th>
                            <th className="border border-emerald-700 px-2 py-1 w-20">CDF</th>
                            <th className="border border-emerald-700 px-2 py-1 w-20">USD</th>
                            <th className="border border-emerald-700 px-2 py-1 w-20">CDF</th>
                            <th className="border border-emerald-700 px-2 py-1 w-24">USD</th>
                            <th className="border border-emerald-700 px-2 py-1 w-24">CDF</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="border border-slate-200 py-16 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                                    <p className="text-xs text-slate-500 mt-2 font-bold">Chargement du livre de caisse...</p>
                                </td>
                            </tr>
                        ) : enrichedData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="border border-slate-200 py-12 text-center text-slate-500 text-xs font-bold">Aucune opération sur cette période.</td>
                            </tr>
                        ) : (
                            enrichedData.map((row, index) => (
                                <tr key={index} className="hover:bg-emerald-50/50 transition-colors text-xs text-slate-800">
                                    <td className="border border-slate-200 px-3 py-2 text-center whitespace-nowrap font-medium text-[10px] text-slate-600">{formatDate(row.originalDate)}</td>
                                    <td className="border border-slate-200 px-4 py-2 font-bold uppercase text-[9px] max-w-[200px] truncate" title={row.description}>{row.description}</td>
                                    <td className="border border-slate-200 px-2 py-2 text-right font-bold text-emerald-600 text-[10px] bg-emerald-50/20">{row.entreeUSD > 0 ? formatCurrency(row.entreeUSD) : '-'}</td>
                                    <td className="border border-slate-200 px-2 py-2 text-right font-bold text-emerald-600 text-[10px] bg-emerald-50/20">{row.entreeFC > 0 ? formatCurrency(row.entreeFC) : '-'}</td>
                                    <td className="border border-slate-200 px-2 py-2 text-right font-bold text-orange-600 text-[10px] bg-orange-50/10">{row.sortieUSD > 0 ? formatCurrency(row.sortieUSD) : '-'}</td>
                                    <td className="border border-slate-200 px-2 py-2 text-right font-bold text-orange-600 text-[10px] bg-orange-50/10">{row.sortieFC > 0 ? formatCurrency(row.sortieFC) : '-'}</td>
                                    <td className="border border-slate-200 px-3 py-2 text-right font-black text-slate-900 bg-slate-50 text-[10px]">{formatCurrency(row.currentBalanceUSD)}</td>
                                    <td className="border border-slate-200 px-3 py-2 text-right font-black text-slate-900 bg-slate-50 text-[10px]">{formatCurrency(row.currentBalanceFC)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {!loading && enrichedData.length > 0 && (
                        <tfoot className={isPrint ? "" : "sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]"}>
                            <tr className="text-xs font-black text-slate-900 bg-slate-100">
                                <td colSpan="2" className="border border-slate-300 px-4 py-3 text-right uppercase">{totalsLabel}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right text-emerald-700 bg-emerald-100/50">{formatCurrency(totals.entreesUSD)}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right text-emerald-700 bg-emerald-100/50">{formatCurrency(totals.entreesFC)}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right text-orange-700 bg-orange-100/50">{formatCurrency(totals.sortiesUSD)}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right text-orange-700 bg-orange-100/50">{formatCurrency(totals.sortiesFC)}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right bg-blue-100/50 text-blue-900">{formatCurrency(totals.soldeUSD)}</td>
                                <td className="border border-slate-300 px-3 py-3 text-right bg-blue-100/50 text-blue-900">{formatCurrency(totals.soldeFC)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default CashBookJournalTable;