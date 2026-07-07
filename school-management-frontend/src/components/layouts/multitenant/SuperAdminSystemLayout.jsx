import React, { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Settings, LogOut, Menu, X, Sun, Moon, ShieldCheck, Calendar, DollarSign, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../App";
import AuthService from "../../../services/auth.service";
import { getSystemLogoUrl } from "../../../services/multitenantService/SuperAdminSystemService";

const SuperAdminSystemLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // État pour réduire/agrandir la sidebar
  const [systemName, setSystemName] = useState("MyAcademia SaaS");
  const [systemLogo, setSystemLogo] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Charger les paramètres depuis le LocalStorage et écouter les changements
  useEffect(() => {
    const loadSettings = () => {
      const storedName = localStorage.getItem('systemAppName');
      const storedLogo = localStorage.getItem('systemLogoPath');
      
      if (storedName) setSystemName(storedName);
      if (storedLogo) setSystemLogo(getSystemLogoUrl(storedLogo));
    };

    loadSettings();

    // Écouteur de l'événement personnalisé pour recharger sans rafraîchir la page
    window.addEventListener('system-settings-updated', loadSettings);

    return () => {
      window.removeEventListener('system-settings-updated', loadSettings);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/super-admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Vue Globale" },
    { path: "/super-admin/ecoles", icon: <Building2 size={20} />, label: "Gestion des Écoles" },
    { path: "/super-admin/abonnements", icon: <Calendar size={20} />, label: "Abonnements & Licences" },
    { path: "/super-admin/finances", icon: <DollarSign size={20} />, label: "Suivi des Recettes" },
    { path: "/super-admin/utilisateurs", icon: <Users size={20} />, label: "Utilisateurs Tenants" },
    { path: "/super-admin/parametres", icon: <Settings size={20} />, label: "Configuration SaaS" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-900 to-emerald-900 dark:from-slate-950 dark:to-emerald-950 text-white shadow-2xl transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        
        {/* Bouton pour réduire/agrandir la Sidebar (Visible uniquement sur Desktop) */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 text-white rounded-full items-center justify-center border border-slate-600 shadow-md hover:bg-slate-700 transition-colors z-50"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header Sidebar */}
        <div className={`h-20 flex items-center px-6 border-b border-white/10 bg-black/20 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
              {systemLogo ? (
                <img src={systemLogo} alt="Logo" className="w-full h-full object-cover bg-white" />
              ) : (
                <ShieldCheck size={22} className="text-white" />
              )}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h2 className="text-lg font-black tracking-tight leading-tight truncate max-w-[150px]">SuperAdmin</h2>
                <p className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase truncate max-w-[150px]">{systemName}</p>
              </div>
            )}
          </div>
          
          {!isSidebarCollapsed && (
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white shrink-0">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.label : ""}
                className={`flex items-center gap-4 py-3.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? "bg-white/10 text-orange-400 border border-orange-500/30 shadow-inner" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Déconnexion" : ""}
            className={`flex items-center w-full py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center px-0 gap-0' : 'justify-start px-4 gap-3'
            }`}
          >
            <span className="shrink-0"><LogOut size={18} /></span>
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 lg:hidden transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Centre de Contrôle Global</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supervision Multi-écoles</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-emerald-500 shadow-sm overflow-hidden">
                {systemLogo ? (
                    <img src={systemLogo} alt="Avatar SA" className="w-full h-full object-cover bg-white" />
                ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">SA</span>
                )}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default SuperAdminSystemLayout;