import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import schoolConfigService from '../../services/admin/schoolConfigService';
import titulaireService from '../../services/pedagogieService/titulaireService';
import { getSystemLogoUrl } from "../../services/multitenantService/SuperAdminSystemService";
import { websocketService } from '../../services/websocketService';

const TeacherLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // États pour le responsive et l'interactivité
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'FR');
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    
    // État pour savoir si l'enseignant est titulaire
    const [isTitulaire, setIsTitulaire] = useState(false);
    
    // État pour la cloche de notification des bulletins
    const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
    const [notificationData, setNotificationData] = useState(null);

    // État pour la boîte de dialogue de déconnexion
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // État pour la configuration de l'établissement
    const [schoolConfig, setSchoolConfig] = useState({
        schoolName: "Institution Éducative",
        logoBase64: null,
        slogan: ""
    });

    // État pour la configuration globale du Système
    const [systemConfig, setSystemConfig] = useState({
        applicationName: "MyAcademia SaaS",
        logoPath: null
    });

    // Mémorisation de l'utilisateur stocké
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) {
            console.error("Erreur lors de la lecture de l'utilisateur en localStorage:", e);
            return {};
        }
    }, []);

    // Consolidation robuste de l'identifiant de l'enseignant / titulaire
    const currentTeacherId = useMemo(() => {
        return user.teacherId || user.titulaireId || user.userId || user.id || user.personnelId || null;
    }, [user]);

    // Dictionnaire de traduction
    const translations = {
        FR: {
            menuTitle: "Espace Enseignant",
            dashboard: "Tableau de Bord",
            classes: "Mes classes",
            titulaire: "Espace Titulaire",
            schedule: "Mon horaire",
            library: "Bibliothèque",
            logout: "Déconnexion",
            online: "En ligne",
            academicYear: "Année académique en cours",
            titleDashboard: "Tableau de bord",
            titleClasses: "Espace Classes & Évaluations",
            titleTitulaire: "Tableau de Bord Titulaire",
            titleSchedule: "Mon Horaire",
            titleDefault: "Espace Pédagogique",
            systemSubtitle: "Gestion Scolaire SaaS",
            logoutConfirmTitle: "Confirmation de déconnexion",
            logoutConfirmDesc: "Êtes-vous sûr de vouloir vous déconnecter de votre espace enseignant ?",
            cancel: "Annuler",
            confirm: "Se déconnecter"
        },
        EN: {
            menuTitle: "Teacher Space",
            dashboard: "Dashboard",
            classes: "My Classes",
            titulaire: "Titulaire Space",
            schedule: "My Schedule",
            library: "Library",
            logout: "Logout",
            online: "Online",
            academicYear: "Current Academic Year",
            titleDashboard: "Dashboard",
            titleClasses: "Classes & Evaluations Space",
            titleTitulaire: "Titulaire Dashboard",
            titleSchedule: "My Schedule",
            titleDefault: "Pedagogical Space",
            systemSubtitle: "SaaS School Management",
            logoutConfirmTitle: "Logout Confirmation",
            logoutConfirmDesc: "Are you sure you want to log out of your teacher space?",
            cancel: "Cancel",
            confirm: "Log out"
        }
    };

    const currentTexts = translations[lang] || translations.FR;

    // Charger les informations du système SaaS
    const loadSystemInfo = () => {
        const storedAppName = localStorage.getItem('systemAppName');
        const storedLogoPath = localStorage.getItem('systemLogoPath');
        
        setSystemConfig({
            applicationName: storedAppName || 'MyAcademia SaaS',
            logoPath: storedLogoPath || null
        });
    };

    // Notification navigateur native
    const sendNotification = useCallback((message) => {
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                new Notification("MyAcademia ERP - Titulaire", {
                    body: message || "De nouveaux bulletins sont disponibles dans votre espace.",
                    icon: "/favicon.ico" 
                });
            } catch (e) {
                console.error("Erreur lors de l'envoi de la notification native:", e);
            }
        }
    }, []);

    // Vérification initiale des notifications/dossiers non lus via HTTP (Fallback persistant)
    const checkPendingNotifications = useCallback(async (teacherId, academicYearId) => {
        try {
            // 1. Vérifier s'il y a une notification non traitée stockée localement
            const pendingLocal = sessionStorage.getItem('pending_bulletin_notification');
            if (pendingLocal) {
                const parsedLocal = JSON.parse(pendingLocal);
                if (parsedLocal && parsedLocal.folderData) {
                    setHasUnreadNotification(true);
                    setNotificationData(parsedLocal.folderData);
                    return;
                }
            }

            // 2. Appel API de vérification auprès du service titulaire (s'il existe une méthode dédiée)
            if (titulaireService && typeof titulaireService.getUnreadNotifications === 'function') {
                const unreadList = await titulaireService.getUnreadNotifications(teacherId, academicYearId);
                if (unreadList && unreadList.length > 0) {
                    const latestNotification = unreadList[0];
                    setHasUnreadNotification(true);
                    setNotificationData(latestNotification);
                    sessionStorage.setItem('pending_bulletin_notification', JSON.stringify({
                        triggerFolderCreation: true,
                        folderData: latestNotification,
                        timestamp: Date.now()
                    }));
                }
            }
        } catch (error) {
            console.warn("Vérification des notifications en attente via API ignorée ou non disponible:", error);
        }
    }, []);

    // Chargement initial des configs, statut Titulaire et notifications persistance
    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const schoolData = await schoolConfigService.getSchoolConfig();
                if (schoolData && schoolData.schoolName) {
                    setSchoolConfig(schoolData);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la configuration de l'école:", error);
            }
        };

        const checkTitulaireStatus = async () => {
            const academicYearId = user.academicYearId || user.currentAcademicYearId || localStorage.getItem('academicYearId') || localStorage.getItem('currentAcademicYearId') || null;

            if (currentTeacherId) {
                try {
                    const classrooms = await titulaireService.getMyClassrooms(currentTeacherId, academicYearId);
                    if (classrooms && classrooms.length > 0) {
                        setIsTitulaire(true);
                        // Vérifier si des bulletins en attente existent pour ce titulaire
                        checkPendingNotifications(currentTeacherId, academicYearId);
                    } else {
                        setIsTitulaire(false);
                    }
                } catch (error) {
                    console.error("Erreur lors de la vérification du statut de titulaire:", error);
                    setIsTitulaire(false);
                }
            }
        };

        fetchConfigs();
        checkTitulaireStatus();
        loadSystemInfo();

        window.addEventListener('system-settings-updated', loadSystemInfo);
        return () => window.removeEventListener('system-settings-updated', loadSystemInfo);
    }, [currentTeacherId, user.academicYearId, user.currentAcademicYearId, checkPendingNotifications]);

    // Demande de permission pour les notifications navigateur
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }, []);

    // WebSocket : Réception en temps réel des notifications de bulletins envoyés par le Proviseur
    useEffect(() => {
        const handleWebSocketMessage = (data) => {
            let parsedData = data;
            if (typeof data === 'string') {
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    console.error("Erreur lors du parsing du message WebSocket:", e);
                    return;
                }
            }

            if (!parsedData) return;

            // Dépaquetage si les données sont enveloppées dans une sous-propriété (payload, body ou data)
            const payload = parsedData.payload || parsedData.data || parsedData.body || parsedData;

            // Extraction multi-propriétés du destinataire
            const targetTeacherId = payload.teacherId || payload.titulaireId || payload.recipientId || payload.userId;

            // Vérification si le message est destiné au titulaire actuellement connecté
            const isTargetedToMe = !targetTeacherId || Number(targetTeacherId) === Number(currentTeacherId);

            // Détection si le message concerne un envoi de bulletins
            const isBulletinNotification = 
                payload.type === 'BULLETIN_SENT' || 
                payload.type === 'BULLETIN_TRANSFER' ||
                payload.action === 'NEW_BULLETINS' ||
                payload.folderData ||
                payload.classroomName ||
                (payload.message && payload.message.toLowerCase().includes('bulletin'));

            if (isTargetedToMe && isBulletinNotification) {
                setHasUnreadNotification(true);
                setNotificationData(payload);

                // Sauvegarder dans sessionStorage pour persister le besoin de création de dossier
                sessionStorage.setItem('pending_bulletin_notification', JSON.stringify({
                    triggerFolderCreation: true,
                    folderData: payload,
                    timestamp: Date.now()
                }));
                
                const notificationMessage = payload.message || `Les bulletins de la classe ${payload.classroomName || ''} ont été transmis par le Proviseur !`;
                sendNotification(notificationMessage);
            }
        };

        websocketService.connect(handleWebSocketMessage);

        return () => {
            websocketService.disconnect(handleWebSocketMessage);
        };
    }, [currentTeacherId, sendNotification]);

    // Traitement lors du clic sur la Cloche de Notification
    const handleNotificationClick = () => {
        setHasUnreadNotification(false);

        // Récupération des données complètes de notification
        const activeData = notificationData || (() => {
            try {
                const stored = sessionStorage.getItem('pending_bulletin_notification');
                return stored ? JSON.parse(stored).folderData : null;
            } catch (e) {
                return null;
            }
        })();

        // Rediriger l'enseignant vers l'espace titulaire pour déclencher la création/ouverture du dossier BulletinFolder
        navigate('/enseignant/titulaire', { 
            state: { 
                triggerFolderCreation: true, 
                folderData: activeData,
                timestamp: Date.now() 
            } 
        });
    };

    // Gestion synchrone du thème clair/sombre
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

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('pending_bulletin_notification');
        navigate('/login');
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/dashboard')) return currentTexts.titleDashboard;
        if (location.pathname.includes('/classes')) return currentTexts.titleClasses;
        if (location.pathname.includes('/titulaire')) return currentTexts.titleTitulaire;
        if (location.pathname.includes('/horaire')) return currentTexts.titleSchedule;
        return currentTexts.titleDefault;
    };

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

            {/* MODAL DE CONFIRMATION DE DÉCONNEXION */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <LogOut size={32} strokeWidth={2.5} className="mr-1" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                            {currentTexts.logoutConfirmTitle}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-2">
                            {currentTexts.logoutConfirmDesc}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {currentTexts.cancel}
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5"
                            >
                                {currentTexts.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <div className={`
                fixed inset-y-0 left-0 z-50 lg:relative lg:z-20
                ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-20'} 
                ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 overflow-hidden
            `}>
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>
                
                {isMobileOpen && (
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl lg:hidden transition-all"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* Header Sidebar : Logo & Nom du Système (SaaS) */}
                <div className="p-6 flex flex-col items-center border-b border-slate-800/50 relative z-10 min-h-[170px] justify-center">
                    {isSidebarOpen || isMobileOpen ? (
                        <>
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-700/50 transform hover:scale-105 transition-transform mb-3 bg-white">
                                {systemConfig.logoPath ? (
                                    <img 
                                        src={getSystemLogoUrl(systemConfig.logoPath)} 
                                        alt="Logo Système" 
                                        className="w-full h-full object-contain p-1"
                                    />
                                ) : (
                                    <LayoutDashboard size={36} className="text-blue-600" />
                                )}
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-center text-slate-100 line-clamp-2 px-2">
                                {systemConfig.applicationName}
                            </h2>
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-md border border-slate-700/50 overflow-hidden bg-white">
                            {systemConfig.logoPath ? (
                                <img 
                                    src={getSystemLogoUrl(systemConfig.logoPath)} 
                                    alt="Logo Système" 
                                    className="w-full h-full object-contain p-0.5"
                                />
                            ) : (
                                <LayoutDashboard size={20} className="text-blue-600" />
                            )}
                        </div>
                    )}
                </div>
                
                {/* Menu de Navigation */}
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

                    {isTitulaire && (
                        <NavLink to="/enseignant/titulaire" className={({ isActive }) => `flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold capitalize tracking-wide transition-all duration-300 ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="shrink-0" />
                                {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.titulaire}</span>}
                            </div>
                            {/* Pastille indiquant des dossiers/bulletins non traites meme dans le menu */}
                            {hasUnreadNotification && (isSidebarOpen || isMobileOpen) && (
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-slate-900"></span>
                            )}
                        </NavLink>
                    )}

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
                                <p className="text-xs font-bold text-slate-200 truncate">{user.username || user.name || 'Enseignant'}</p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>{currentTexts.online}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black capitalize tracking-wide text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" /> 
                        {(isSidebarOpen || isMobileOpen) && <span>{currentTexts.logout}</span>}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* ZONE DE CAPTURE POUR LE BOUTON TOGGLE DESKTOP */}
                <div className="hidden lg:block absolute left-0 top-6 w-8 h-32 z-40 group">
                    <div className="w-full h-full flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    
                    <div className="flex items-center gap-4">
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
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                        
                        {/* SÉLECTEUR DE THÈME */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            title={theme === 'light' ? 'Activer le mode Sombre' : 'Activer le mode Clair'}
                        >
                            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
                        </button>

                        {/* SÉLECTEUR DE LANGUE */}
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

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                        {/* NOTIFICATIONS CLOCHE 🔔 */}
                        <button 
                            onClick={handleNotificationClick}
                            className={`relative p-2.5 transition-colors rounded-xl ${hasUnreadNotification ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800' : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Notifications"
                        >
                            <Bell size={19} className={hasUnreadNotification ? "animate-bounce" : ""} />
                            {hasUnreadNotification && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                            )}
                        </button>
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        
                        {/* INFOS ÉCOLE EN-TÊTE */}
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                            <div className="hidden sm:flex flex-col text-right max-w-[150px]">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 line-clamp-1" title={schoolConfig?.schoolName}>
                                    {schoolConfig?.schoolName || "Institution"}
                                </span>
                                <span className="text-[8px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider line-clamp-1 mt-0.5">
                                    {schoolConfig?.slogan || "Institution"}
                                </span>
                            </div>
                            <div className="w-10 h-10 md:h-11 md:w-11 bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 ring-2 ring-emerald-500/10">
                                {schoolConfig?.logoBase64 ? (
                                    <img 
                                        src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                                        alt="Logo Ecole" 
                                        className="w-full h-full object-contain p-0.5"
                                    />
                                ) : (
                                    <span className="text-slate-600 dark:text-slate-300 font-black">
                                        {schoolConfig?.schoolName ? schoolConfig.schoolName.charAt(0).toUpperCase() : 'S'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ZONE DE CONTENU PRINCIPAL */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950 transition-colors duration-300 hover-scrollbar">
                    <div className="max-w-[1600px] mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;