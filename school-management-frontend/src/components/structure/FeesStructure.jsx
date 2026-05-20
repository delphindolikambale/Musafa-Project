import React, { useState, useEffect } from 'react';
import financeAdminService from '../../services/financeAdminService';
import { PieChart, CheckCircle, Trash2, Pencil, X, Save, PlusCircle, Printer, Loader2, AlertTriangle } from 'lucide-react';

const FeesStructure = () => {
    const [groups, setGroups] = useState([]);
    const [activeYear, setActiveYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour la création de groupe
    const [newGroupType, setNewGroupType] = useState('SCOLARITE');
    const [newGroupPercent, setNewGroupPercent] = useState('');

    // États pour l'édition de groupe
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupPercent, setEditGroupPercent] = useState('');
    
    // États pour l'édition d'item
    const [editingItemId, setEditingItemId] = useState(null);
    const [editItemName, setEditItemName] = useState('');
    const [editItemPercent, setEditItemPercent] = useState('');

    // États pour la création d'item
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPercent, setNewItemPercent] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            // 1. Récupérer l'année active dynamiquement
            const resYear = await financeAdminService.getActiveAcademicYear();
            if (resYear.data) {
                setActiveYear(resYear.data);
                // 2. Charger les données liées à cet ID
                await loadData(resYear.data.id);
            } else {
                setError("Aucune année scolaire active trouvée.");
            }
        } catch (e) {
            console.error("Erreur initialisation:", e);
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async (yearId) => {
        try {
            const resGroups = await financeAdminService.getGroupsByYear(yearId); 
            const groupsWithItems = await Promise.all(resGroups.data.map(async (g) => {
                try {
                    const resItems = await financeAdminService.getItemsByGroup(g.id);
                    return { ...g, items: resItems.data || [] };
                } catch (e) {
                    return { ...g, items: [] };
                }
            }));
            setGroups(groupsWithItems);
        } catch (e) { 
            console.error("Erreur chargement des groupes:", e); 
        }
    };

    const handlePrint = () => {
        const schoolInfo = financeAdminService.getSchoolInfo();
        const printWindow = window.open('', '_blank');
        
        const content = `
            <html>
                <head>
                    <title>Structure des Frais - ${activeYear?.annee}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
                        .school-name { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; }
                        .doc-title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #475569; }
                        .group-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
                        .group-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px; }
                        .group-type { font-size: 16px; font-weight: 800; text-transform: uppercase; }
                        .group-percent { font-size: 18px; font-weight: 900; color: #2563eb; }
                        .item-row { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; margin-bottom: 5px; border-radius: 6px; }
                        .footer { margin-top: 50px; text-align: right; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="school-name">${schoolInfo.name}</h1>
                        <p>${schoolInfo.address}</p>
                        <div class="doc-title">STRUCTURE DES FRAIS - ANNÉE SCOLAIRE ${activeYear?.annee}</div>
                    </div>
                    ${groups.map(group => `
                        <div class="group-card">
                            <div class="group-header">
                                <span class="group-type">${group.type}</span>
                                <span class="group-percent">${group.percentage}%</span>
                            </div>
                            ${group.items.map(item => `
                                <div class="item-row">
                                    <span>↳ ${item.nameFeesItem}</span>
                                    <span>${item.percentage}%</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                    <div class="footer">Généré le ${new Date().toLocaleDateString()}</div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const handleError = (error) => {
        const message = error.response?.data?.message || "Une erreur est survenue";
        alert(message);
    };

    const totalGroupPercentage = groups.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    const isGlobalValid = totalGroupPercentage === 100;

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const percent = parseFloat(newGroupPercent);
        if (percent + totalGroupPercentage > 100) {
            alert(`Total dépasserait 100% (actuel: ${totalGroupPercentage}%)`);
            return;
        }
        try {
            await financeAdminService.createGroup({
                academicYearId: activeYear.id, 
                type: newGroupType,
                percentage: percent
            });
            setNewGroupPercent('');
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    const handleUpdateGroup = async (group) => {
        const newPercent = parseFloat(editGroupPercent);
        if ((totalGroupPercentage - group.percentage) + newPercent > 100) {
            alert("Le total des groupes ne peut pas dépasser 100%.");
            return;
        }
        try {
            await financeAdminService.updateGroup(group.id, {
                ...group,
                percentage: newPercent,
                academicYearId: activeYear.id
            });
            setEditingGroupId(null);
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    const handleCreateItem = async (groupId, group) => {
        if (!newItemName || !newItemPercent) return;
        const percent = parseFloat(newItemPercent);
        const currentItemsTotal = group.items.reduce((acc, item) => acc + item.percentage, 0);
        if (currentItemsTotal + percent > group.percentage) {
            alert(`Dépassement du quota groupe (${group.percentage}%).`);
            return;
        }
        try {
            await financeAdminService.createItem({
                academicYearId: activeYear.id,
                feesGroupId: groupId,
                nameFeesItem: newItemName,
                percentage: percent
            });
            setActiveGroupId(null);
            setNewItemName('');
            setNewItemPercent('');
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    const handleUpdateItem = async (item, group) => {
        const newPercent = parseFloat(editItemPercent);
        const otherItemsTotal = group.items.filter(i => i.id !== item.id).reduce((acc, i) => acc + i.percentage, 0);
        if (otherItemsTotal + newPercent > group.percentage) {
            alert(`Total items (${otherItemsTotal + newPercent}%) dépasse le groupe (${group.percentage}%).`);
            return;
        }
        try {
            await financeAdminService.updateItem(item.id, {
                ...item,
                nameFeesItem: editItemName,
                percentage: newPercent,
                academicYearId: activeYear.id
            });
            setEditingItemId(null);
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Supprimer ce groupe ?")) return;
        try {
            await financeAdminService.deleteGroup(id);
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Supprimer ce sous-frais ?")) return;
        try {
            await financeAdminService.deleteItem(id);
            loadData(activeYear.id);
        } catch (error) { handleError(error); }
    };

    if (error || (!activeYear && !loading)) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h2 className="text-xl font-black text-slate-800 uppercase">Année scolaire non active</h2>
                <p className="text-slate-500 text-center mt-2">{error || "Veuillez activer une année dans le Calendrier."}</p>
                <button onClick={fetchInitialData} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase">Réessayer</button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6 p-4">
            {/* Colonne Gauche */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white"><PieChart size={20} /></div>
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Nouveau Groupe</h3>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-500">Total {activeYear?.annee}</span>
                            <span className={isGlobalValid ? "text-green-500" : "text-amber-500"}>{totalGroupPercentage}% / 100%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${isGlobalValid ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(totalGroupPercentage, 100)}%` }}></div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Type</label>
                            <select value={newGroupType} onChange={(e) => setNewGroupType(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500">
                                <option value="SCOLARITE">Scolarité</option>
                                <option value="DIVERS">Frais Divers</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Pourcentage (%)</label>
                            <input type="number" value={newGroupPercent} onChange={(e) => setNewGroupPercent(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-mono text-blue-600 font-bold" placeholder="0-100" required />
                        </div>
                        <button type="submit" disabled={totalGroupPercentage >= 100} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg disabled:bg-slate-300 transition-colors">Enregistrer</button>
                    </form>
                </div>
            </div>

            {/* Colonne Droite */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Structure Active</h3>
                        <div className="flex items-center gap-3">
                            {!loading && <button onClick={handlePrint} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold"><Printer size={16} /> Imprimer</button>}
                            {isGlobalValid && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> 100% OK</span>}
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center p-20 text-slate-400"><Loader2 className="animate-spin" size={32} /></div>
                    ) : (
                        <div className="space-y-6">
                            {groups.map(group => {
                                const totalItemsPercent = group.items.reduce((acc, curr) => acc + curr.percentage, 0);
                                const isGroupEditing = editingGroupId === group.id;
                                return (
                                    <div key={group.id} className="border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-100 transition-colors">
                                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                                            <div className="flex items-center gap-4">
                                                <h4 className="font-black text-lg text-slate-800 uppercase">{group.type}</h4>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setEditingGroupId(group.id); setEditGroupPercent(group.percentage); }} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={16}/></button>
                                                    <button onClick={() => handleDeleteGroup(group.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                            {isGroupEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input type="number" value={editGroupPercent} onChange={e => setEditGroupPercent(e.target.value)} className="w-20 p-1 border rounded font-mono text-blue-600" />
                                                    <button onClick={() => handleUpdateGroup(group)} className="text-green-600"><Save size={18}/></button>
                                                    <button onClick={() => setEditingGroupId(null)} className="text-slate-400"><X size={18}/></button>
                                                </div>
                                            ) : (
                                                <span className="text-2xl font-black text-blue-600">{group.percentage}%</span>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-4 pl-4 border-l-2 border-blue-50">
                                            {group.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg group">
                                                    {editingItemId === item.id ? (
                                                        <div className="flex items-center gap-2 w-full">
                                                            <input type="text" value={editItemName} onChange={e => setEditItemName(e.target.value)} className="flex-1 p-1 border rounded text-sm" />
                                                            <input type="number" value={editItemPercent} onChange={e => setEditItemPercent(e.target.value)} className="w-16 p-1 border rounded text-sm" />
                                                            <button onClick={() => handleUpdateItem(item, group)} className="text-green-600"><Save size={16}/></button>
                                                            <button onClick={() => setEditingItemId(null)} className="text-slate-400"><X size={16}/></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-bold text-slate-600">↳ {item.nameFeesItem}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-black text-slate-400">{item.percentage}%</span>
                                                                <div className="hidden group-hover:flex gap-1">
                                                                    <button onClick={() => { setEditingItemId(item.id); setEditItemName(item.nameFeesItem); setEditItemPercent(item.percentage); }} className="text-blue-500"><Pencil size={14}/></button>
                                                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-500"><Trash2 size={14}/></button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            {activeGroupId === group.id ? (
                                                <div className="flex items-end gap-2">
                                                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 p-2 bg-white border rounded font-bold text-sm" placeholder="Nom" />
                                                    <input type="number" value={newItemPercent} onChange={e => setNewItemPercent(e.target.value)} className="w-20 p-2 bg-white border rounded font-bold text-sm" placeholder="%" />
                                                    <button onClick={() => handleCreateItem(group.id, group)} className="p-2 bg-blue-600 text-white rounded font-bold text-sm px-4">OK</button>
                                                    <button onClick={() => setActiveGroupId(null)} className="p-2 bg-slate-300 rounded text-sm px-3">✕</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-400">Total : {totalItemsPercent}% / {group.percentage}%</span>
                                                    {totalItemsPercent < group.percentage && (
                                                        <button onClick={() => setActiveGroupId(group.id)} className="text-blue-600 flex items-center gap-1 hover:underline"><PlusCircle size={14}/> Ajouter un item</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeesStructure;