import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { getSystemLogoUrl } from '../../services/multitenantService/SuperAdminSystemService';
import { LogOut, LayoutDashboard, Banknote, Target, FolderOpen, Inbox, TrendingDown, ScrollText, X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const CashierSidebar = ({ closeMobile }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();

    // Identité du Système (au lieu de l'école)
    const [systemInfo, setSystemInfo] = useState({
        appName: 'MyAcademia SaaS',
        logoUrl: null
    });

    const loadSystemInfo = () => {
        const storedAppName = localStorage.getItem('systemAppName');
        const storedLogoPath = localStorage.getItem('systemLogoPath');
        
        setSystemInfo({
            appName: storedAppName || 'MyAcademia SaaS',
            logoUrl: storedLogoPath ? getSystemLogoUrl(storedLogoPath) : null
        });
    };

    useEffect(() => {
        loadSystemInfo();
        window.addEventListener('system-settings-updated', loadSystemInfo);
        return () => window.removeEventListener('system-settings-updated', loadSystemInfo);
    }, []);

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
        if (window.confirm("Voulez-vous vraiment vous déconnecter de la caisse ?")) {
            AuthService.logout();
            navigate('/login');
        }
    };

    return (
        <aside className={`h-full bg-gradient-to-b from-[#0a1128] via-[#0f172a] to-[#081a3a] text-white flex flex-col shadow-2xl border-r border-blue-900/20 relative transition-all duration-300 group/sidebar ${isCollapsed ? 'w-20' : 'w-72'}`}>
            
            {/* BOUTON FERMER (MOBILE UNIQUEMENT) */}
            <button 
                onClick={closeMobile}
                className="lg:hidden absolute right-4 top-6 p-2 text-slate-400 hover:text-orange-500 transition-colors z-50"
            >
                <X size={28} />
            </button>

            {/* BOUTON REDUIRE SIDEBAR (DESKTOP) */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex absolute top-24 -right-3 z-50 w-6 h-10 bg-gradient-to-b from-blue-600 to-[#0a1128] text-white border border-blue-900/40 rounded-md items-center justify-center shadow-lg transition-opacity duration-300 opacity-0 group-hover/sidebar:opacity-100 hover:scale-105"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* HEADER SIDEBAR : IDENTITÉ DU SYSTÈME */}
            <div className={`p-6 border-b border-slate-800/50 flex items-center justify-between shrink-0 h-auto min-h-[5rem] overflow-hidden ${isCollapsed ? 'px-4 justify-center' : ''}`}>
                <Link to="/caissier/dashboard" className="flex items-center gap-3 group w-full">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black text-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-700 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        {systemInfo.logoUrl ? (
                            <img src={systemInfo.logoUrl} alt="System Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <span>{systemInfo.appName.charAt(0)}</span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-col flex-1 overflow-hidden justify-center transition-opacity duration-300 gap-0.5">
                            <h1 className="text-white font-black tracking-tight text-sm uppercase leading-tight whitespace-nowrap overflow-hidden text-ellipsis truncate">
                                {systemInfo.appName}
                            </h1>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <h2 className="text-emerald-400 font-semibold text-[10px] tracking-wider uppercase italic whitespace-nowrap overflow-hidden text-ellipsis truncate">
                                    Espace Finance
                                </h2>
                            </div>
                        </div>
                    )}
                </Link>
            </div>

            {/* NAVIGATION DYNAMIQUE AVEC HOVER-SCROLLBAR */}
            <nav className="flex-1 space-y-2 py-4 overflow-y-auto pr-2 hover-scrollbar">
                <p className={`px-4 mb-4 text-[11px] font-black text-emerald-500/80 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? "text-center px-0 text-[8px]" : ""}`}>
                    {isCollapsed ? "•••" : "Opérations"}
                </p>
                
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : ""}
                        onClick={() => window.innerWidth < 1024 && closeMobile()}
                        className={({ isActive }) => `
                            flex items-center gap-4 py-3 rounded-r-2xl font-black transition-all duration-300 group relative overflow-hidden ml-2
                            ${isCollapsed ? 'justify-center px-0 w-14 rounded-2xl ml-3' : 'px-5'}
                            ${isActive 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-900/40 border-r-4 border-orange-500' 
                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-emerald-400'
                            }
                        `}
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110 shrink-0">
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="text-sm tracking-tight font-black whitespace-nowrap transition-opacity duration-300">
                                {item.label}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* FOOTER DE SESSION & DÉCONNEXION */}
            <div className="mt-auto bg-slate-900/80 border-t border-slate-800/80 shrink-0 flex flex-col items-center justify-center py-4 px-2">
                <div className={`flex flex-col items-center justify-center mb-4 transition-all duration-300 w-full ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto'}`}>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-slate-700 mb-2 ring-2 ring-emerald-500/20 bg-slate-800 flex items-center justify-center text-white text-lg font-black">
                        {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : <ShieldCheck size={20}/>}
                    </div>
                    <span className="text-sm font-black text-white text-center w-full truncate px-2">
                        {currentUser?.username || "Session Active"}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center">
                            Caissier Connecté
                        </span>
                    </div>
                </div>

                <div className="w-full px-2">
                    <button 
                        onClick={handleLogout} 
                        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 rounded-xl hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 font-black uppercase text-[10px] tracking-widest border border-orange-500/20 hover:border-transparent shadow-sm ${isCollapsed ? "px-0 h-10 w-10 mx-auto rounded-xl gap-0" : ""}`}
                        title={isCollapsed ? "Déconnexion" : ""}
                    >
                        <LogOut size={16} className="shrink-0" /> 
                        {!isCollapsed && <span>Déconnexion</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default CashierSidebar;