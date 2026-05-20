import React, { useState, useEffect, useRef } from 'react';
import { cashReceiptService } from '../../services/cashReceiptService';

const CashReceiptReports = ({ reportCriteria, onBack }) => {
    const printRef = useRef();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const [data, config] = await Promise.all([
                    cashReceiptService.getReportData(reportCriteria.filterType, reportCriteria.currentDate, reportCriteria.selectedClassroomId),
                    cashReceiptService.getSchoolConfig()
                ]);
                setReportData({ data, schoolConfig: config });
                setCurrentUser(cashReceiptService.getCurrentUser());
            } catch (err) {
                console.error("Erreur génération rapport:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportCriteria]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-black text-xs uppercase tracking-widest">Génération du rapport financier...</p>
        </div>
    );

    const { data, schoolConfig } = reportData;
    const printDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const printTime = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    const cashierDisplayName = (currentUser?.firstName && currentUser?.lastName) 
        ? `${currentUser.firstName} ${currentUser.lastName}` 
        : (schoolConfig?.defaultCashierName || "Le Caissier Responsable");

    return (
        <div className="w-full h-auto bg-slate-200/50 print:bg-transparent p-0 md:px-4 overflow-hidden">
            
            <div className="max-w-[210mm] mx-auto mb-2 flex justify-between items-center no-print bg-white/90 backdrop-blur-md p-2 rounded-b-xl shadow-md border border-t-0 border-white sticky top-0 z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-black text-[10px] uppercase transition-all group">
                    <span className="text-lg">←</span> Retour
                </button>
                <button onClick={handlePrint} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black text-[10px] uppercase shadow-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
                    🖨️ Imprimer le Rapport
                </button>
            </div>

            <div ref={printRef} className="bg-white mx-auto shadow-2xl print:shadow-none w-full max-w-[210mm] print:max-w-none text-slate-900 print:text-black relative print:m-0 overflow-visible">
                
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print { 
                        @page { size: A4 portrait; margin: 0; } 
                        html, body { overflow: hidden !important; background: white !important; }
                        .no-print { display: none !important; } 
                        .report-container { padding: 10mm !important; width: 210mm; height: auto !important; min-height: 0 !important; background: white !important; }
                        .report-table th { background-color: #f1f5f9 !important; border: 1px solid #000 !important; color: #000 !important; -webkit-print-color-adjust: exact; }
                        .report-table td { border: 1px solid #000 !important; color: #000 !important; }
                    }
                    .report-table { width: 100%; border-collapse: collapse; }
                    .report-table th { background-color: #f1f5f9; border: 1px solid #000; padding: 6px 4px; font-size: 10px; text-transform: uppercase; }
                    .report-table td { border: 1px solid #000; padding: 4px 8px; font-size: 11px; }
                `}} />

                <div className="report-container p-[10mm] flex flex-col print:block print:bg-white">
                    
                    <div className="flex items-start justify-between border-b-2 border-black pb-2 mb-3">
                        <div className="flex items-center gap-4">
                            {schoolConfig?.logoBase64 && (
                                <img src={schoolConfig.logoBase64} alt="Logo" className="w-16 h-16 object-contain" />
                            )}
                            <div className="flex flex-col">
                                <h1 className="text-lg font-black uppercase leading-tight">{schoolConfig?.schoolName}</h1>
                                <div className="mt-1 text-[12px] font-bold capitalize space-y-0.1">
                                    <p>{schoolConfig?.address}, {schoolConfig?.city}</p>
                                    <p>{schoolConfig?.subdivision} / {schoolConfig?.province}</p>
                                    <p className="font-bold lowercase"> <span className="font-bold capitalize">Email:</span> {schoolConfig?.email} | Contact(s): {schoolConfig?.phone}</p>
                                    <p className="text-blue-700 lowercase" > <span className="text-black capitalize">Site web: </span>{schoolConfig?.website}</p>
                                    <p className="text-orange-700">{schoolConfig?.slogan}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-[9px] font-black uppercase bg-black text-white px-2 py-1 mb-1 print:border print:border-black print:text-black print:bg-white">Rapport de Caisse</div>
    
                        </div>
                    </div>

                    <div className="text-center mb-3">
                        <h2 className="text-md font-black uppercase underline underline-offset-4">Synthèse des Perceptions de Caisse</h2>
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-2 text-[9px] font-bold uppercase">
                            <p>Classe : <span className="text-blue-700 print:text-black">{reportCriteria?.classroomName || "Toutes les classes"}</span></p>
                            <p>Période : <span className="text-blue-700 print:text-black">{reportCriteria?.periodLabel || data?.periodLabel}</span></p>
                            <p>Année Scolaire : <span className="text-blue-700 print:text-black">{data?.academicYear}</span></p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <table className="report-table" >
                            <thead>
                                <tr>
                                    <th className="w-8">N°</th>
                                    <th className="text-left">Désignation</th>
                                    <th className="w-24">Rubrique</th>
                                    <th className="w-16">Devise</th>
                                    <th className="text-right w-32">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.groups.flatMap((group, gIdx) => (
                                    group.items.map((item, iIdx) => (
                                        <tr key={`${gIdx}-${iIdx}`}>
                                            <td className="text-center">{iIdx + 1}</td>
                                            <td className="font-bold uppercase text-[10px]">{item.itemName}</td>
                                            <td className="text-center text-[8px]">{group.groupName}</td>
                                            <td className="text-center font-bold">{item.currency}</td>
                                            <td className="text-right font-mono font-bold">
                                                {item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                            <tfoot>
                                {/* Modification ici : Boucle dynamique pour les sous-totaux par rubrique */}
                                {data.groups.map((group, idx) => (
                                    <React.Fragment key={`group-total-${idx}`}>
                                        <tr className="bg-slate-50/50 print:bg-transparent font-bold text-slate-700 print:text-black">
                                            <td colSpan="4" className="text-right uppercase text-[8px] py-1 border border-black border-t-2">Total {group.groupName} (USD) :</td>
                                            <td className="text-right font-mono border border-black border-t-2">
                                                {group.groupTotalUSD ? group.groupTotalUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : "0,00"} $
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-50/50 print:bg-transparent font-bold text-slate-700 print:text-black">
                                            <td colSpan="4" className="text-right uppercase text-[8px] py-1 border border-black">Total {group.groupName} (CDF) :</td>
                                            <td className="text-right font-mono border border-black">
                                                {group.groupTotalCDF ? group.groupTotalCDF.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : "0,00"} FC
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                                {/* Totaux Généraux existants */}
                                <tr className="bg-slate-100 print:bg-transparent font-black">
                                    <td colSpan="4" className="text-right uppercase text-[9px] py-2 border-t-4 border-double border-black">Total Général (USD) :</td>
                                    <td className="text-right text-blue-700 print:text-black font-mono border border-black border-t-4 border-double">
                                        {data.totalGeneralUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $
                                    </td>
                                </tr>
                                <tr className="bg-slate-100 print:bg-transparent font-black">
                                    <td colSpan="4" className="text-right uppercase text-[9px] py-2">Total Général (CDF) :</td>
                                    <td className="text-right text-emerald-700 print:text-black font-mono border border-black">
                                        {data.totalGeneralCDF.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} FC
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-8 pt-4 border-t border-black page-break-inside-avoid">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col items-center min-w-[200px]">
                                <p className="font-black uppercase text-[9px] mb-8"> Nom & Signature Caissier(e) et Sceau</p>
                                <p className="font-black text-slate-900 print:text-black uppercase text-[10px] text-center">
                                    {cashierDisplayName}
                                </p>
                            </div>

                            <div className="text-[9px] font-bold italic text-right">
                                <p>Fait à {schoolConfig?.city || "Goma"}, le {printDate}</p>
                                <p className="font-normal not-italic text-slate-400 print:text-black mt-1">Généré à {printTime}</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] print:opacity-[0.05] pointer-events-none -z-10 overflow-hidden">
                        <h1 className="text-[7rem] font-black rotate-[-35deg] uppercase whitespace-nowrap text-black">{schoolConfig?.schoolName}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashReceiptReports;