import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import AuthService from "../../services/auth.service";
import { 
  LayoutDashboard, BookOpen, Calendar, GraduationCap, 
  FileCheck, ClipboardList, Menu, X, Bell, LogOut, User 
} from "lucide-react";

const StudentPedagogyLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { schoolConfig, loading } = useSchool();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      AuthService.logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/student/dashboard", icon: <LayoutDashboard size={20} />, label: "Tableau de Bord" },
    { path: "/student/results", icon: <GraduationCap size={20} />, label: "Mes Résultats / Bulletin" },
    { path: "/student/schedule", icon: <Calendar size={20} />, label: "Horaires" },
    { path: "/student/courses", icon: <BookOpen size={20} />, label: "Notes de Cours" },
    { path: "/student/assignments", icon: <FileCheck size={20} />, label: "Travaux Pratiques" },
    { path: "/student/attendance", icon: <ClipboardList size={20} />, label: "Présences" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR MOBILE OVERLAY */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR STABILISÉ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-full w-72 bg-slate-950 text-white z-50 
        transform transition-transform duration-300 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* LOGO & NOM INSTITUTION DYNAMIQUE */}
        <div className="h-24 flex items-center px-6 bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                {schoolConfig.logoBase64 ? (
                  <img 
                    src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <GraduationCap size={22} className="text-indigo-400" />
                )}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase tracking-tighter text-white whitespace-normal leading-tight italic">
                   {loading ? "Chargement..." : schoolConfig.schoolName || "STUDENT PORTAL"}
                </span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Espace Élève</span>
             </div>
          </div>
          <button className="lg:hidden ml-auto p-2" onClick={() => setIsOpen(false)}><X /></button>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-8 px-4 space-y-2 flex-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all 
                ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"}
              `}
              onClick={() => setIsOpen(false)}
            >
              {item.icon} <span className="font-semibold text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* SECTION UTILISATEUR & DÉCONNEXION */}
        <div className="p-4 mt-auto border-t border-white/5 bg-slate-900/50">
           <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Élève Connecté</p>
                <p className="text-sm font-bold text-indigo-100 truncate">{currentUser?.username || "Utilisateur"}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition-all duration-300 font-bold text-sm group"
           >
             <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
             <span>Déconnexion</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(true)}><Menu /></button>
          <div className="hidden lg:block text-slate-500 font-medium italic text-sm">
            "Conception et réalisation d'un système de gestion scolaire"
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none">{currentUser?.username}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Session Active</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                 {currentUser?.username?.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentPedagogyLayout;