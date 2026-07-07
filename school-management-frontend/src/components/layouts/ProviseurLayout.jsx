import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import AuthService from '../../services/auth.service';
import { ThemeContext } from '../../App'; 
import { 
  LayoutDashboard, Users, BookOpen, UserCheck, Calendar, 
  Fingerprint, LogOut, Menu, X, 
  ChevronLeft, ChevronRight, Sun, Moon, Inbox, FileText,
  ShieldAlert
} from 'lucide-react';
// Import du service de notification WebSocket
import ProviseurNotificationService from '../../services/pedagogieService/ProviseurNotificationService'; 
// IMPORT DU NOUVEAU DROPDOWN DE NOTIFICATION EN TEMPS RÉEL
import NotificationDropdown from './NotificationDropdown';
// Importation du service d'URL de logo système
import { getSystemLogoUrl } from '../../services/multitenantService/SuperAdminSystemService'; 

const ProviseurLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // LOGIQUE DE THÈME CORRIGÉE ET SÉCURISÉE
  const themeContext = useContext(ThemeContext);
  const contextTheme = themeContext?.theme;
  const toggleContextTheme = themeContext?.toggleTheme;

  // État de secours au cas où le ThemeContext n'est pas défini
  const [localTheme, setLocalTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const isDarkMode = contextTheme ? contextTheme === 'dark' : localTheme === 'dark';
  const currentTheme = contextTheme || localTheme;

  // EFFET CRUCIAL : Force Tailwind CSS à appliquer les classes dark: sur tout le document
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // INITIALISATION DU SERVICE DE NOTIFICATIONS SONORES (SÉCURISÉ)
  useEffect(() => {
    const initTimer = setTimeout(() => {
        ProviseurNotificationService.startListening();
    }, 1000);

    return () => {
        clearTimeout(initTimer);
        ProviseurNotificationService.stopListening();
    };
  }, []);

  const handleToggleTheme = () => {
    if (toggleContextTheme) {
      toggleContextTheme();
    } else {
      setLocalTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }
  };

  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'fr';
    }
    return 'fr';
  });

  // IDENTITÉ DU SYSTÈME
  const [systemInfo, setSystemInfo] = useState({
    appName: 'MYACADEMIA ERP',
    logoUrl: null
  });

  const loadSystemInfo = () => {
    const storedAppName = localStorage.getItem('systemAppName');
    const storedLogoPath = localStorage.getItem('systemLogoPath');
    
    setSystemInfo({
      appName: storedAppName || 'MYACADEMIA ERP',
      logoUrl: storedLogoPath ? getSystemLogoUrl(storedLogoPath) : null
    });
  };

  useEffect(() => {
    loadSystemInfo();
    const handleSystemUpdate = () => loadSystemInfo();
    window.addEventListener('system-settings-updated', handleSystemUpdate);

    return () => {
      window.removeEventListener('system-settings-updated', handleSystemUpdate);
    };
  }, []);

  const { schoolConfig, loading } = useSchool();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const triggerLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    AuthService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/proviseur/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de Bord' },
    { path: '/proviseur/enseignants', icon: <Users size={20} />, label: 'Enseignants' },
    { path: '/proviseur/unites-cours', icon: <BookOpen size={20} />, label: 'Unités & Cours' },
    { path: '/proviseur/affectations', icon: <UserCheck size={20} />, label: 'Affectations' },
    { path: '/proviseur/horaires', icon: <Calendar size={20} />, label: 'Horaires' },
    { path: '/proviseur/presences', icon: <Fingerprint size={20} />, label: 'Présences/Pointage' },
    { path: '/proviseur/reception-fiches', icon: <Inbox size={20} />, label: 'Réception Fiches' },
    { path: '/proviseur/bulletin', icon: <FileText size={20} />, label: 'Bulletins' },
  ];

  const getInitials = (name) => {
    if (!name) return "PR";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-full transform group
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-24' : 'lg:w-72'} 
        w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl z-[70]
      `}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-blue-600 rounded-full 
            items-center justify-center border-2 border-[#0F172A] text-white 
            hover:bg-blue-500 transition-all duration-300 z-[80] shadow-lg
            opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0
          `}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* HEADER SIDEBAR - IDENTITÉ DU SYSTÈME */}
        <div className={`p-4 border-b border-slate-800/50 flex items-center justify-between shrink-0 h-auto min-h-[5rem] overflow-hidden mt-4 lg:mt-0 ${isCollapsed ? 'p-4 justify-center' : 'p-6'}`}>
          <div className="flex items-center gap-3 group w-full">
            <div className={`shrink-0 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-700 transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              {systemInfo.logoUrl ? (
                <img 
                  src={systemInfo.logoUrl} 
                  alt="System Logo" 
                  className="w-full h-full object-contain p-1" 
                />
              ) : (
                <span className="text-xl font-black">{systemInfo.appName.charAt(0)}</span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden justify-center transition-opacity duration-300">
                <h1 className="text-white font-black tracking-tight text-lg uppercase leading-tight text-left">
                  {systemInfo.appName.split(/(?=\sERP)/i).map((part, index) => (
                    <span key={index} className="block">{part.trim()}</span>
                  ))}
                </h1>
              </div>
            )}
          </div>

          <button className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto transition-all duration-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          {!isCollapsed && (
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-4 mb-4 transition-opacity duration-300 opacity-100">
              Menu
            </p>
          )}
          
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group/nav relative
                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                ${isCollapsed ? 'lg:justify-center' : 'lg:justify-start'}
              `}
            >
              <span className={`transition-colors shrink-0`}>{item.icon}</span>
              {!isCollapsed && (
                <span className="font-semibold text-sm tracking-wide transition-all duration-300 whitespace-nowrap opacity-100">
                  {item.label}
                </span>
              )}
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-all invisible lg:visible translate-x-[-10px] group-hover/nav:translate-x-0 z-[100] shadow-xl whitespace-nowrap border border-white/10">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER SIDEBAR - PROFIL & DÉCONNEXION */}
        <div className="p-4 border-t border-slate-800/50 flex flex-col gap-3">
          <div className={`flex items-center gap-3 mb-1 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold shadow-lg border border-white/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white`}>
              {getInitials(currentUser?.username)}
            </div>
            {!isCollapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold uppercase text-slate-100 truncate">{currentUser?.username || "Proviseur"}</p>
                <p className="text-[11px] text-emerald-500 font-bold tracking-wider truncate">PROVISEUR PRINCIPAL</p>
              </div>
            )}
          </div>

          <button 
            onClick={triggerLogoutConfirmation}
            title={isCollapsed ? "Déconnexion" : ""}
            className={`flex items-center text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200 w-full ${isCollapsed ? 'justify-center p-3' : 'justify-start gap-3 px-4 py-3'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-10 shrink-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg lg:hidden transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-slate-800 dark:text-white font-black text-sm lg:text-lg transition-colors">
              Espace Gestionnaire
            </h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleToggleTheme}
                className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-200 dark:border-slate-600"
                title="Basculer le thème"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="relative flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors px-3 py-2 cursor-pointer">
                <span className="text-base mr-2 flex-shrink-0 select-none" role="img" aria-label="drapeau">
                  {language === 'fr' ? '🇫🇷' : '🇺🇸'}
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5 w-full transition-colors"
                >
                  <option value="fr" className="dark:bg-slate-800">Français</option>
                  <option value="en" className="dark:bg-slate-800">English</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={14} className="text-slate-400 rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <NotificationDropdown />
              
              {/* IDENTITÉ DE L'ÉCOLE DANS LE HEADER */}
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 transition-colors">
                {schoolConfig?.logoBase64 && (
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-white dark:bg-slate-800 flex items-center justify-center">
                    <img 
                      src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                      alt="School Logo" 
                      className="w-full h-full object-contain p-0.5" 
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-black uppercase tracking-tight truncate max-w-[150px] lg:max-w-[200px] text-slate-800 dark:text-slate-100 transition-colors">
                    {loading ? "Chargement..." : schoolConfig?.schoolName}
                  </span>
                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">
                    Espace Proviseur
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* BOÎTE DE DIALOGUE DE SÉCURITÉ POUR LA DÉCONNEXION */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLogoutModal(false)}
          />
          
          <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border border-slate-700/30 ${
            isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Confirmation de sécurité
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Êtes-vous sûr de vouloir vous déconnecter de votre espace proviseur ? Toutes les sessions actives non enregistrées prendront fin.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-900/20 transition-all duration-200"
              >
                Confirmer la déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviseurLayout;