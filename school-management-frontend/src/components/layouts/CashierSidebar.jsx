import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import AuthService from '../../services/auth.service'; // Nom cohérent
import { LogOut, LayoutDashboard, Banknote, Target, FolderOpen, Inbox, TrendingDown, ScrollText, X, Menu } from 'lucide-react';

const CashierSidebar = ({ closeMobile }) => {
    const { schoolConfig, loading } = useSchool();
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();

    const menuItems = [
        { path: '/caissier/dashboard', icon: <LayoutDashboard size={22}/>, label: 'Tableau de Bord' },
        { path: '/caissier/paiements', icon: <Banknote size={22}/>, label: 'Paiements' },
        { path: '/caissier/recouvrement', icon: <Target size={22}/>, label: 'Recouvrement' },
        { path: '/caissier/comptes', icon: <FolderOpen size={22}/>, label: 'Gestion Comptes' },
        { path: '/caissier/entrees-caisse', icon: <Inbox size={22}/>, label: 'Entrées Caisse' },
        { path: '/caissier/depenses', icon: <TrendingDown size={22}/>, label: 'Dépenses' },
        { path: '/caissier/historique', icon: <ScrollText size={22}/>, label: 'Historique' },
    ];

    const handleLogout = () => {
        if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
            AuthService.logout();
            navigate('/login');
        }
    };

    return (
        <aside className="h-full w-72 bg-gradient-to-b from-[#0a1128] via-[#0f172a] to-[#081a3a] text-white flex flex-col p-6 shadow-2xl border-r border-blue-900/20 relative">
            
            {/* BOUTON FERMER (MOBILE UNIQUEMENT) */}
            <button 
                onClick={closeMobile}
                className="lg:hidden absolute right-4 top-6 p-2 text-slate-400 hover:text-orange-500 transition-colors"
            >
                <X size={28} />
            </button>

            {/* LOGO SECTION */}
            <div className="mb-10 px-2">
                <Link to="/caissier/dashboard" className="flex items-center gap-3 group">
                    <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        {schoolConfig.logoBase64 ? (
                            <img 
                                src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                                alt="Logo" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <span>{schoolConfig.schoolName ? schoolConfig.schoolName.charAt(0) : "S"}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        {/* Suppression de 'truncate' pour permettre le retour à la ligne automatique */}
                        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-black tracking-tighter text-sm uppercase italic leading-tight whitespace-normal">
                            {loading ? "Chargement..." : schoolConfig.schoolName || "Institution"}
                        </h2>
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mt-1">Espace Finance</span>
                    </div>
                </Link>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mt-6"></div>
            </div>

            {/* NAVIGATION DYNAMIQUE */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none">
                <p className="px-4 mb-4 text-[11px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">
                    Opérations de Caisse
                </p>
                
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && closeMobile()}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-5 py-3 rounded-2xl font-black transition-all duration-300 group relative overflow-hidden
                            ${isActive 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-900/40 border-r-4 border-orange-500' 
                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-emerald-400'
                            }
                        `}
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                        </span>
                        <span className="text-sm tracking-tight font-black">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* FOOTER DE SESSION & DÉCONNEXION */}
            <div className="mt-auto pt-6 space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-800/60 to-blue-900/30 rounded-3xl border border-blue-900/40 backdrop-blur-md shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Caissier Connecté</p>
                            <p className="text-sm font-black text-emerald-400 truncate mt-1">
                                {currentUser?.username || "Session Active"}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all duration-300 group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/>
                        <span className="text-xs font-black uppercase tracking-wider">Déconnexion</span>
                    </button>
                </div>

                <div className="text-center pb-2">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
                        CaissePro v1.0
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default CashierSidebar;