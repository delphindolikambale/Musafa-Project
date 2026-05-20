import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import AuthService from '../../services/auth.service';
import { ThemeContext } from '../../App'; // Import du contexte global
import { 
  LayoutDashboard, Users, BookOpen, UserCheck, Calendar, 
  Fingerprint, LogOut, Menu, X, Bell, 
  ChevronLeft, ChevronRight, Sun, Moon
} from 'lucide-react';

const ProviseurLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  const handleToggleTheme = () => {
    if (toggleContextTheme) {
      toggleContextTheme();
    } else {
      // Fallback si le contexte global échoue
      setLocalTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }
  };

  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'fr';
    }
    return 'fr';
  });

  const { schoolConfig, loading } = useSchool();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      AuthService.logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/proviseur/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de Bord' },
    { path: '/proviseur/enseignants', icon: <Users size={20} />, label: 'Enseignants' },
    { path: '/proviseur/unites-cours', icon: <BookOpen size={20} />, label: 'Unités & Cours' },
    { path: '/proviseur/affectations', icon: <UserCheck size={20} />, label: 'Affectations' },
    { path: '/proviseur/horaires', icon: <Calendar size={20} />, label: 'Horaires' },
    { path: '/proviseur/presences', icon: <Fingerprint size={20} />, label: 'Présences/Pointage' },
  ];

  const getInitials = (name) => {
    if (!name) return "AD";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300" 
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

        <div className="p-6 flex items-center justify-between border-b border-white/5 h-20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
              {schoolConfig?.logoBase64 ? (
                <img 
                  src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                  alt="Logo" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="font-bold text-xl text-blue-400">
                  {schoolConfig?.schoolName ? schoolConfig.schoolName.charAt(0) : "M"}
                </span>
              )}
            </div>
            
            <div className={`min-w-0 flex-1 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
              <h1 className="font-bold text-sm tracking-tight leading-tight uppercase truncate">
                {loading ? "Chargement..." : (schoolConfig?.schoolName || "C.S. MUSAFA")}
              </h1>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest mt-1 uppercase whitespace-nowrap">Direction Études</p>
            </div>
          </div>

          <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto transition-all duration-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          <p className={`text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-4 mb-4 transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
            {isCollapsed ? "" : "Menu"}
          </p>
          
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
              <span className={`font-semibold text-sm tracking-wide transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-all invisible lg:visible translate-x-[-10px] group-hover/nav:translate-x-0 z-[100] shadow-xl whitespace-nowrap border border-white/10">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold text-sm ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-10 shrink-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-slate-800 dark:text-white font-black text-sm lg:text-lg transition-colors">
              {isCollapsed ? (schoolConfig?.schoolName || "Espace Études") : "Espace Gestionnaire"}
            </h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleToggleTheme} // Appel de la fonction corrigée
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
              <div className="relative p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors group">
                <Bell size={22} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-700 transition-colors">
                <div className="text-right hidden md:block leading-none">
                  <p className="text-[13px] font-black text-slate-800 dark:text-white mb-0.5 transition-colors">
                    {currentUser?.username || "Proviseur"}
                  </p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Proviseur Principal</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg border-2 border-white dark:border-slate-800 text-sm transform transition-transform hover:scale-105 cursor-pointer">
                  {getInitials(currentUser?.username)}
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
    </div>
  );
};

export default ProviseurLayout;