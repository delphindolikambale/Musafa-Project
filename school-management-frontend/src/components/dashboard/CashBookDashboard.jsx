import React, { useState, useEffect } from 'react';
import { cashBookService } from '../../services/cashBookService';
import academicService from '../../services/academicYearService';
import CashBookJournalTable from './CashBookJournalTable';

const CashBookDashboard = ({ onBack, onNavigateToDetails }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [journalData, setJournalData] = useState([]);
    const [schoolConfig, setSchoolConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeYearLabel, setActiveYearLabel] = useState('Chargement...');
    const [activeYearId, setActiveYearId] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const [filterType, setFilterType] = useState('MONTHLY');
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [activeYearRes, configRes] = await Promise.all([
                    academicService.getActiveYear(),
                    cashBookService.getSchoolConfig()
                ]);

                if (activeYearRes.data) {
                    setActiveYearLabel(activeYearRes.data.yearName || activeYearRes.data.label || "N/A");
                    setActiveYearId(activeYearRes.data.id);
                }
                
                if (configRes) {
                    setSchoolConfig(configRes);
                }

            } catch (err) {
                console.error("Erreur de chargement des données initiales:", err);
                setActiveYearLabel("Année non définie");
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeYearId) {
            fetchCashBookData();
        }
    }, [activeYearId, filterType, currentDate]);

    const fetchCashBookData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [dashData, jourData] = await Promise.all([
                cashBookService.getDashboardData(activeYearId, filterType, currentDate),
                cashBookService.getCashBookJournal(activeYearId, filterType, currentDate)
            ]);

            setDashboardData(dashData);
            setJournalData(jourData);
        } catch (err) {
            console.error("Erreur API Livre de Caisse:", err);
            setError("Impossible de charger le livre de caisse.");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setLoading(true);
            await cashBookService.syncJournal();
            await fetchCashBookData();
        } catch (err) {
            console.error("Erreur lors de la synchronisation:", err);
            setError("Erreur lors de la synchronisation.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0.00";
        return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const getPeriodLabel = () => {
        const date = new Date(currentDate);
        if (filterType === 'DAILY') return `Journée du ${date.toLocaleDateString('fr-FR')}`;
        if (filterType === 'MONTHLY') return `Mois de ${date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`;
        if (filterType === 'ANNUAL') return `Année ${date.getFullYear()}`;
        return `Période sélectionnée`; 
    };

    const getTotalsLabel = () => {
        const date = new Date(currentDate);
        if (filterType === 'DAILY') return `Total journée (${date.toLocaleDateString('fr-FR')})`;
        if (filterType === 'MONTHLY') {
            const monthStr = date.toLocaleString('fr-FR', { month: 'long' });
            return `Total mois ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}`;
        }
        if (filterType === 'ANNUAL') return `Total année ${date.getFullYear()}`;
        return `TOTAUX PÉRIODE`; 
    };

    const handleExportExcel = () => {
        const table = document.getElementById("report-table");
        if (!table) return;

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; }
                    th, td { border: 1px solid #475569; padding: 6px; text-align: right; }
                    th { background-color: #10b981; color: white; text-align: center; }
                    td:first-child, td:nth-child(2) { text-align: left; }
                </style>
            </head>
            <body>
                <h2>Livre de Caisse - ${getPeriodLabel()}</h2>
                ${table.outerHTML}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Livre_Caisse_${currentDate}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="px-3 md:px-6 pb-4 w-full max-w-[1600px] mx-auto flex flex-col gap-4 animate-in fade-in duration-500 h-full relative">
            
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        margin: 0; 
                        padding: 10mm;
                        background: white;
                    }
                    .print-hide { display: none !important; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
                `}
            </style>

            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex-1 min-w-fit flex items-center gap-4">
                        {onBack && (
                            <button 
                                onClick={onBack}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors shadow-sm shrink-0"
                                title="Retour"
                            >
                                ⬅️
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                Livre de <span className="text-emerald-600">Caisse Général</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-slate-500 font-medium text-xs md:text-sm whitespace-nowrap leading-none uppercase">
                                    {getPeriodLabel()} — <span className="text-emerald-600 font-bold">{activeYearLabel}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Périodicité</label>
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner h-10">
                                {['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-3 sm:px-4 h-full rounded-lg text-[10px] font-black transition-all ${
                                            filterType === type 
                                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {type === 'DAILY' ? 'JOUR' : type === 'WEEKLY' ? 'SEMAINE' : type === 'MONTHLY' ? 'MOIS' : 'ANNÉE'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Date cible</label>
                            <input 
                                type="date" 
                                value={currentDate}
                                onChange={(e) => setCurrentDate(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 h-10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center gap-2 self-end">
                            <button 
                                onClick={onNavigateToDetails} 
                                className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center gap-2 border border-blue-700 active:scale-95"
                                title="Voir les détails des transactions"
                            >
                                📋 <span className="hidden sm:inline">Details</span>
                            </button>

                            <button 
                                onClick={handleSync} 
                                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/30 flex items-center gap-2 border border-emerald-700 active:scale-95"
                                title="Synchroniser les données"
                            >
                                🔄 <span className="hidden sm:inline">Synchroniser</span>
                            </button>

                            <button 
                                onClick={() => setShowPrintModal(true)} 
                                className="h-10 bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/30 flex items-center gap-2 border border-slate-700 active:scale-95"
                                title="Imprimer ou Exporter le rapport"
                            >
                                🖨️ <span className="hidden sm:inline">Imprimer</span>
                            </button>
                            
                            <button 
                                onClick={fetchCashBookData} 
                                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border border-slate-200 active:scale-95"
                                title="Actualiser la page"
                            >
                                ↻
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-xs font-bold animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-3xl shadow-lg shadow-blue-500/20">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Total Entrées (Paiements)</p>
                            <div className="mt-2">
                                <h3 className="text-2xl font-black text-white">
                                    {formatCurrency(dashboardData?.totalEntriesUSD)} <span className="text-sm font-normal text-blue-200">USD</span>
                                </h3>
                                <h3 className="text-xl font-bold text-blue-100/90 leading-tight">
                                    {formatCurrency(dashboardData?.totalEntriesCDF)} <span className="text-sm font-normal">FC</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl text-2xl shadow-inner">📈</div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-blue-600 p-5 rounded-3xl shadow-lg shadow-orange-500/20">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Total Sorties (Dépenses)</p>
                            <div className="mt-2">
                                <h3 className="text-2xl font-black text-white">
                                    {formatCurrency(dashboardData?.totalExitsUSD)} <span className="text-sm font-normal text-orange-200">USD</span>
                                </h3>
                                <h3 className="text-xl font-bold text-blue-100/90 leading-tight">
                                    {formatCurrency(dashboardData?.totalExitsCDF)} <span className="text-sm font-normal">FC</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl text-2xl shadow-inner">📉</div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-3xl shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-50">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-widest opacity-90">Solde Caisse Physique</p>
                            <div className="mt-2">
                                <h3 className="text-3xl font-black text-white leading-none">
                                    {formatCurrency(dashboardData?.netBalanceUSD)} <span className="text-base font-normal text-emerald-100">USD</span>
                                </h3>
                                <h3 className="text-2xl font-bold text-white/90 leading-tight mt-1">
                                    {formatCurrency(dashboardData?.netBalanceCDF)} <span className="text-base font-normal">FC</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl text-3xl shadow-inner">💰</div>
                    </div>
                </div>
            </div>

            <CashBookJournalTable 
                journalData={journalData} 
                loading={loading} 
                formatCurrency={formatCurrency} 
                formatDate={formatDate} 
                totalsLabel={getTotalsLabel()}
                isPrint={false}
            />

            {showPrintModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 flex flex-col items-center overflow-y-auto print:bg-white print:p-0">
                    <div className="w-full max-w-[297mm] flex justify-between items-center py-4 px-4 sticky top-0 bg-slate-900/90 backdrop-blur-sm print-hide z-50">
                        <button 
                            onClick={() => setShowPrintModal(false)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        >
                            ❌ Fermer
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleExportExcel}
                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                            >
                                📊 Exporter Excel
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/50"
                            >
                                🖨️ Lancer l'impression
                            </button>
                        </div>
                    </div>

                    <div id="print-area" className="bg-white w-full max-w-[297mm] min-h-[210mm] p-[10mm] md:p-[15mm] shadow-2xl mb-8 flex flex-col text-slate-900 mx-auto">
                        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
                            <div className="flex items-center gap-4">
                                {schoolConfig?.logoBase64 ? (
                                    <img src={schoolConfig.logoBase64} alt="Logo" className="h-20 w-20 object-contain" />
                                ) : (
                                    <div className="h-20 w-20 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500 text-center font-bold">LOGO</div>
                                )}
                                <div>
                                    <h2 className="text-xl font-black uppercase text-slate-900">{schoolConfig?.schoolName || "NOM DE L'INSTITUTION NON CONFIGURÉ"}</h2>
                                    <p className="text-xs font-bold text-slate-600 italic">{schoolConfig?.slogan || ""}</p>
                                    <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                                        <p>{schoolConfig?.address || "Adresse non configurée"}</p>
                                        <p>{schoolConfig?.phone ? `Tél: ${schoolConfig.phone}` : ""} {schoolConfig?.email ? `| Email: ${schoolConfig.email}` : ""}</p>
                                        {schoolConfig?.decreeOfCreation && <p>Arrêté: {schoolConfig.decreeOfCreation}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black uppercase underline decoration-2 underline-offset-4 mb-2">RAPPORT DU LIVRE DE CAISSE</h1>
                            <p className="text-sm font-bold bg-slate-100 inline-block px-4 py-1 rounded-full border border-slate-200">
                                {getPeriodLabel()} — Année Académique : {activeYearLabel}
                            </p>
                        </div>

                        <CashBookJournalTable 
                            journalData={journalData} 
                            loading={loading} 
                            formatCurrency={formatCurrency} 
                            formatDate={formatDate} 
                            totalsLabel={getTotalsLabel()}
                            isPrint={true}
                            tableId="report-table"
                        />

                        <div className="mt-8 pt-6 flex justify-between items-start text-sm">
                            <div className="text-center">
                                <p className="font-bold underline mb-12">La Direction / L'Administration</p>
                                <p className="font-bold">{schoolConfig?.headmasterName || "Le Directeur"}</p>
                            </div>
                            <div className="text-center">
                                <p className="italic mb-2">
                                    Fait à {schoolConfig?.city || "..........."}, le {new Date().toLocaleDateString('fr-FR')}
                                </p>
                                <p className="font-bold underline mb-12">Le Caissier / La Caissière</p>
                                <p className="font-bold">{schoolConfig?.defaultCashierName || "Nom du Caissier non défini"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashBookDashboard;