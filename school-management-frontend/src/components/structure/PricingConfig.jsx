import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, ListChecks, CheckSquare, Square, Clock, AlertCircle, CheckCircle2, Trash2, Edit3, XCircle, Printer, Lock, Eye } from 'lucide-react';
import { ClassroomService } from '../../services/classroomService';
import financeAdminService from '../../services/financeAdminService';

const PricingConfig = () => {
    // États de données
    const [activeYear, setActiveYear] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [existingSchedules, setExistingSchedules] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [viewingSchedule, setViewingSchedule] = useState(null); 
    const [hoveredClass, setHoveredClass] = useState(null);
    
    // États du formulaire
    const [totalAmount, setTotalAmount] = useState('');
    const [frequency, setFrequency] = useState('TRIMESTER'); 
    const [currency, setCurrency] = useState('USD');
    const [startDate, setStartDate] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // État pour les messages flash (Succès/Erreur)
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Effet pour faire disparaître le message après 5 secondes
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const resYear = await financeAdminService.getActiveAcademicYear();
            const currentYear = resYear.data;
            setActiveYear(currentYear);

            if (currentYear) {
                const [resClasses, resSchedules] = await Promise.all([
                    ClassroomService.getAll(currentYear.id),
                    financeAdminService.getSchedulesByYear(currentYear.id)
                ]);
                
                const fetchedSchedules = resSchedules.data;
                const fetchedClasses = resClasses.data;

                const sortedClasses = [...fetchedClasses].sort((a, b) => {
                    const hasSchedA = fetchedSchedules.some(s => s.levelId === a.levelId && s.optionId === a.optionId);
                    const hasSchedB = fetchedSchedules.some(s => s.levelId === b.levelId && s.optionId === b.optionId);
                    
                    if (hasSchedA && !hasSchedB) return -1;
                    if (!hasSchedA && hasSchedB) return 1;
                    return 0;
                });

                setClassrooms(sortedClasses);
                setExistingSchedules(fetchedSchedules);
            }
        } catch (err) {
            console.error("Erreur chargement:", err);
            setMessage({ type: 'error', text: "Erreur lors du chargement des données." });
        } finally {
            setLoading(false);
        }
    };

    const getScheduleForClass = (cls) => {
        return existingSchedules.find(s => s.levelId === cls.levelId && s.optionId === cls.optionId);
    };

    const toggleClassSelection = (cls) => {
        if (isEditing) return; 
        
        const schedule = getScheduleForClass(cls);
        if (schedule) {
            setViewingSchedule(viewingSchedule?.id === schedule.id ? null : schedule);
            setSelectedClasses([]); 
            return;
        }
        
        setViewingSchedule(null); 
        setSelectedClasses(prev => 
            prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
        );
    };

    const handleStartEdit = () => {
        if (!viewingSchedule) return;
        setTotalAmount(viewingSchedule.totalAmount);
        setFrequency(viewingSchedule.paymentFrequency);
        setCurrency(viewingSchedule.currency);
        
        let dateVal = viewingSchedule.startDate;
        if (Array.isArray(dateVal)) {
            const [y, m, d] = dateVal;
            dateVal = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        }
        setStartDate(dateVal || '');
        
        setIsEditing(true);
        const cls = classrooms.find(c => c.levelId === viewingSchedule.levelId && c.optionId === viewingSchedule.optionId);
        if (cls) setSelectedClasses([cls.id]);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setTotalAmount('');
        setSelectedClasses([]);
        setViewingSchedule(null);
    };

    const handleDelete = async () => {
        if (!viewingSchedule) return;
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce barème ? Toutes les tranches associées seront supprimées.")) return;
        
        try {
            await financeAdminService.deleteSchedule(viewingSchedule.id);
            setViewingSchedule(null);
            setMessage({ type: 'success', text: "Le barème a été supprimé avec succès." });
            loadInitialData();
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors de la suppression." });
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "---";
        if (Array.isArray(dateValue)) {
            const [y, m, d] = dateValue;
            return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
        }
        if (typeof dateValue === 'string' && dateValue.includes('-')) {
            const [y, m, d] = dateValue.split('-');
            return `${d}/${m}/${y}`;
        }
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('fr-FR');
    };

    const handlePrint = () => {
        if (!viewingSchedule) return;
        const classInfo = classrooms.find(c => c.levelId === viewingSchedule.levelId && c.optionId === viewingSchedule.optionId);
        const schoolInfo = financeAdminService.getSchoolInfo();
        
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Barème - ${classInfo?.displayName}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
                        .school-name { font-size: 20px; font-weight: bold; }
                        .doc-title { text-transform: uppercase; text-decoration: underline; margin-top: 20px; font-size: 18px; }
                        .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background: #f2f2f2; font-size: 12px; }
                        .amount { font-family: monospace; font-weight: bold; text-align: right; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                        .sig { border: 1px solid #ccc; width: 200px; height: 80px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="school-name">${schoolInfo.name}</div>
                        <div>${schoolInfo.address}</div>
                        <div class="doc-title">Barème Officiel des Frais Scolaires</div>
                        <div>Année Académique : ${activeYear?.name || schoolInfo.academicYear}</div>
                    </div>
                    <div class="info-grid">
                        <div><strong>CLASSE :</strong> ${classInfo?.displayName}</div>
                        <div><strong>TOTAL :</strong> ${viewingSchedule.totalAmount} ${viewingSchedule.currency}</div>
                        <div><strong>MODALITÉ :</strong> ${viewingSchedule.paymentFrequency}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Tranche</th>
                                <th>Début</th>
                                <th>Échéance</th>
                                <th style="text-align: right;">Montant (${viewingSchedule.currency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${viewingSchedule.installments.map(inst => `
                                <tr>
                                    <td>N° ${inst.installmentNumber}</td>
                                    <td>${formatDate(inst.startDate)}</td>
                                    <td>${formatDate(inst.dueDate)}</td>
                                    <td class="amount">${inst.amount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <div><p>Le Parent</p><div class="sig"></div></div>
                        <div><p>La Comptabilité</p><div class="sig"></div></div>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const generatePreview = () => {
        if (viewingSchedule && !isEditing) return viewingSchedule.installments || [];
        const amount = parseFloat(totalAmount);
        if (!amount || amount <= 0 || !startDate) return [];

        let num = 1; let monthsToAdd = 0;
        switch(frequency) {
            case 'MONTHLY': num = 10; monthsToAdd = 1; break;
            case 'TRIMESTER': num = 3; monthsToAdd = 3; break;
            case 'SEMESTER': num = 2; monthsToAdd = 6; break;
            case 'ANNUAL': num = 1; monthsToAdd = 12; break;
            default: num = 1;
        }

        const instAmount = (amount / num).toFixed(2);
        let preview = [];
        const [year, month, day] = startDate.split('-').map(Number);
        let currentStart = new Date(year, month - 1, day);

        for (let i = 1; i <= num; i++) {
            const val = i === num ? (amount - (instAmount * (num - 1))).toFixed(2) : instAmount;
            let currentEnd = new Date(currentStart);
            currentEnd.setMonth(currentEnd.getMonth() + monthsToAdd);
            currentEnd.setDate(currentEnd.getDate() - 1);

            const toLocalISO = (date) => {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            };

            preview.push({
                installmentNumber: i,
                amount: val,
                dueDate: toLocalISO(currentEnd),
                startDate: toLocalISO(currentStart)
            });
            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() + 1);
        }
        return preview;
    };

    const handleSaveConfig = async () => {
        if (!activeYear) return setMessage({ type: 'error', text: "Aucune année scolaire active sélectionnée." });
        
        setSubmitting(true);
        try {
            const instCount = { 'MONTHLY': 10, 'TRIMESTER': 3, 'SEMESTER': 2, 'ANNUAL': 1 }[frequency];
            
            if (isEditing) {
                const payload = {
                    academicYearId: activeYear.id,
                    levelId: viewingSchedule.levelId,
                    optionId: viewingSchedule.optionId,
                    currency,
                    totalAmount: parseFloat(totalAmount),
                    numberOfInstallments: instCount,
                    paymentFrequency: frequency,
                    startDate
                };
                await financeAdminService.updateSchedule(viewingSchedule.id, payload);
                setMessage({ type: 'success', text: "Le barème a été mis à jour avec succès !" });
            } else {
                for (const classId of selectedClasses) {
                    const cls = classrooms.find(c => c.id === classId);
                    const payload = {
                        academicYearId: activeYear.id, 
                        levelId: cls.levelId, 
                        optionId: cls.optionId,
                        currency, totalAmount: parseFloat(totalAmount),
                        numberOfInstallments: instCount, paymentFrequency: frequency, startDate
                    };
                    await financeAdminService.createSchedule(payload);
                }
                setMessage({ type: 'success', text: `${selectedClasses.length} barème(s) crée(s) avec succès !` });
            }
            setIsEditing(false);
            setViewingSchedule(null);
            setSelectedClasses([]);
            setTotalAmount('');
            loadInitialData();
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur : " + (error.response?.data?.message || "L'opération a échoué.") });
        } finally {
            setSubmitting(false);
        }
    };

    const displayData = generatePreview();

    if (!loading && !activeYear) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10">
                <div className="p-6 bg-rose-50 text-rose-500 rounded-full mb-6">
                    <Lock size={48} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Configuration Verrouillée</h2>
                <p className="text-slate-400 text-sm font-bold text-center max-w-xs uppercase">
                    Veuillez activer une année scolaire dans les paramètres académiques pour configurer les tarifs.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Notification flottante */}
            {message && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-xs font-black uppercase tracking-wider">{message.text}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-6 p-2">
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 ${isEditing ? 'bg-blue-500' : 'bg-emerald-500'} rounded-2xl text-white shadow-lg`}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                                        {isEditing ? "Modification Barème" : "Barèmes par Classe"}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                                        {isEditing ? "Ajustement des paramètres" : "Configurez ou consultez un barème"}
                                    </p>
                                </div>
                            </div>
                            {activeYear && (
                                <div className="px-4 py-2 bg-slate-900 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
                                    {activeYear.name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Répertoire des classes</label>
                            <div className="border border-slate-100 rounded-[2rem] max-h-64 overflow-y-auto p-3 bg-slate-50/50">
                                {loading ? (
                                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div></div>
                                ) : (
                                    classrooms.map(cls => {
                                        const schedule = getScheduleForClass(cls);
                                        const isSelected = selectedClasses.includes(cls.id);
                                        const isViewing = viewingSchedule?.id === schedule?.id;
                                        const isHovered = hoveredClass === cls.id;

                                        return (
                                            <div 
                                                key={cls.id} 
                                                onClick={() => toggleClassSelection(cls)} 
                                                onMouseEnter={() => setHoveredClass(cls.id)}
                                                onMouseLeave={() => setHoveredClass(null)}
                                                className={`flex items-center justify-between p-3 mb-2 rounded-2xl cursor-pointer transition-all border-2 
                                                    ${schedule ? 'bg-white border-slate-100 opacity-80' : 'bg-white border-transparent hover:border-emerald-200'}
                                                    ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.01]' : ''}
                                                    ${isViewing ? 'border-blue-500 bg-blue-50' : ''}
                                                    ${isHovered && !isSelected && !isViewing ? 'bg-slate-100/50 border-slate-200 translate-x-1' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {schedule ? (
                                                        <CheckCircle2 size={18} className={`${isHovered ? 'text-blue-500 scale-110' : 'text-emerald-500'} transition-all`} />
                                                    ) : isSelected ? (
                                                        <CheckSquare size={18} className="text-emerald-500" />
                                                    ) : (
                                                        <Square size={18} className={`${isHovered ? 'text-emerald-400' : 'text-slate-300'} transition-all`} />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-black uppercase tracking-tight ${schedule ? 'text-slate-400' : 'text-slate-700'}`}>
                                                            {cls.displayName}
                                                        </span>
                                                        {isHovered && (
                                                            <span className="text-[8px] font-black text-slate-400 uppercase animate-pulse">
                                                                {schedule ? "Voir le détail" : isSelected ? "Désélectionner" : "Sélectionner"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {schedule && (
                                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase">
                                                            {schedule.totalAmount} {schedule.currency}
                                                        </span>
                                                    )}
                                                    {isHovered && schedule && <Eye size={14} className="text-blue-400" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {(selectedClasses.length > 0 || isEditing) && (
                            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Montant Global</label>
                                        <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-mono text-emerald-600 text-xl font-black outline-none border-2 border-transparent focus:border-emerald-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Devise</label>
                                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none">
                                            <option value="USD">USD ($)</option>
                                            <option value="CDF">CDF (FC)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fréquence</label>
                                        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none">
                                            <option value="ANNUAL">Annuel</option>
                                            <option value="SEMESTER">Semestriel</option>
                                            <option value="TRIMESTER">Trimestriel</option>
                                            <option value="MONTHLY">Mensuel</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Date début</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={handleSaveConfig} disabled={submitting} className={`w-full py-5 ${isEditing ? 'bg-blue-600' : 'bg-slate-900'} hover:opacity-90 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all`}>
                                        {submitting ? 'Traitement...' : isEditing ? 'Mettre à jour' : `Appliquer à ${selectedClasses.length} classe(s)`}
                                    </button>
                                    {isEditing && (
                                        <button onClick={handleCancelEdit} className="flex items-center justify-center gap-2 py-3 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 rounded-xl">
                                            <XCircle size={14} /> Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className={`${viewingSchedule && !isEditing ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'} p-6 rounded-[2.5rem] border min-h-[500px] transition-colors`}>
                        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-5">
                            <div className="flex items-center gap-3">
                                <ListChecks size={22} className={viewingSchedule ? "text-blue-500" : "text-emerald-500"} />
                                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                                    {viewingSchedule && !isEditing ? "Barème Configuré" : "Aperçu de l'échéancier"}
                                </h3>
                            </div>
                            {viewingSchedule && !isEditing && (
                                <div className="flex gap-2">
                                    <button onClick={handlePrint} className="p-2 bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                        <Printer size={16} />
                                    </button>
                                    <button onClick={handleStartEdit} className="p-2 bg-white text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={handleDelete} className="p-2 bg-white text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {displayData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-28 text-slate-300">
                                <Calendar size={60} className="mb-4 opacity-10" />
                                <p className="font-bold text-xs uppercase tracking-widest opacity-40">Aucun aperçu disponible</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayData.map((t, i) => (
                                    <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${viewingSchedule ? 'bg-blue-600' : 'bg-slate-900'} text-white rounded-xl flex items-center justify-center text-[10px] font-black`}>
                                                    {t.installmentNumber}
                                                </div>
                                                <span className="font-black text-slate-800 uppercase text-[10px]">Tranche {t.installmentNumber}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono font-black text-lg text-slate-900">{t.amount}</span>
                                                <span className="ml-1 text-[10px] font-bold text-slate-400">{currency}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-500">
                                                <Clock size={12} className="text-emerald-500" /> {formatDate(t.startDate)}
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl text-[9px] font-bold text-rose-500">
                                                <Calendar size={12} /> {formatDate(t.dueDate)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingConfig;
