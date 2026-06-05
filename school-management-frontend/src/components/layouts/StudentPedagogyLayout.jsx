import React, { useState, useContext, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import AuthService from "../../services/auth.service";
import { ThemeContext, LanguageContext } from "../../App";
import { 
  LayoutDashboard, BookOpen, Calendar, GraduationCap, 
  ClipboardList, Menu, X, Bell, LogOut, User, Wallet, Settings, Library, Sun, Moon, Languages
} from "lucide-react";

const StudentPedagogyLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLogout = () => {
    const confirmMsg = language === "FR" ? "Voulez-vous vraiment vous déconnecter ?" : "Do you really want to log out ?";
    if (window.confirm(confirmMsg)) {
      AuthService.logout();
      navigate("/login");
    }
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
      {/* SIDEBAR MOBILE OVERLAY */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR DYNAMIQUE */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-full w-72 bg-slate-900 dark:bg-slate-950 text-white z-50 
        transform transition-transform duration-300 flex flex-col border-r border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* LOGO & NOM INSTITUTION */}
        <div className="h-24 flex items-center px-6 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                {schoolConfig.logoBase64 ? (
                  <img 
                    src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <BookOpen size={22} className="text-emerald-400" />
                )}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase tracking-tighter text-white whitespace-normal leading-tight italic">
                   {loading ? "Chargement..." : schoolConfig.schoolName || "COMPLEXE SCOLAIRE MUSAFA"}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Espace Élève</span>
             </div>
          </div>
          <button className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        {/* NAVIGATION MENUS */}
        <nav className="mt-6 px-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-wide
                ${isActive 
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-950/20" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}
              `}
              onClick={() => setIsOpen(false)}
            >
              {item.icon} <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* PROFILE & LOGOUT */}
        <div className="p-4 mt-auto border-t border-slate-800 bg-slate-950/40">
           <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Matricule : {currentUser?.matricule || "N/A"}</p>
                <p className="text-xs font-black text-slate-200 truncate">{currentUser?.username || "Élève"}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest group"
           >
             <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
             <span>{language === "FR" ? "Déconnexion" : "Logout"}</span>
           </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-300">
          <button className="lg:hidden p-2 text-slate-600 dark:text-slate-400" onClick={() => setIsOpen(true)}><Menu /></button>
          
          <div className="hidden lg:block text-slate-400 dark:text-slate-500 font-bold italic text-xs uppercase tracking-wider">
            "Conception et réalisation d'un système de gestion scolaire"
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

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{currentUser?.username}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Session Active</p>
               </div>
               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 border border-emerald-400/20 shadow-sm flex items-center justify-center text-white font-black text-sm">
                 {currentUser?.username?.charAt(0).toUpperCase()}
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