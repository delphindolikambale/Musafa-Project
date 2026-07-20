import React, { useState, useContext, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import AuthService from "../../services/auth.service";
import SuperAdminSystemService, { getSystemLogoUrl } from "../../services/multitenantService/SuperAdminSystemService";
import { ThemeContext, LanguageContext } from "../../App";
import { 
  LayoutDashboard, BookOpen, Calendar, GraduationCap, 
  ClipboardList, Menu, X, Bell, LogOut, User, Wallet, Settings, Library, Sun, Moon, Languages
} from "lucide-react";

const StudentPedagogyLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false); // État pour la réduction du sidebar
  const [showLogoutModal, setShowLogoutModal] = useState(false); // État pour la modale de déconnexion
  
  // ✅ CORRECTION : Modification de "logoPath" par "globalLogoPath" pour matcher le DTO de l'API
  const [systemSettings, setSystemSettings] = useState({ applicationName: "", globalLogoPath: null });
  const [sysLoading, setSysLoading] = useState(true);

  const { schoolConfig, loading } = useSchool();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = AuthService.getCurrentUser();

  // INTERCEPTION DE SÉCURITÉ : Rediriger vers l'activation si le compte n'est pas lié physiquement
  useEffect(() => {
    if (currentUser && !currentUser.isLinked && location.pathname !== "/student/link-account") {
      navigate("/student/link-account", { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  // Récupération des informations du système (Nom et Logo global)
  useEffect(() => {
    const fetchSysSettings = async () => {
      try {
        const data = await SuperAdminSystemService.getPublicSettings();
        if (data) {
          setSystemSettings(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres système:", error);
      } finally {
        setSysLoading(false);
      }
    };
    fetchSysSettings();
  }, []);

  const confirmLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // LES 7 MENUS EXPLICITEMENT DEMANDÉS
  const menuItems = [
    { path: "/student/dashboard", icon: <LayoutDashboard size={20} />, label: language === "FR" ? "Tableau de Bord" : "Dashboard" },
    { path: "/student/courses", icon: <GraduationCap size={20} />, label: language === "FR" ? "Mes Cours" : "My Courses" },
    { path: "/student/library", icon: <Library size={20} />, label: language === "FR" ? "Sa Bibliothèque" : "Library" },
    { path: "/student/schedule", icon: <Calendar size={20} />, label: language === "FR" ? "Horaires de Cours & Examen" : "Schedules" },
    { path: "/student/attendance", icon: <ClipboardList size={20} />, label: language === "FR" ? "Présences" : "Attendance" },
    { path: "/student/finance", icon: <Wallet size={20} />, label: language === "FR" ? "Situation Financière" : "Financial Status" },
    { path: "/student/settings", icon: <Settings size={20} />, label: language === "FR" ? "Paramètres" : "Settings" },
  ];

  // Si l'utilisateur est sur la page de liaison, ne pas afficher la sidebar globale ni le header
  if (location.pathname === "/student/link-account") {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* MODALE DE CONFIRMATION DE DÉCONNEXION */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === "FR" ? "Déconnexion" : "Logout"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {language === "FR" ? "Êtes-vous sûr de vouloir quitter votre session sécurisée ?" : "Are you sure you want to securely log out of your session?"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {language === "FR" ? "Annuler" : "Cancel"}
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
              >
                {language === "FR" ? "Me déconnecter" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR MOBILE OVERLAY */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR DYNAMIQUE (Réductible & Extensible au survol) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-full bg-slate-900 dark:bg-slate-950 text-white z-50 
        transform transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isDesktopCollapsed ? "lg:w-20 hover:lg:w-72 group" : "lg:w-72 w-72"}
      `}>
        {/* LOGO & NOM DU SYSTÈME (Dynamique) */}
        <div className="h-20 flex items-center px-5 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 overflow-hidden shrink-0">
          <div className="flex items-center gap-3 w-full">
             {/* CORRECTION DE L'AFFICHAGE DU LOGO : Fond blanc et bordure claire pour le contraste */}
             <div className="shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 p-1 shadow-sm">
                {/* ✅ CORRECTION : Utilisation de globalLogoPath avec object-contain au lieu de object-cover */}
                {systemSettings.globalLogoPath ? (
                  <img 
                    src={getSystemLogoUrl(systemSettings.globalLogoPath)} 
                    alt="System Logo" 
                    className="w-full h-full object-contain drop-shadow-md" 
                  />
                ) : (
                  <div className="text-emerald-600 font-black text-xl">
                     {sysLoading ? "..." : (systemSettings.applicationName?.charAt(0) || "S")}
                  </div>
                )}
             </div>
             <div className={`flex flex-col min-w-0 transition-all duration-300 ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 group-hover:w-auto group-hover:opacity-100' : 'w-auto opacity-100'}`}>
                <span className="text-xs font-black uppercase tracking-tighter text-white whitespace-nowrap leading-tight italic">
                   {sysLoading ? "Chargement..." : systemSettings.applicationName || "SYSTÈME"}
                </span>
             </div>
          </div>
          <button className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white shrink-0" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION MENUS */}
        {/* ✅ CORRECTION : Ajout des classes webkit pour la scrollbar transparente par défaut et visible au survol */}
        <nav className="mt-6 px-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors duration-300">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-wide overflow-hidden
                ${isActive 
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-950/20" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}
              `}
              onClick={() => setIsOpen(false)}
            >
              <div className="shrink-0 flex items-center justify-center w-6">
                {item.icon}
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 group-hover:w-auto group-hover:opacity-100' : 'w-auto opacity-100'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* PROFILE & LOGOUT */}
        <div className="p-4 mt-auto border-t border-slate-800 bg-slate-950/40 overflow-hidden">
           <div className={`flex items-center gap-3 px-2 mb-4 transition-all duration-300 ${isDesktopCollapsed ? 'lg:hidden group-hover:flex' : 'flex'}`}>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0 whitespace-nowrap">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">Matricule : {currentUser?.matricule || "N/A"}</p>
                <p className="text-xs font-black text-slate-200 truncate">{currentUser?.username || "Élève"}</p>
              </div>
           </div>
           <button 
             onClick={() => setShowLogoutModal(true)}
             className={`flex items-center justify-center gap-3 px-3 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest w-full overflow-hidden`}
           >
             <LogOut size={16} className="shrink-0" />
             <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 group-hover:w-auto group-hover:opacity-100' : 'w-auto opacity-100'}`}>
               {language === "FR" ? "Déconnexion" : "Logout"}
             </span>
           </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Bouton Mobile */}
            <button className="lg:hidden p-2 text-slate-600 dark:text-slate-400" onClick={() => setIsOpen(true)}>
              <Menu size={20} />
            </button>
            {/* Bouton Desktop pour réduire/agrandir le sidebar */}
            <button 
              className="hidden lg:flex p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" 
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              title="Réduire/Agrandir le menu"
            >
              <Menu size={20} />
            </button>
          </div>
          
          <div className="hidden lg:block text-slate-400 dark:text-slate-500 font-bold italic text-xs uppercase tracking-wider">
          </div>

          <div className="flex items-center gap-3">
            {/* UTILITIES BUTTONS */}
            <button 
              onClick={toggleLanguage} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs"
            >
              <Languages size={18} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <button className="p-2 text-slate-400 hover:text-emerald-600 relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            </button>

            {/* LOGO & NOM DE L'ÉCOLE DÉPLACÉS ICI (En remplacement des infos utilisateur) */}
            <div className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-200 dark:border-slate-800">
               {/* Modification taille (w-10 h-10) et ajout padding (p-0.5) */}
               <div className="shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                  {schoolConfig.logoBase64 ? (
                    <img 
                      src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                      alt="School Logo" 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <BookOpen size={18} className="text-emerald-500" />
                  )}
               </div>
               <div className="hidden sm:block text-left">
                  <p className="text-xs font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">
                     {loading ? "Chargement..." : schoolConfig.schoolName || "COMPLEXE SCOLAIRE MUSAFA"}
                  </p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Espace Élève</p>
               </div>
            </div>
          </div>
        </header>

        {/* CONTAINER ROUTE CONTENU */}
        <main className="p-4 lg:p-8 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentPedagogyLayout;