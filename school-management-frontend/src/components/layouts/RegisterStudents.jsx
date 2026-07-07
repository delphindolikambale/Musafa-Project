import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  LogOut, 
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { SchoolConfigService } from '../../services/schoolConfig.service';
import { ThemeContext } from '../../App'; // Import du contexte pour le layout global
import { getSystemLogoUrl } from '../../services/multitenantService/SuperAdminSystemService'; // Importation du service d'URL de logo système

const RegisterStudents = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const location = useLocation();
  const navigate = useNavigate();
  
  // États pour la responsivité, le collapse et les données dynamiques
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState('FR');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [schoolConfig, setSchoolConfig] = useState({
    schoolName: 'Complexe Scolaire Musafa',
    logoBase64: null
  });

  // --- ADAPTATION : Identité du système ---
  const [systemInfo, setSystemInfo] = useState({
    appName: 'MYACADEMIA ERP',
    logoUrl: null
  });

  // Charger les infos du système depuis le LocalStorage
  const loadSystemInfo = () => {
    const storedAppName = localStorage.getItem('systemAppName');
    const storedLogoPath = localStorage.getItem('systemLogoPath');
    
    setSystemInfo({
      appName: storedAppName || 'MYACADEMIA ERP',
      logoUrl: storedLogoPath ? getSystemLogoUrl(storedLogoPath) : null
    });
  };

  // Récupération de la configuration depuis le backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await SchoolConfigService.getConfig();
        if (data) {
          setSchoolConfig({
            schoolName: data.schoolName || 'Complexe Scolaire Musafa',
            logoBase64: data.logoBase64 || null
          });
        }
      } catch (error) {
        console.error("Impossible de charger la configuration", error);
      }
    };
    fetchConfig();

    // Charger l'identité du système au montage
    loadSystemInfo();

    // Écouter les mises à jour du système
    const handleSystemUpdate = () => loadSystemInfo();
    window.addEventListener('system-settings-updated', handleSystemUpdate);

    return () => {
      window.removeEventListener('system-settings-updated', handleSystemUpdate);
    };
  }, []);

  const menuItems = [
    { name: 'Tableau de Bord', path: '/prefet/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestion Élèves', path: '/prefet/eleves', icon: <Users size={20} /> },
    { name: 'Inscriptions', path: '/prefet/inscriptions', icon: <UserCheck size={20} /> },
  ];

  // Gestion de l'affichage de la boîte de dialogue de déconnexion
  const triggerLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  // Confirmation finale de déconnexion
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Fermer la sidebar sur mobile après un clic
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fonction pour basculer la langue
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'FR' ? 'EN' : 'FR');
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      
      {/* Overlay sombre pour mobile quand la sidebar est ouverte */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Préfet - Responsive & Collapsible */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 bg-[#0F172A] text-white flex flex-col shadow-2xl z-50 group
        transform transition-all duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        
        {/* Petit bouton invisible/délicat de réduction (uniquement visible au survol du conteneur de la sidebar sur Desktop) */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-12 bg-[#0F172A] border border-slate-700 rounded-r-lg items-center justify-center text-slate-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-50"
          title={isSidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Bouton de fermeture mobile */}
        <button 
          onClick={closeSidebar} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden transition-colors"
        >
          <X size={24} />
        </button>

        {/* ADAPTATION : Header de la Sidebar avec l'identité du Système uniquement */}
        <div className={`p-4 border-b border-slate-800/50 flex items-center justify-between shrink-0 h-auto min-h-[5rem] overflow-hidden mt-4 lg:mt-0 ${isSidebarCollapsed ? 'p-4 justify-center' : 'p-6'}`}>
          <div className="flex items-center gap-3 group w-full">
            {/* Logo du SYSTÈME */}
            <div className={`shrink-0 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-700 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
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

            {/* Nom du Système : Police agrandie (text-lg) et passage automatique à la ligne pour ERP */}
            {!isSidebarCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden justify-center transition-opacity duration-300">
                <h1 className="text-white font-black tracking-tight text-lg uppercase leading-tight text-left">
                  {systemInfo.appName.split(/(?=\sERP)/i).map((part, index) => (
                    <span key={index} className="block">{part.trim()}</span>
                  ))}
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 overflow-y-auto custom-scrollbar">
          {!isSidebarCollapsed && (
            <p className="text-[11px] text-slate-500 font-bold uppercase mb-4 px-2 tracking-wider transition-opacity duration-200">
              Acteurs & Pédagogie
            </p>
          )}
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              title={isSidebarCollapsed ? item.name : ""}
              className={`flex items-center rounded-xl mb-2 transition-all duration-200 ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${
                location.pathname.includes(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar / Profil Préfet & Déconnexion */}
        <div className="p-4 border-t border-slate-800/50 flex flex-col gap-3">
          
          {/* Profil Préfet */}
          <div className={`flex items-center gap-3 mb-1 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold shadow-sm border bg-blue-900/40 text-blue-300 border-blue-800/50`}>
              AD
            </div>
            {!isSidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold uppercase text-slate-100 truncate">Ir. Architecte</p>
                <p className="text-[11px] text-emerald-500 font-bold tracking-wider truncate">PRÉFET DES ÉTUDES</p>
              </div>
            )}
          </div>

          {/* Bouton Déconnexion */}
          <button 
            onClick={triggerLogoutConfirmation}
            title={isSidebarCollapsed ? "Déconnexion" : ""}
            className={`flex items-center text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200 w-full ${
              isSidebarCollapsed ? 'justify-center p-3' : 'justify-start gap-3 px-4 py-3'
            }`}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col overflow-hidden w-full relative transition-colors duration-300 ${isDark ? 'bg-[#0B1121]' : 'bg-slate-50'}`}>
        <header className={`h-20 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 shrink-0 transition-colors duration-300 border-b ${isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'}`}>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Menu Hamburger visible uniquement sur mobile/tablette */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className={`p-2 -ml-2 rounded-lg lg:hidden transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Menu size={24} />
            </button>
            <h1 className={`text-lg sm:text-xl font-bold uppercase tracking-tight hidden sm:block ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              Espace de Travail
            </h1>
          </div>

          {/* Boutons de configurations alignés à droite */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* BOUTON SÉLECTEUR DE LANGUE */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${
                isDark 
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider">
                {language === 'FR' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </span>
            </button>

            {/* BOUTON THÈME (DARK & LIGHT) */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? 'border-slate-700 text-yellow-400 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-amber-600'
              }`}
              title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Bouton de Notification existant */}
            <button className={`relative transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <Bell size={22} />
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 ${isDark ? 'border-[#1E293B]' : 'border-white'}`}></span>
            </button>
            
            {/* ADAPTATION : Identité de l'école (Restée dans le header) */}
            <div className="hidden md:flex items-center gap-3 pl-4 ml-1 border-l border-slate-200 dark:border-slate-700">
              {schoolConfig.logoBase64 && (
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-white dark:bg-slate-800 flex items-center justify-center">
                  <img 
                    src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                    alt="School Logo" 
                    className="w-full h-full object-contain p-0.5" 
                  />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <span className={`text-xs font-black uppercase tracking-tight truncate max-w-[150px] lg:max-w-[200px] ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {schoolConfig.schoolName}
                </span>
              </div>
            </div>
            
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* BOITE DE DIALOGUE DE SECURITE (MODAL DE DECONNEXION) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop avec flou */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLogoutModal(false)}
          />
          
          {/* Contenu de la boîte de dialogue */}
          <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border border-slate-700/30 ${
            isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Confirmation de sécurité
                </h3>
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Êtes-vous sûr de vouloir vous déconnecter de votre espace de travail ? Toutes les sessions actives non enregistrées sur cet appareil prendront fin.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isDark 
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

export default RegisterStudents;