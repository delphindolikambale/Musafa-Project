import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  BookOpen, 
  LogOut, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { SchoolConfigService}  from '../../services/schoolConfig.service';


const RegisterStudents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // États pour la responsivité et les données dynamiques
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [schoolConfig, setSchoolConfig] = useState({
    schoolName: 'Complexe Scolaire Musafa',
    logoBase64: null
  });

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
  }, []);

  const menuItems = [
    { name: 'Tableau de Bord', path: '/prefet/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestion Élèves', path: '/prefet/eleves', icon: <Users size={20} /> },
    { name: 'Inscriptions', path: '/prefet/inscriptions', icon: <UserCheck size={20} /> },
  ];

  // Gestion de la déconnexion
  const handleLogout = () => {
    // Optionnel : Nettoyer le localStorage ou le contexte d'authentification ici
    // localStorage.removeItem('user');
    navigate('/login');
  };

  // Fermer la sidebar sur mobile après un clic
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fonction pour afficher correctement le logo Base64
  const renderLogo = () => {
    if (schoolConfig.logoBase64) {
      // Vérifie si la chaîne contient déjà le préfixe data:image
      const imageSrc = schoolConfig.logoBase64.startsWith('data:image') 
        ? schoolConfig.logoBase64 
        : `data:image/png;base64,${schoolConfig.logoBase64}`;
        
      return <img src={imageSrc} alt="Logo" className="w-full h-full object-cover" />;
    }
    // Fallback : Première lettre du nom de l'école
    return (
      <span className="font-bold text-xl text-white">
        {schoolConfig.schoolName.charAt(0).toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Overlay sombre pour mobile quand la sidebar est ouverte */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Préfet - Responsive (Fixed sur mobile, Relative sur Desktop) */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-64 bg-[#0F172A] text-white flex flex-col shadow-2xl z-50 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Bouton de fermeture mobile */}
        <button 
          onClick={closeSidebar} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6 flex flex-col items-center border-b border-slate-700 mt-4 lg:mt-0">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-3 flex items-center justify-center shadow-lg overflow-hidden border border-slate-600">
            {renderLogo()}
          </div>
          <h2 className="text-sm font-bold text-center uppercase tracking-wider px-2 line-clamp-2">
            {schoolConfig.schoolName}
          </h2>
          <span className="text-[10px] text-emerald-400 mt-2 uppercase font-semibold bg-emerald-400/10 px-3 py-1 rounded-full">
            Espace Préfet
          </span>
        </div>

        <nav className="flex-1 mt-6 px-4 overflow-y-auto">
          <p className="text-[11px] text-slate-500 font-bold uppercase mb-4 px-2">Acteurs & Pédagogie</p>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeSidebar} // Ferme le menu sur mobile au clic
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                location.pathname.includes(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 w-full relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 shrink-0">
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Menu Hamburger visible uniquement sur mobile/tablette */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 uppercase tracking-tight hidden sm:block">
              Espace de Travail
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 sm:pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 uppercase">Ir. Architecte</p>
                <p className="text-[11px] text-emerald-500 font-bold">PRÉFET DES ÉTUDES</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RegisterStudents;