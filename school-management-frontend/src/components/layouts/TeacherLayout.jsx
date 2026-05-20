import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    BookOpen, 
    CalendarDays, 
    LogOut, 
    FileText, 
    User, 
    LayoutDashboard, 
    GraduationCap, 
    Library, 
    Bell, 
    Menu, 
    X, 
    Sun, 
    Moon, 
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import schoolConfigService from '../../services/admin/schoolConfigService';

const TeacherLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // États pour le responsive et l'interactivité
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'FR');
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    
    // État pour la configuration de l'établissement
    const [schoolConfig, setSchoolConfig] = useState({
        schoolName: "Institution Éducative",
        logoBase64: null,
        slogan: ""
    });

    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Dictionnaire de traduction basique
    const translations = {
        FR: {
            menuTitle: "Menu Pédagogique",
            dashboard: "Tableau de Bord",
            classes: "Mes classes",
            schedule: "Mon horaire",
            library: "Bibliothèque",
            logout: "Déconnexion",
            online: "En ligne",
            academicYear: "Année académique en cours",
            titleDashboard: "Tableau de bord",
            titleClasses: "Espace Classes & Évaluations",
            titleSchedule: "Mon Horaire",
            titleDefault: "Espace Pédagogique"
        },
        EN: {
            menuTitle: "Pedagogical Menu",
            dashboard: "Dashboard",
            classes: "My Classes",
            schedule: "My Schedule",
            library: "Library",
            logout: "Logout",
            online: "Online",
            academicYear: "Current Academic Year",
            titleDashboard: "Dashboard",
            titleClasses: "Classes & Evaluations Space",
            titleSchedule: "My Schedule",
            titleDefault: "Pedagogical Space"
        }
    };

    const currentTexts = translations[lang] || translations.FR;

    // Charger la configuration de l'établissement au montage
    useEffect(() => {
        const fetchSchoolConfig = async () => {
            try {
                const data = await schoolConfigService.getSchoolConfig();
                if (data && data.schoolName) {
                    setSchoolConfig(data);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la configuration de l'école:", error);
            }
        };
        fetchSchoolConfig();
    }, []);

    // Gestion synchrone et persistante du thème
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLangChange = (newLang) => {
        setLang(newLang);
        localStorage.setItem('lang', newLang);
        setIsLangDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/dashboard')) return currentTexts.titleDashboard;
        if (location.pathname.includes('/classes')) return currentTexts.titleClasses;
        if (location.pathname.includes('/horaire')) return currentTexts.titleSchedule;
        return currentTexts.titleDefault;
    };

    // Rendu du drapeau dynamique
    const renderFlag = (currentLang) => {
        if (currentLang === 'FR') {
            return (
                <svg className="w-5 h-3.5 rounded-sm object-cover shadow-sm shrink-0" viewBox="0 0 3 2">
                    <rect width="1" height="2" fill="#002395"/>
                    <rect x="1" width="1" height="2" fill="#ffffff"/>
                    <rect x="2" width="1" height="2" fill="#ED2939"/>
                </svg>
            );
        }
        return (
            <svg className="w-5 h-3.5 rounded-sm object-cover shadow-sm shrink-0" viewBox="0 0 50 30">
                <clipPath id="t">
                    <path d="M0,0 v30 h50 v-30 z"/>
                </clipPath>
                <path d="M0,0 v30 h50 v-30 z" fill="#012169"/>
                <path d="M0,0 L50,30 M0,30 L50,0" stroke="#fff" strokeWidth="6"/>
                <path d="M0,0 L50,30 M0,30 L50,0" stroke="#C8102E" strokeWidth="4"/>
                <path d="M25,0 v30 M0,15 h50" stroke="#fff" strokeWidth="10"/>
                <path d="M25,0 v30 M0,15 h50" stroke="#C8102E" strokeWidth="6"/>
            </svg>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
            
            {/* OVERLAY MOBILE */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR (Desktop & Mobile) */}
            <div className={`
                fixed inset-y-0 left-0 z-50 lg:relative lg:z-20
                ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-20'} 
                ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 overflow-hidden
            `}>
                {/* Effet visuel d'arrière-plan */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>
                
                {/* Bouton de fermeture exclusif pour le Sidebar Mobile */}
                {isMobileOpen && (
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl lg:hidden transition-all"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* Header Sidebar : Logo & Nom de l'institution */}
                <div className="p-6 flex flex-col items-center border-b border-slate-800/50 relative z-10 min-h-[170px] justify-center">
                    {isSidebarOpen || isMobileOpen ? (
                        <>
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-700/50 transform hover:scale-105 transition-transform mb-3">
                                {schoolConfig.logoBase64 ? (
                                    <img 
                                        src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                                        alt="Logo Institution" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <GraduationCap size={36} className="text-blue-400" />
                                )}
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-center text-slate-100 line-clamp-2 px-2">
                                {schoolConfig.schoolName}
                            </h2>
                            {schoolConfig.slogan && (
                                <p className="text-[10px] text-slate-400 text-center italic mt-1 line-clamp-1">
                                    {schoolConfig.slogan}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-md border border-slate-700/50">
                            {schoolConfig.logoBase64 ? (
                                <img 
                                    src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                                    alt="Logo" 
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <GraduationCap size={20} className="text-blue-400" />
                            )}
                        </div>
                    )}
                </div>
                
                {/* Menu de Navigation avec la classe .hover-scrollbar définie dans index.css */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10 hover-scrollbar transition-all duration-300">
                    {(isSidebarOpen || isMobileOpen) && (
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-3">{currentTexts.menuTitle}</p>
                    )}
                    
                    <NavLink to="/enseignant/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold capitalize tracking-wide transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <LayoutDashboard size={20} className="shrink-0" />
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.dashboard}</span>}
                    </NavLink>

                    <NavLink to="/enseignant/classes" className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold capitalize tracking-wide transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <Library size={20} className="shrink-0" />
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.classes}</span>}
                    </NavLink>

                    <NavLink to="/enseignant/horaire" className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold capitalize tracking-wide transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <CalendarDays size={20} className="shrink-0" />
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.schedule}</span>}
                    </NavLink>

                    <NavLink to="/enseignant/cours" className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold capitalize tracking-wide transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <FileText size={20} className="shrink-0" />
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.library}</span>}
                    </NavLink>
                </nav>

                {/* Section Pied de Sidebar */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 space-y-2">
                    {(isSidebarOpen || isMobileOpen) && (
                        <div className="px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                <User size={16} />
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-slate-200 truncate">{user.username || 'Enseignant'}</p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>{currentTexts.online}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black capitalize tracking-wide text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" /> 
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.logout}</span>}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* ZONE DE CAPTURE POUR LE BOUTON TOGGLE DESKTOP (Invisible, se révèle au survol de la bordure gauche) */}
                <div className="hidden lg:block absolute left-0 top-6 w-8 h-32 z-40 group">
                    <div className="w-full h-full flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Le bouton dépasse volontairement vers la gauche (-ml-3) pour mordre sur le bord du Sidebar */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 rounded-full transition-all transform hover:scale-110 flex items-center justify-center -ml-3 z-50"
                            title={isSidebarOpen ? "Masquer le menu" : "Afficher le menu"}
                        >
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>

                {/* HEADER SUPERIEUR */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 transition-colors duration-300">
                    
                    {/* Contrôles d'ouverture/fermeture & Titre */}
                    <div className="flex items-center gap-4">
                        {/* Bouton Mobile Hamburger */}
                        <button 
                            onClick={() => setIsMobileOpen(!isMobileOpen)} 
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{getPageTitle()}</h1>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{currentTexts.academicYear}</p>
                        </div>
                    </div>
                    
                    {/* Actions de droite */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        
                        {/* SÉLECTEUR DE THÈME */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            title={theme === 'light' ? 'Activer le mode Sombre' : 'Activer le mode Clair'}
                        >
                            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
                        </button>

                        {/* SÉLECTEUR DE LANGUE DYNAMIQUE */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                {renderFlag(lang)}
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase hidden md:inline">{lang}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isLangDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button 
                                        onClick={() => handleLangChange('FR')}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
                                    >
                                        {renderFlag('FR')} <span>Français</span>
                                    </button>
                                    <button 
                                        onClick={() => handleLangChange('EN')}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
                                    >
                                        {renderFlag('EN')} <span>English</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

                        {/* NOTIFICATIONS */}
                        <button className="relative p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Bell size={19} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                        </button>
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        
                        {/* INFOS COMPTE EN-TÊTE */}
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                                <User size={15} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{user.username || 'Enseignant'}</span>
                                <span className="text-[9px] font-bold text-slate-400 tracking-wider">Académie v1.0</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ZONE DE CONTENU PRINCIPAL */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-[1600px] mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;