import React, { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';
import academicService from '../../services/academicYearService';
import financeAdminService from '../../services/financeAdminService';
import ExpenseManagerTable from './ExpenseManagerTable';
import { Calendar, PlusCircle, Wallet } from 'lucide-react';

const ExpenseManager = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [activeYear, setActiveYear] = useState(null);

    const [feeGroups, setFeeGroups] = useState([]);
    const [feeItems, setFeeItems] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        currency: 'USD',
        feesItemId: '',
        requestedBy: '',
        requestedByFunction: '' 
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [yearsRes, activeRes] = await Promise.all([
                    academicService.getAllAcademicYears(),
                    academicService.getActiveYear()
                ]);
                
                setAcademicYears(yearsRes.data);
                const year = activeRes.data;
                setActiveYear(year);
                setSelectedYearId(year.id);

                const groupsRes = await financeAdminService.getGroupsByYear(year.id);
                setFeeGroups(groupsRes.data);

                loadExpenses(year.id);
            } catch (error) {
                console.error("Erreur initialisation:", error);
            }
        };
        loadInitialData();
    }, []);

    const loadExpenses = async (yearId) => {
        setLoading(true);
        try {
            const data = await expenseService.getExpensesByAcademicYear(yearId);
            setExpenses(data || []);
        } catch (error) {
            console.error("Erreur chargement dépenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setSelectedGroupId(groupId);
        setFormData(prev => ({ ...prev, feesItemId: '' }));
        if (groupId) {
            try {
                const res = await financeAdminService.getItemsByGroup(groupId);
                setFeeItems(res.data);
            } catch (error) {
                console.error("Erreur items:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requestedBy: `${formData.requestedBy} (${formData.requestedByFunction})`,
                academicYearId: activeYear.id
            };
            
            await expenseService.createExpense(payload);
            alert("Dépense enregistrée et Bon de sortie généré !");
            
            setFormData({ description: '', amount: '', currency: 'USD', feesItemId: '', requestedBy: '', requestedByFunction: '' });
            setSelectedGroupId('');
            loadExpenses(selectedYearId);
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        Gestion des <span className="text-rose-600">Dépenses</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Calendar size={14} />
                        <span>Année active : <strong>{activeYear?.label}</strong></span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-500 px-2">Archive :</span>
                    <select 
                        value={selectedYearId}
                        onChange={(e) => {
                            setSelectedYearId(e.target.value);
                            loadExpenses(e.target.value);
                        }}
                        className="bg-white border-none rounded-xl text-sm font-bold px-4 py-2 outline-none shadow-sm text-blue-700"
                    >
                        {academicYears.map(y => (
                            <option key={y.id} value={y.id}>{y.label} {y.active ? '(Actuelle)' : ''}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 bg-slate-900 p-8 rounded-3xl shadow-2xl text-white border border-slate-800">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-5">
                        <div className="bg-rose-500/20 p-3 rounded-xl text-rose-400"><Wallet size={20} /></div>
                        <h3 className="text-lg font-black uppercase tracking-widest">Sortie de Caisse</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Motif / Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="2"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm transition-all"
                                placeholder="Détail de la dépense..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Montant</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500 font-bold text-rose-400" placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Devise</label>
                                <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold">
                                    <option value="USD">USD ($)</option>
                                    <option value="CDF">CDF (FC)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Groupe de Frais</label>
                                <select value={selectedGroupId} onChange={handleGroupChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm">
                                    <option value="">Choisir un groupe...</option>
                                    {feeGroups.map(g => <option key={g.id} value={g.id}>{g.type}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Catégorie Spécifique (Item)</label>
                                <select name="feesItemId" value={formData.feesItemId} onChange={handleInputChange} required disabled={!selectedGroupId} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm disabled:opacity-30">
                                    <option value="">Sélectionner l'item...</option>
                                    {feeItems.map(i => <option key={i.id} value={i.id}>{i.nameFeesItem}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bénéficiaire</label>
                                <input type="text" name="requestedBy" value={formData.requestedBy} onChange={handleInputChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm" placeholder="Nom complet" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fonction</label>
                                <input type="text" name="requestedByFunction" value={formData.requestedByFunction} onChange={handleInputChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm" placeholder="ex: Proviseur" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest mt-4 transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                            <PlusCircle size={18} /> Valider la Sortie
                        </button>
                    </form>
                </div>

                <div className="xl:col-span-2">
                    <ExpenseManagerTable expenses={expenses} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default ExpenseManager;