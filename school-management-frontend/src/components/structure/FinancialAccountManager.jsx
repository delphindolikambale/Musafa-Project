import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import financialAccountService from '../../services/financialAccountService';
import FeeBreakdownModal from './FeeBreakdownModal'; 

const FinancialAccountManager = () => {
    const { accountNumber: urlAccountNum } = useParams(); 
    const navigate = useNavigate();
    
    const [accounts, setAccounts] = useState([]);
    
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [annualProfiles, setAnnualProfiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState(urlAccountNum || "");
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [activeProfileForModal, setActiveProfileForModal] = useState(null);

    // Identifier le profil actif pour les actions de la barre latérale
    const currentActiveProfile = useMemo(() => {
        if (!annualProfiles.length) return null;
        return annualProfiles.find(p => p.active) || annualProfiles[0];
    }, [annualProfiles]);

    // Méthode de chargement des détails (mémorisée pour être réutilisée lors des rafraîchissements)
    const openAccountDetails = useCallback((acc) => {
        if (!acc) return;
        setSelectedAccount(acc);
        setProfileLoading(true);
        financialAccountService.getAnnualProfilesByAccountId(acc.id)
            .then(setAnnualProfiles)
            .catch(err => console.error("Erreur profils:", err))
            .finally(() => setProfileLoading(false));
    }, []);

    const closeAccountDetails = useCallback(() => {
        setSelectedAccount(null);
        setAnnualProfiles([]);
        if (urlAccountNum) navigate('/caissier/comptes'); 
    }, [urlAccountNum, navigate]);

    const handleOpenBreakdown = (profile) => {
        setActiveProfileForModal(profile);
        setIsBreakdownOpen(true);
    };

    const fetchAccounts = useCallback(async (keyword = "") => {
        setLoading(true);
        try {
            const data = keyword 
                ? await financialAccountService.searchAccounts(keyword) 
                : await financialAccountService.getAllAccounts();
            setAccounts(data);
        } catch (err) {
            console.error("Erreur chargement comptes:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialisation et recherche
    useEffect(() => {
        fetchAccounts(urlAccountNum);
    }, [urlAccountNum, fetchAccounts]);

    // Gestion de l'ouverture automatique via URL
    useEffect(() => {
        if (urlAccountNum && accounts.length > 0) {
            const accToOpen = accounts.find(a => a.accountNumber === urlAccountNum);
            if (accToOpen && (!selectedAccount || selectedAccount.accountNumber !== urlAccountNum)) {
                openAccountDetails(accToOpen);
            }
        }
    }, [urlAccountNum, accounts, selectedAccount, openAccountDetails]);

    /**
     * AMÉLIORATION : ÉCOUTEURS D'ÉVÉNEMENTS POUR MISE À JOUR "SANS ACTUALISATION"
     */
    useEffect(() => {
        // 1. Gestion des nouveaux comptes (existant)
        const handleNewAccount = (event) => {
            const notif = event.detail; 
            const localDate = new Date();
            const dateString = localDate.toISOString();
            
            const newAccMapped = {
                id: notif.accountId || `temp-${Date.now()}`,
                studentFullName: notif.studentName,
                gender: notif.gender || "N/A",
                accountNumber: notif.accountNumber,
                openedAt: dateString, 
                status: "ACTIVE",
                isNew: true 
            };

            setAccounts(prev => {
                if (prev.find(a => a.accountNumber === notif.accountNumber)) return prev;
                return [newAccMapped, ...prev];
            });
        };

        // 2. Gestion des modifications (Nouvelle logique pour l'admin)
        // Cet événement sera déclenché quand un barème est modifié
        const handleDataRefresh = () => {
            if (selectedAccount) {
                // Si on est dans un dossier, on rafraîchit les profils et échéanciers
                openAccountDetails(selectedAccount);
            } else {
                // Sinon on rafraîchit la liste globale
                fetchAccounts(searchTerm);
            }
        };

        window.addEventListener('new-financial-account', handleNewAccount);
        window.addEventListener('refresh-financial-data', handleDataRefresh);

        return () => {
            window.removeEventListener('new-financial-account', handleNewAccount);
            window.removeEventListener('refresh-financial-data', handleDataRefresh);
        };
    }, [selectedAccount, openAccountDetails, fetchAccounts, searchTerm]);

    useEffect(() => {
        if (searchTerm === (urlAccountNum || "")) return;
        const delayDebounceFn = setTimeout(() => {
            fetchAccounts(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchAccounts, urlAccountNum]);

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        try {
            let d;
            if (Array.isArray(dateValue)) {
                d = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
            } else {
                d = new Date(dateValue);
            }
            return d.toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch (e) {
            return '-';
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'ACTIVE': 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
            'SUSPENDED': 'bg-amber-500/10 text-amber-600 border border-amber-200',
            'CLOSED': 'bg-red-500/10 text-red-600 border border-red-200'
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${styles[status] || 'bg-slate-100'}`}>
                {status || 'INCONNU'}
            </span>
        );
    };

    const getInstallmentBadge = (status) => {
        switch(status) {
            case 'PAID': 
            case 'PAYÉ':
                return <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-md font-bold shadow-sm shadow-emerald-200">PAYÉ</span>;
            case 'PARTIAL': 
            case 'PARTIEL':
                return <span className="text-[9px] bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-md font-bold shadow-sm shadow-orange-200">PARTIEL</span>;
            case 'OVERDUE': 
            case 'EN RETARD':
                return <span className="text-[9px] bg-gradient-to-r from-red-500 to-rose-600 text-white px-2 py-1 rounded-md font-bold shadow-sm shadow-red-200">EN RETARD</span>;
            default: 
                return <span className="text-[9px] bg-slate-300 text-white px-2 py-1 rounded-md font-bold">ATTENTE</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] space-y-6 animate-in fade-in duration-500 p-4 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {selectedAccount && (
                        <button onClick={closeAccountDetails} className="w-12 h-12 flex items-center justify-center bg-white shadow-md border border-slate-100 rounded-2xl hover:bg-slate-50 hover:scale-105 transition-all">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight">
                            {selectedAccount ? "Dossier Financier" : "Comptes Financiers"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {selectedAccount ? `Consultation N° ${selectedAccount.accountNumber}` : "Suivi et gestion des dossiers élèves"}
                            </p>
                        </div>
                    </div>
                </div>
                {!selectedAccount && (
                    <div className="relative w-full lg:w-[400px]">
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="Rechercher un élève ou N° de compte..." 
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none shadow-xl shadow-blue-900/5 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                        />
                    </div>
                )}
            </div>

            {!selectedAccount ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <th className="p-6 pl-8">Identité Élève</th>
                                    <th className="p-6">N° de Compte</th>
                                    <th className="p-6 text-center">Date d'Ouverture</th>
                                    <th className="p-6 text-center">Statut</th>
                                    <th className="p-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Chargement des données...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">Aucun compte trouvé.</td></tr>
                                ) : (
                                    accounts.map((acc) => (
                                        <tr key={acc.id} className={`transition-colors group ${acc.isNew ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-blue-50/30'}`}>
                                            <td className="p-6 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200">
                                                        {acc.studentFullName?.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[#0F172A] text-sm uppercase">{acc.studentFullName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">GENRE: <span className="text-blue-500">{acc.gender || 'N/A'}</span></span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{acc.accountNumber}</span>
                                            </td>
                                            <td className="p-6 text-center text-[12px] font-bold text-slate-500">{formatDate(acc.openedAt)}</td>
                                            <td className="p-6 text-center">{getStatusBadge(acc.status)}</td>
                                            <td className="p-6 text-center">
                                                <button onClick={() => openAccountDetails(acc)} className="bg-[#0F172A] text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95">Ouvrir Dossier</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-6 lg:p-10 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Header Dossier */}
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-slate-100 pb-10 mb-10 gap-6">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-200">
                                    {selectedAccount.studentFullName?.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white"></div>
                            </div>
                            <div>
                                <h3 className="text-3xl lg:text-4xl font-black text-[#0F172A] uppercase tracking-tighter">{selectedAccount.studentFullName}</h3>
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <span className="text-xs font-black text-white bg-blue-600 px-3 py-1 rounded-full shadow-sm">N° {selectedAccount.accountNumber}</span>
                                    <span className="text-sm font-bold text-slate-400">/</span>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{selectedAccount.gender}</span>
                                    <span className="text-sm font-bold text-slate-400">/</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ouvert le {formatDate(selectedAccount.openedAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            {getStatusBadge(selectedAccount.status)}
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Historique & Profils Financiers Annuels</h4>
                                <div className="h-px flex-1 bg-slate-100 ml-6"></div>
                            </div>

                            {profileLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-pulse">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronisation...</span>
                                </div>
                            ) : annualProfiles.length === 0 ? (
                                <div className="p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Aucun profil enregistré pour cet élève.</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {annualProfiles.map((profile, idx) => (
                                        <div key={profile.id || idx} className="group relative">
                                            {/* Card Profil */}
                                            <div className="p-8 border border-slate-100 rounded-[3rem] bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 border-t-4 border-t-blue-600">
                                                <div className="flex justify-between items-start mb-10">
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h5 className="font-black text-2xl text-[#0F172A] tracking-tight uppercase">Année Scolaire {profile.academicYear}</h5>
                                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${profile.active ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-600'}`}>
                                                                {profile.active ? 'Session Active' : 'Archive'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-blue-600 mt-2 uppercase tracking-widest bg-blue-50 inline-block px-3 py-1 rounded-lg">Classe: {profile.classroom || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`block text-4xl font-black tracking-tighter ${profile.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {profile.balance?.toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-60">{profile.currency}</span>
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Solde restant à percevoir</span>
                                                    </div>
                                                </div>

                                                {/* Echéancier */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Plan de Paiement</span>
                                                        <div className="h-px w-full bg-slate-100"></div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        {profile.installments?.map((inst, i) => {
                                                            const percent = inst.amount > 0 ? (inst.amountPaid / inst.amount) * 100 : 0;
                                                            return (
                                                                <div key={inst.id || i} className="relative group/card bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0F172A] via-blue-500 via-emerald-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                                                                    
                                                                    <div className="flex justify-between items-start mb-4 mt-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 shadow-sm flex items-center justify-center font-black text-xs text-blue-600 border border-slate-100">
                                                                                {i + 1}
                                                                            </div>
                                                                            <span className="text-xs font-black text-[#0F172A] uppercase truncate max-w-[120px]">{inst.label}</span>
                                                                        </div>
                                                                        {getInstallmentBadge(inst.status)}
                                                                    </div>

                                                                    <div className="flex justify-between gap-3 mb-5">
                                                                        <div className="flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Début</p>
                                                                            <p className="text-[11px] font-bold text-slate-800">{formatDate(inst.startDate)}</p>
                                                                        </div>
                                                                        <div className="flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Limite</p>
                                                                            <p className="text-[11px] font-bold text-slate-800">{formatDate(inst.dueDate)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-end items-end">
                                                                            <div className="text-right">
                                                                                <span className="text-[12px] font-black text-blue-700">{inst.amountPaid?.toLocaleString('fr-FR')} {profile.currency}</span>
                                                                                <span className="text-[11px] font-bold text-slate-300 mx-2">/</span>
                                                                                <span className="text-[12px] font-black text-slate-800">{inst.amount?.toLocaleString('fr-FR')} {profile.currency}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                            <div 
                                                                                className={`h-full transition-all duration-1000 rounded-full bg-gradient-to-r ${percent >= 100 ? 'from-emerald-400 to-emerald-600' : 'from-blue-400 to-blue-600'}`}
                                                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6 pt-10 mt-10 border-t border-slate-50">
                                                    <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frais de Scolarité Total</span>
                                                        </div>
                                                        <span className="font-black text-2xl text-[#0F172A] tracking-tighter">{profile.totalAmountDue?.toLocaleString('fr-FR')} <span className="text-xs">{profile.currency}</span></span>
                                                    </div>
                                                    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Encaissé</span>
                                                        </div>
                                                        <span className="font-black text-2xl text-emerald-600 tracking-tighter">{profile.totalAmountPaid?.toLocaleString('fr-FR')} <span className="text-xs">{profile.currency}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Barre Latérale */}
                        <div className="space-y-8">
                            <div className="sticky top-10">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pl-2">Actions de Gestion</h4>
                                <div className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 space-y-4">
                                    <button 
                                        onClick={() => navigate('/caissier/paiements', { 
                                            state: { 
                                                prefillAccount: selectedAccount.accountNumber, 
                                                prefillName: selectedAccount.studentFullName 
                                            } 
                                        })}
                                        className="group w-full bg-white text-[#0F172A] font-black text-[11px] uppercase py-5 rounded-[1.5rem] hover:bg-emerald-500 hover:text-white transition-all shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        </div>
                                        Nouveau Versement
                                    </button>

                                    <button className="group w-full bg-slate-800/50 border border-slate-700 text-white font-black text-[11px] uppercase py-5 rounded-[1.5rem] hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Relevé de Compte
                                    </button>
                                    
                                    <div className="pt-4 mt-4 border-t border-slate-700/50">
                                        <button 
                                            disabled={!currentActiveProfile}
                                            onClick={() => handleOpenBreakdown(currentActiveProfile)}
                                            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 text-white font-black text-[11px] uppercase py-5 rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                                            Détails Barème
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FeeBreakdownModal 
                isOpen={isBreakdownOpen}
                onClose={() => setIsBreakdownOpen(false)}
                profile={activeProfileForModal}
                studentName={selectedAccount?.studentFullName}
            />
        </div>
    );
};

export default FinancialAccountManager;