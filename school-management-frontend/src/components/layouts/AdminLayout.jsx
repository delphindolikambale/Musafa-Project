import React, { useState, useEffect, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import AuthService from "../../services/auth.service";
import { ThemeContext, LanguageContext } from "../../App"; // Importation des contextes
import { 
  LayoutDashboard, CalendarDays, Layers, GitMerge, School, 
  Users, GraduationCap, Library, Clock, Wallet, 
  ShieldCheck, Settings, LogOut, Bell, Menu, X, Sun, Moon, ChevronDown 
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
    courses: "Unités & Cours",
    schedules: "Horaires",
    administration: "Administration",
    finances: "Finances & Frais",
    roles: "Rôles & Accès",
    settings: "Paramètres App",
    logout: "Déconnexion",
    adminTitle: "Administrateur",
    adminRole: "Admin Principal"
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
    courses: "Units & Courses",
    schedules: "Schedules",
    administration: "Administration",
    finances: "Finances & Fees",
    roles: "Roles & Access",
    settings: "App Settings",
    logout: "Logout",
    adminTitle: "Administrator",
    adminRole: "Main Admin"
  }
};

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Fonction utilitaire pour récupérer la traduction
  const t = (key) => translations[language]?.[key] || key;

  // --- ADAPTATION : Utilisation du vrai utilisateur ---
  const [adminUser, setAdminUser] = useState({
    name: "Administrateur",
    role: "Admin Principal",
    initials: "AD",
    profilePic: null 
  });

  useEffect(() => {
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
  }, []); 

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => `
    flex items-center px-6 py-2.5 transition-all duration-300 group relative overflow-hidden
    ${isActive(path) 
      ? "text-white bg-gradient-to-r from-blue-600/20 to-transparent border-r-4 border-orange-500 font-bold" 
      : "text-slate-400 hover:bg-slate-800/40 hover:text-emerald-400"}
  `;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-emerald-500 to-orange-500 z-50"></div>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-[#0a1128] to-[#081a3a] text-slate-300 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl border-r border-blue-900/30
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 group w-full">
            <div className={`shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-white/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
              {schoolConfig?.logoBase64 ? (
                <img 
                  src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                  alt="Logo" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{schoolConfig?.schoolName ? schoolConfig.schoolName.charAt(0) : "S"}</span>
              )}
            </div>
            <h2 className="flex-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-black tracking-tighter text-sm uppercase italic leading-tight">
              {loading ? "..." : schoolConfig?.schoolName}
            </h2>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-orange-500 transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-hidden hover:overflow-y-auto py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="px-6 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{t('mainMenu')}</div>
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><LayoutDashboard size={20} /></span> {t('dashboard')}
          </Link>

          <div className="px-6 mt-8 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{t('structureLevels')}</div>
          <Link to="/annee-scolaire" className={linkStyle("/annee-scolaire")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><CalendarDays size={20} /></span> {t('schoolYear')}
          </Link>
          <Link to="/niveaux" className={linkStyle("/niveaux")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Layers size={20} /></span> {t('levelConfig')}
          </Link>
          <Link to="/sections-options" className={linkStyle("/sections-options")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><GitMerge size={20} /></span> {t('sections')}
          </Link>
          <Link to="/classes" className={linkStyle("/classes")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><School size={20} /></span> {t('classes')}
          </Link>

          <div className="px-6 mt-8 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{t('actorsPedagogy')}</div>
          <Link to="/eleves" className={linkStyle("/eleves")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Users size={20} /></span> {t('studentManagement')}
          </Link>
          <Link to="/enseignants" className={linkStyle("/enseignants")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><GraduationCap size={20} /></span> {t('teachers')}
          </Link>
          <Link to="/cours" className={linkStyle("/cours")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Library size={20} /></span> {t('courses')}
          </Link>
          <Link to="/horaires" className={linkStyle("/horaires")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Clock size={20} /></span> {t('schedules')}
          </Link>

          <div className="px-6 mt-8 mb-2 text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{t('administration')}</div>
          <Link to="/finances" className={linkStyle("/finances")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Wallet size={20} /></span> {t('finances')}
          </Link>
          
          <Link to="/roles" className={linkStyle("/roles")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><ShieldCheck size={20} /></span> {t('roles')}
          </Link>
          
          <Link to="/parametres" className={linkStyle("/parametres")}>
            <span className="w-8 flex group-hover:scale-110 transition-transform duration-300"><Settings size={20} /></span> {t('settings')}
          </Link>
        </nav>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800/50 shrink-0">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 rounded-xl hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 font-black uppercase text-[10px] tracking-widest shadow-sm">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-40 mt-1 transition-colors duration-300">
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
          
          <div className="flex items-center gap-2 lg:gap-6">
            
            {/* --- BOUTON : Langue avec Drapeaux via le Contexte --- */}
            <button onClick={toggleLanguage} className="hidden sm:flex items-center gap-2 p-2 text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-300 font-bold text-xs shadow-sm">
                <img 
                  src={language === 'FR' ? "https://flagcdn.com/w40/fr.png" : "https://flagcdn.com/w40/gb.png"} 
                  alt={language}
                  className="w-5 h-5 rounded-full object-cover shadow-sm border border-slate-300 dark:border-slate-600"
                />
                <span className="w-6 text-center">{language}</span>
                <ChevronDown size={14} className="opacity-50" />
            </button>

            {/* --- BOUTON : Thème --- */}
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-300">
                {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* Notification */}
            <button className="relative p-2.5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group">
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
            </button>

            <div className="flex items-center gap-4 border-l pl-4 lg:pl-6 border-slate-200 dark:border-slate-700 transition-colors duration-300">
               <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {adminUser.name === "Administrateur" ? t('adminTitle') : adminUser.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                    {adminUser.role === "Admin Principal" ? t('adminRole') : adminUser.role}
                  </span>
               </div>
               
               <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform duration-300 ring-2 ring-emerald-500/20">
                  {adminUser.profilePic ? (
                    <img src={adminUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-blue-500 to-emerald-400 flex items-center justify-center text-white font-black text-sm md:text-lg">
                      {adminUser.initials}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          <footer className="text-center text-slate-400 dark:text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] py-8 md:py-10 mt-6 md:mt-10 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
            © 2026 {schoolConfig?.schoolName || "System"} • Powered by Doli Delphin
          </footer>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;