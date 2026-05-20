import React, { useState, useEffect } from 'react';
import { cashReceiptService } from '../../services/cashReceiptService';
import academicService from '../../services/academicYearService';

const CashReceiptDashboard = ({ 
    onNavigateToReport = () => console.warn("onNavigateToReport non défini"), 
    onNavigateToCashBook = () => console.warn("onNavigateToCashBook non défini") 
}) => {
    const getLocalDate = () => {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(now.getTime() - offsetMs);
        return localDate.toISOString().split('T')[0];
    };

    const [filterType, setFilterType] = useState('DAILY');
    const [currentDate, setCurrentDate] = useState(getLocalDate());
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [classrooms, setClassrooms] = useState([]); 
    const [data, setData] = useState(null);
    const [schoolConfig, setSchoolConfig] = useState(null);
    const [activeYearLabel, setActiveYearLabel] = useState('Chargement...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [clsData, configData, activeYearRes] = await Promise.all([
                    cashReceiptService.getClassrooms(),
                    cashReceiptService.getSchoolConfig(),
                    academicService.getActiveYear()
                ]);
                setClassrooms(clsData);
                setSchoolConfig(configData);
    
                if (activeYearRes.data) {
                    setActiveYearLabel(activeYearRes.data.yearName || activeYearRes.data.label || "N/A");
                }
            } catch (err) {
                console.error("Erreur de chargement configuration:", err);
                setActiveYearLabel("Année non définie");
            }
        };
    
        loadInitialData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [filterType, currentDate, selectedClassroomId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await cashReceiptService.getDashboardData(
                filterType, 
                currentDate, 
                selectedClassroomId !== '' ? selectedClassroomId : null
            );
    
            setData(result);
        } catch (err) {
            console.error("Erreur API Caisse:", err);
            setError("Impossible de charger les données financières.");
        } finally {
            setLoading(false);
        }
    };

    const getGroupTotals = (groupName) => {
        if (!data || !data.groups) return { usd: "0.00", cdf: "0.00" };
        const group = data.groups.find(g => g.groupName === groupName);
        return {
            usd: group ? group.groupTotalUSD.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00",
            cdf: group ? group.groupTotalCDF.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00"
        };
    };

    const formatCustomPeriod = (dateString, filter, defaultLabel) => {
        if (!dateString) return defaultLabel;
        const [year, month, day] = dateString.split('-');
        const d = new Date(year, parseInt(month) - 1, day);
        
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const formatDateStr = (dateObj) => {
            return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        };

        if (filter === 'DAILY') {
            return `${days[d.getDay()]} ${formatDateStr(d)}`;
        } else if (filter === 'WEEKLY') {
            const currentDay = d.getDay();
            const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
            const monday = new Date(d);
            monday.setDate(d.getDate() - distanceToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `Semaine du ${formatDateStr(monday)} au ${formatDateStr(sunday)}`;
        }
        return defaultLabel;
    };

    const displayPeriod = formatCustomPeriod(currentDate, filterType, data?.periodLabel);
    const displayAcademicYear = data?.academicYear || activeYearLabel;

    const getSelectedClassroomName = () => {
        if (!selectedClassroomId) return "Toutes les classes";
        const classroom = classrooms.find(c => c.id.toString() === selectedClassroomId.toString());
        return classroom ? classroom.displayName : "Toutes les classes";
    };

    return (
        <div className="px-3 pt-0 pb-3 md:px-6 md:pt-0 md:pb-6 space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto">
            
            {/* --- HEADER RESTRUCTURÉ EN 4 LIGNES --- */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
                
                {/* Ligne 1 : Titre aligné à gauche toute largeur */}
                <div className="w-full">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Flux de <span className="text-blue-600">Trésorerie</span>
                    </h1>
                </div>

                {/* Ligne 2 : Affichage de la période */}
                <div className="w-full">
                    <p className="text-slate-500 font-bold text-sm md:text-base">
                        {displayPeriod || "Analyse des encaissements"} — <span className="text-blue-600 font-black">{displayAcademicYear}</span>
                    </p>
                </div>

                {/* Ligne 3 : Classe, Tabs (Jour, Semaine...), et Date */}
                <div className="flex flex-wrap items-end gap-3 w-full">
                    {/* Sélecteur de Classe */}
                    <div className="flex-1 min-w-[160px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Classe</label>
                        <select 
                            value={selectedClassroomId}
                            onChange={(e) => setSelectedClassroomId(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        >
                            <option value="">Toutes les classes</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>{c.displayName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabs de Filtres */}
                    <div className="flex-none order-last sm:order-none w-full sm:w-auto">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Périodicité</label>
                        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner flex overflow-x-auto no-scrollbar">
                            {['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${
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

                    {/* Input Date */}
                    <div className="flex-1 min-w-[140px] sm:flex-none">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Date</label>
                        <input 
                            type="date" 
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                    </div>
                </div>

                {/* Ligne 4 : Boutons Rapport et Livre de caisse */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <button 
                        onClick={() => onNavigateToReport({ 
                            filterType, currentDate, selectedClassroomId, 
                            classroomName: getSelectedClassroomName(),
                            periodLabel: displayPeriod, academicYear: displayAcademicYear 
                        })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                    >
                        📊 Rapport A4
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); onNavigateToCashBook(); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                    >
                        📗 Livre de Caisse
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-xs font-bold">
                    ⚠️ {error}
                </div>
            )}

            {/* --- RESTE DU CONTENU (CARTES ET TABLEAU) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-3xl shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase opacity-80">Scolarité</p>
                            <div className="mt-2">
                                <h3 className="text-xl md:text-2xl font-black text-white">
                                    {getGroupTotals("SCOLARITE").usd} <span className="text-xs font-normal opacity-70">USD</span>
                                </h3>
                                <h3 className="text-lg md:text-xl font-bold text-blue-100/90">
                                    {getGroupTotals("SCOLARITE").cdf} <span className="text-xs font-normal">CDF</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-2xl text-xl">🎓</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-slate-900 p-5 rounded-3xl shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-[10px] font-bold uppercase opacity-80">Entrées Divers</p>
                            <div className="mt-2">
                                <h3 className="text-xl md:text-2xl font-black text-white">
                                    {getGroupTotals("DIVERS").usd} <span className="text-xs font-normal opacity-70">USD</span>
                                </h3>
                                <h3 className="text-lg md:text-xl font-bold text-orange-100/90">
                                    {getGroupTotals("DIVERS").cdf} <span className="text-xs font-normal">CDF</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-2xl text-xl">📦</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-3xl shadow-xl sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-50 text-[10px] font-bold uppercase opacity-80">Caisse Physique (Net)</p>
                            <div className="mt-2">
                                <h3 className="text-2xl md:text-3xl font-black text-white">
                                    {data ? data.totalGeneralUSD.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00"} <span className="text-sm font-normal opacity-70">USD</span>
                                </h3>
                                <h3 className="text-xl md:text-2xl font-bold text-white/90">
                                    {data ? data.totalGeneralCDF.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00"} <span className="text-sm font-normal">CDF</span>
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-2xl text-xl">💰</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-800 uppercase">Détails des perceptions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Désignation</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">Catégorie</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">Devise</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="py-10 text-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : data?.groups.flatMap(group => 
                                group.items.map((item, idx) => (
                                    <tr key={`${group.groupId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-800">{item.itemName}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${
                                                group.groupName === 'SCOLARITE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>{group.groupName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[10px] font-bold">{item.currency}</td>
                                        <td className="px-6 py-4 text-right text-xs font-black text-slate-900">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
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

export default CashReceiptDashboard;