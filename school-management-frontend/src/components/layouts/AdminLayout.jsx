import React, { useState, useEffect, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import AuthService from "../../services/auth.service";
import { ThemeContext, LanguageContext } from "../../App"; // Importation des contextes
// Assurez-vous que le chemin est correct selon votre structure
import { getSystemLogoUrl } from "../../services/multitenantService/SuperAdminSystemService"; 
import { 
  LayoutDashboard, CalendarDays, Layers, GitMerge, School, 
  Users, GraduationCap, Library, Clock, Wallet, 
  ShieldCheck, Settings, LogOut, Bell, Menu, X, Sun, Moon, ChevronDown,
  ChevronLeft, ChevronRight
} from "lucide-react";

// --- DICTIONNAIRE DE TRADUCTIONS DU LAYOUT ---
const translations = {
  FR: {
    mainMenu: "Menu Principal",
    dashboard: "Tableau de Bord",
    structureLevels: "Structure & Niveaux",
    schoolYear: "Année Scolaire",
    levelConfig: "Configuration Niveaux",
    sections: "Sections & Options",
    classes: "Classes & Salles",
    actorsPedagogy: "Acteurs & Pédagogie",
    studentManagement: "Gestion Élèves",
    teachers: "Enseignants",
    administration: "Administration",
    finances: "Finances & Frais",
    roles: "Rôles & Accès",
    settings: "Paramètres App",
    logout: "Déconnexion",
    adminTitle: "Administrateur",
    adminRole: "Admin Principal",
    confirmLogoutTitle: "Confirmation de sécurité",
    confirmLogoutDesc: "Êtes-vous sûr de vouloir vous déconnecter de votre espace d'administration ?",
    cancel: "Annuler",
    confirm: "Se déconnecter"
  },
  EN: {
    mainMenu: "Main Menu",
    dashboard: "Dashboard",
    structureLevels: "Structure & Levels",
    schoolYear: "School Year",
    levelConfig: "Level Configuration",
    sections: "Sections & Options",
    classes: "Classes & Rooms",
    actorsPedagogy: "Actors & Pedagogy",
    studentManagement: "Student Management",
    teachers: "Teachers",
    administration: "Administration",
    finances: "Finances & Fees",
    roles: "Roles & Access",
    settings: "App Settings",
    logout: "Logout",
    adminTitle: "Administrator",
    adminRole: "Main Admin",
    confirmLogoutTitle: "Security Confirmation",
    confirmLogoutDesc: "Are you sure you want to log out from your administration dashboard?",
    cancel: "Cancel",
    confirm: "Logout"
  }
};

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { schoolConfig, loading } = useSchool();
  
  // Utilisation des contextes (Thème & Langue)
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});

  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || 'FR';
  const toggleLanguage = languageContext?.toggleLanguage || (() => {});

  // --- NOUVEAU : Identité du système ---
  const [systemInfo, setSystemInfo] = useState({
      appName: 'MyAcademia SaaS',
      logoUrl: null
  });

  // Fonction utilitaire pour récupérer la traduction
  const t = (key) => translations[language]?.[key] || key;

  // --- ADAPTATION : Utilisation du vrai utilisateur ---
  const [adminUser, setAdminUser] = useState({
    name: "Administrateur",
    role: "Admin Principal",
    initials: "AD",
    profilePic: null 
  });

  // Charger les infos du système depuis le LocalStorage
  const loadSystemInfo = () => {
      const storedAppName = localStorage.getItem('systemAppName');
      const storedLogoPath = localStorage.getItem('systemLogoPath');
      
      setSystemInfo({
          appName: storedAppName || 'MyAcademia SaaS',
          logoUrl: storedLogoPath ? getSystemLogoUrl(storedLogoPath) : null
      });
  };

  useEffect(() => {
    // Infos utilisateur
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const roleArray = Array.isArray(currentUser.roles) ? currentUser.roles : (currentUser.role ? [currentUser.role] : []);
      const displayRole = roleArray.length > 0 && roleArray[0] ? roleArray[0].replace('ROLE_', '') : 'ADMIN';
      
      setAdminUser({
        name: currentUser.username || "Administrateur",
        role: displayRole,
        initials: (currentUser.username ? currentUser.username.substring(0, 2) : "AD").toUpperCase(),
        profilePic: null
      });
    }

    // Charger l'identité du système au montage
    loadSystemInfo();

    // Écouter les mises à jour (déclenchées depuis Parametres.jsx)
    const handleSystemUpdate = () => loadSystemInfo();
    window.addEventListener('system-settings-updated', handleSystemUpdate);

    return () => {
        window.removeEventListener('system-settings-updated', handleSystemUpdate);
    };
  }, []); 

  const handleLogout = () => {
    setShowLogoutModal(false);
    AuthService.logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => `
    flex items-center px-6 py-2.5 transition-all duration-300 group relative overflow-hidden h-11
    ${isActive(path) 
      ? "text-white bg-gradient-to-r from-blue-600/20 to-transparent border-r-4 border-orange-500 font-bold" 
      : "text-slate-400 hover:bg-slate-800/40 hover:text-emerald-400"}
    ${isCollapsed ? "justify-center px-0" : ""}
  `;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-emerald-500 to-orange-500 z-50"></div>

      {/* SIDEBAR CONTAINER WITH REVEAL-ON-HOVER TOGGLE BUTTON */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-900 via-[#0a1128] to-[#081a3a] text-slate-300 transform transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl border-r border-blue-900/30 group/sidebar
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-72"}
      `}>
        
        {/* INVISIBLE TOGGLE BUTTON (Visible only on hover near the edge) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-24 -right-3 z-50 w-6 h-10 bg-gradient-to-b from-blue-600 to-[#0a1128] text-white border border-blue-900/40 rounded-md items-center justify-center shadow-lg transition-opacity duration-300 opacity-0 group-hover/sidebar:opacity-100 hover:scale-105"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* HEADER SIDEBAR : IDENTITÉ DU SYSTÈME UNIQUEMENT */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between shrink-0 h-auto min-h-[5rem] overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-3 group w-full">
            {/* Logo du SYSTÈME */}
            <div className={`shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black text-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-700 group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
              {systemInfo.logoUrl ? (
                <img 
                  src={systemInfo.logoUrl} 
                  alt="System Logo" 
                  className="w-full h-full object-contain p-1" 
                />
              ) : (
                <span>{systemInfo.appName.charAt(0)}</span>
              )}
            </div>

            {/* Nom : Système en gras avec bonne taille et retour à la ligne pour ERP */}
            {!isCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden justify-center transition-opacity duration-300">
                <h1 className="text-white font-black tracking-tight text-lg uppercase leading-tight">
                  {systemInfo.appName.split(/(?=\sERP)/i).map((part, index) => (
                    <span key={index} className="block">{part.trim()}</span>
                  ))}
                </h1>
              </div>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-orange-500 transition-colors shrink-0 absolute right-4 top-6">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-hidden hover:overflow-y-auto py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {/* SECTION 1 */}
          <div className={`px-6 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? "text-center px-0 text-[8px]" : ""}`}>
            {isCollapsed ? "•••" : t('mainMenu')}
          </div>
          <Link to="/dashboard" className={linkStyle("/dashboard")} title={isCollapsed ? t('dashboard') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><LayoutDashboard size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('dashboard')}</span>}
          </Link>

          {/* SECTION 2 */}
          <div className={`px-6 mt-6 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? "text-center px-0 text-[8px]" : ""}`}>
            {isCollapsed ? "•••" : t('structureLevels')}
          </div>
          <Link to="/annee-scolaire" className={linkStyle("/annee-scolaire")} title={isCollapsed ? t('schoolYear') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><CalendarDays size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('schoolYear')}</span>}
          </Link>
          <Link to="/niveaux" className={linkStyle("/niveaux")} title={isCollapsed ? t('levelConfig') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><Layers size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('levelConfig')}</span>}
          </Link>
          <Link to="/sections-options" className={linkStyle("/sections-options")} title={isCollapsed ? t('sections') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><GitMerge size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('sections')}</span>}
          </Link>
          <Link to="/classes" className={linkStyle("/classes")} title={isCollapsed ? t('classes') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><School size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('classes')}</span>}
          </Link>

          {/* SECTION 3 */}
          <div className={`px-6 mt-6 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? "text-center px-0 text-[8px]" : ""}`}>
            {isCollapsed ? "•••" : t('actorsPedagogy')}
          </div>
          <Link to="/eleves" className={linkStyle("/eleves")} title={isCollapsed ? t('studentManagement') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><Users size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('studentManagement')}</span>}
          </Link>
          <Link to="/enseignants" className={linkStyle("/enseignants")} title={isCollapsed ? t('teachers') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><GraduationCap size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('teachers')}</span>}
          </Link>

          {/* SECTION 4 */}
          <div className={`px-6 mt-6 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isCollapsed ? "text-center px-0 text-[8px]" : ""}`}>
            {isCollapsed ? "•••" : t('administration')}
          </div>
          <Link to="/finances" className={linkStyle("/finances")} title={isCollapsed ? t('finances') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><Wallet size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('finances')}</span>}
          </Link>
          <Link to="/roles" className={linkStyle("/roles")} title={isCollapsed ? t('roles') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><ShieldCheck size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('roles')}</span>}
          </Link>
          <Link to="/parametres" className={linkStyle("/parametres")} title={isCollapsed ? t('settings') : ""}>
            <span className="w-8 flex justify-center group-hover:scale-110 transition-transform duration-300 shrink-0"><Settings size={20} /></span> 
            {!isCollapsed && <span className="transition-opacity duration-300">{t('settings')}</span>}
          </Link>
        </nav>

        {/* FOOTER SIDEBAR : UTILISATEUR ET DÉCONNEXION */}
        <div className="bg-slate-900/80 border-t border-slate-800/80 shrink-0 flex flex-col justify-center py-4 px-4">
            
          {/* Profil Admin aligné à gauche avec icône diminuée */}
          <div className={`flex flex-row items-center justify-start gap-3 mb-4 transition-all duration-300 w-full ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto'}`}>
              <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-md border-2 border-slate-700 ring-2 ring-emerald-500/20 bg-slate-800">
                  {adminUser.profilePic ? (
                      <img src={adminUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-blue-500 to-emerald-400 flex items-center justify-center text-white font-black text-sm">
                          {adminUser.initials}
                      </div>
                  )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black text-white text-left w-full truncate">
                    {adminUser.name === "Administrateur" ? t('adminTitle') : adminUser.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-left truncate">
                    {adminUser.role === "Admin Principal" ? t('adminRole') : adminUser.role}
                </span>
              </div>
          </div>

          {/* Bouton Déconnexion */}
          <div className="w-full">
              <button 
                onClick={() => setShowLogoutModal(true)} 
                className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 rounded-xl hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 font-black uppercase text-[10px] tracking-widest border border-orange-500/20 hover:border-transparent shadow-sm ${isCollapsed ? "px-0 h-10 w-10 mx-auto rounded-xl gap-0" : ""}`}
                title={isCollapsed ? t('logout') : ""}
              >
                <LogOut size={16} className="shrink-0" /> 
                {!isCollapsed && <span>{t('logout')}</span>}
              </button>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-40 mt-1 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-900 dark:from-white dark:to-slate-300 uppercase tracking-tight">
              {isActive("/dashboard") ? t('dashboard') : 
               isActive("/roles") ? t('roles') :
               isActive("/sections-options") ? t('sections') :
               location.pathname.split("/").pop().replace("-", " ")}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            {/* BOUTON LANGUE */}
            <button onClick={toggleLanguage} className="hidden sm:flex items-center gap-2 p-2 text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-300 font-bold text-xs shadow-sm">
                <img 
                  src={language === 'FR' ? "https://flagcdn.com/w40/fr.png" : "https://flagcdn.com/w40/gb.png"} 
                  alt={language}
                  className="w-5 h-5 rounded-full object-cover shadow-sm border border-slate-300 dark:border-slate-600"
                />
                <span className="w-6 text-center">{language}</span>
                <ChevronDown size={14} className="opacity-50" />
            </button>

            {/* BOUTON THÈME */}
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-300">
                {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* NOTIFICATION */}
            <button className="relative p-2.5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group">
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
            </button>
            
            {/* IDENTITÉ DE L'ÉCOLE (Placée après les notifications) */}
            <div className="hidden md:flex items-center gap-3 pl-4 ml-1 border-l border-slate-200 dark:border-slate-700">
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
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate max-w-[150px] lg:max-w-[200px]">
                        {loading ? "Chargement..." : (schoolConfig?.schoolName || "Institution")}
                    </span>
                </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          <footer className="text-center text-slate-400 dark:text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] py-8 md:py-10 mt-6 md:mt-10 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
            © 2026 {schoolConfig?.schoolName || "System"} • Powered by Doli Delphin
          </footer>
        </div>
      </main>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SECURITY LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800/80 relative z-10 transform scale-100 transition-all">
            <div className="flex items-center gap-4 text-orange-500 mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {t('confirmLogoutTitle')}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {t('confirmLogoutDesc')}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl transition-all shadow-md shadow-orange-500/10"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;