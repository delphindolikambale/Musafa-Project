import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, GraduationCap, Sun, Moon, Globe, Clock, BookOpen } from "lucide-react";
// Import des contextes globaux depuis App.jsx (ajustez le chemin '../App' selon votre arborescence)
import { ThemeContext, LanguageContext } from "../App"; 
import SuperAdminSystemService, { getSystemLogoUrl } from "../services/multitenantService/SuperAdminSystemService";

const Welcome = () => {
  const [appName, setAppName] = useState("MyAcademia");
  const [logoUrl, setLogoUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Récupération des contextes
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);

  useEffect(() => {
    // Récupération des paramètres publics (Nom et Logo) au chargement de la page
    const fetchPublicSettings = async () => {
      try {
        const settings = await SuperAdminSystemService.getPublicSettings();
        if (settings.applicationName) {
          setAppName(settings.applicationName);
        }
        if (settings.globalLogoPath) {
          setLogoUrl(getSystemLogoUrl(settings.globalLogoPath));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres système :", error);
      }
    };

    fetchPublicSettings();

    // Mise à jour de l'horloge chaque seconde
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatage de la date et de l'heure sur le fuseau horaire de l'Est de la RDC (Beni - CAT)
  const dateFormatter = new Intl.DateTimeFormat(language === 'FR' ? 'fr-FR' : 'en-US', {
    timeZone: 'Africa/Lubumbashi',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeFormatter = new Intl.DateTimeFormat(language === 'FR' ? 'fr-FR' : 'en-US', {
    timeZone: 'Africa/Lubumbashi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Traductions dynamiques
  const t = {
    location: language === 'FR' ? 'Beni, RDC' : 'Beni, DRC',
    welcomeBack: language === 'FR' ? 'Content de vous revoir !' : 'Welcome back!',
    description: language === 'FR' 
      ? 'Accédez à votre espace sécurisé pour consulter vos horaires, résultats et gérer vos activités.' 
      : 'Access your secure space to check your schedules, grades, and manage your activities.',
    login: language === 'FR' ? 'Se Connecter' : 'Login',
    register: language === 'FR' ? "S'inscrire" : 'Register',
    excellence: language === 'FR' ? 'Excellence & Discipline' : 'Excellence & Discipline'
  };

  return (
    <div 
      // STRICT SANS SCROLL : hauteur 100% du viewport, largeur 100% de l'écran, overflow-hidden bloque tout dépassement
      className={`h-[100dvh] w-screen flex flex-col relative font-sans overflow-hidden transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-[#eef2f9]'
      }`}
    >
      {/* 1. Éléments de décoration en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Tâche de couleur Haut-Gauche */}
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-colors duration-500 ${
          theme === 'dark' ? 'bg-blue-600/20' : 'bg-purple-300/40'
        }`}></div>
        
        {/* Tâche de couleur Bas-Droite */}
        <div className={`absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-500 ${
          theme === 'dark' ? 'bg-indigo-800/20' : 'bg-blue-300/40'
        }`}></div>

        {/* Intégration de l'icône Vectorielle Professionnelle (Livre + Étudiant) en filigrane */}
        <div className="absolute inset-0 flex items-center justify-center lg:justify-start lg:pl-[12%] opacity-10 lg:opacity-15 transition-opacity duration-500">
          <div className="relative flex items-center justify-center">
            {/* Icône du livre ouvert (représentant la lecture/les études) */}
            <BookOpen 
              className={`w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px] transition-colors duration-500 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
              strokeWidth={0.5} 
            />
            {/* Icône du chapeau de diplômé (représentant l'élève) */}
            <GraduationCap 
              className={`absolute -top-10 -right-12 sm:-top-16 sm:-right-20 lg:-top-20 lg:-right-24 w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] transition-colors duration-500 ${
                theme === 'dark' ? 'text-indigo-400' : 'text-purple-600'
              }`}
              strokeWidth={0.5} 
            />
          </div>
        </div>
      </div>

      {/* 2. En-tête (Header) Top Bar - Justifié à droite après retrait du service en ligne */}
      <header className={`relative shrink-0 w-full px-6 py-4 flex flex-col sm:flex-row justify-end items-center z-20 transition-colors duration-300 ${
        theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {/* Droite : Heure (Beni), Thème, Langue */}
        <div className="flex items-center gap-5 sm:gap-6 mt-2 sm:mt-0">
          {/* Horloge Beni */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
              {t.location}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Clock size={14} />
              <span>{dateFormatter.format(currentTime)} - {timeFormatter.format(currentTime)}</span>
            </div>
          </div>

          {/* Séparateur */}
          <div className="hidden sm:block h-8 w-px bg-current opacity-20"></div>

          {/* Boutons d'action (Langue & Thème) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-bold hover:opacity-70 transition-opacity"
              title="Changer de langue"
            >
              <Globe size={18} />
              <span>{language}</span>
            </button>

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-white shadow-sm hover:shadow-md text-slate-700'
              }`}
              title="Basculer le thème"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Conteneur principal - flex-1 prend l'espace restant, sans marge verticale forçant le scroll */}
      <div className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto flex items-center justify-center lg:justify-end px-4 lg:pr-[8%] xl:pr-[12%] sm:px-0">
        
        {/* Carte Centrale optimisée pour tenir sur tous les écrans sans forcer de scroll */}
        <div className={`w-full max-w-[420px] rounded-[2rem] pt-14 pb-6 px-6 sm:px-10 flex flex-col items-center text-center relative border transition-all duration-500 ${
          theme === 'dark' 
            ? 'bg-slate-800/85 border-slate-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl' 
            : 'bg-white/90 border-white shadow-[0_20px_60px_-15px_rgba(0,0,100,0.1)] backdrop-blur-xl'
        }`}>
          
          {/* Logo dynamique - Taille ajustée pour ne pas déborder hors écran */}
          <div className={`absolute -top-10 w-20 h-20 sm:w-24 sm:h-24 sm:-top-12 rounded-[1.5rem] flex items-center justify-center shadow-xl border-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 group overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-600 to-slate-900 border-slate-800 shadow-blue-900/40'
              : 'bg-gradient-to-br from-purple-500 to-blue-500 border-white shadow-purple-500/30'
          }`}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`Logo ${appName}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 bg-white"
              />
            ) : (
              <span className="text-white font-black text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                {appName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* En-tête de la carte */}
          <div className="flex justify-center mb-2">
            <span className={`text-[10px] font-black tracking-[0.2em] uppercase py-1.5 px-4 rounded-full ${
              theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-50 text-orange-600'
            }`}>
              ERP System
            </span>
          </div>
          
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-1.5 tracking-tight transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {appName}
          </h1>
          
          <h3 className={`text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r mb-3 ${
            theme === 'dark' ? 'from-blue-400 to-indigo-300' : 'from-blue-600 to-purple-600'
          }`}>
            {t.welcomeBack}
          </h3>
          
          <p className={`text-xs sm:text-sm leading-relaxed mb-6 px-1 transition-colors ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {t.description}
          </p>

          {/* Boutons d'action */}
          <div className="w-full flex flex-col gap-3.5">
            <Link 
              to="/login" 
              className={`group relative w-full py-3 sm:py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-900/50' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-blue-500/30'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <LogIn size={18} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative z-10">{t.login}</span>
            </Link>

            <Link 
              to="/register" 
              className={`group w-full py-3 sm:py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 border-2 shadow-sm ${
                theme === 'dark'
                  ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:border-purple-500 hover:bg-white hover:text-purple-600'
              }`}
            >
              <UserPlus size={18} className="transition-transform duration-300 group-hover:scale-110" />
              {t.register}
            </Link>
          </div>

          {/* Pied de la carte */}
          <div className={`mt-5 sm:mt-6 pt-4 sm:pt-5 border-t w-full flex items-center justify-center gap-2 transition-colors ${
            theme === 'dark' ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'
          }`}>
            <GraduationCap size={16} className={theme === 'dark' ? 'text-blue-500' : 'text-purple-400'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t.excellence}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;