import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, GraduationCap } from "lucide-react";

const Welcome = () => {
  return (
    <div 
      // h-[100dvh] et overflow-hidden garantissent qu'il n'y aura JAMAIS de barre de scroll
      className="h-[100dvh] w-full flex items-center justify-center relative bg-slate-900 bg-cover bg-center bg-no-repeat font-sans overflow-hidden"
      style={{ backgroundImage: "url('/images/bg-school.jpg')" }} // Remplacez par le chemin de votre vraie image
    >
      {/* Superposition sombre (Overlay) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-900/95 backdrop-blur-sm"></div>

      {/* Éléments de décoration lumineux en arrière-plan */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

      {/* Conteneur principal - Ajustement de la largeur pour un rendu plus élégant */}
      <div className="relative z-10 w-full max-w-[420px] px-4 sm:px-0">
        
        {/* Carte Blanche (Padding top 'pt-16' ajouté pour absorber la taille du logo) */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] pt-16 pb-8 px-6 sm:px-10 flex flex-col items-center text-center relative border border-white/20">
          
          {/* Logo M parfaitement intégré au bord de la carte */}
          <div className="absolute -top-12 w-24 h-24 bg-gradient-to-br from-blue-600 to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-900/40 border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300 group">
            <span className="text-white font-black text-5xl group-hover:scale-110 transition-transform duration-300">M</span>
          </div>

          {/* En-tête */}
          <div className="flex justify-center mb-2">
            <span className="bg-orange-50 text-orange-600 text-[10px] font-black tracking-[0.2em] uppercase py-1.5 px-4 rounded-full">
              App
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1.5 tracking-tight">
           MyAcademia
          </h1>
          
          <h3 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-3">
            Content de vous revoir !
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-8 px-1">
            Accédez à votre espace sécurisé pour consulter vos horaires, résultats et gérer vos activités scolaires.
          </p>

          {/* Boutons d'action compactés pour éviter le débordement */}
          <div className="w-full flex flex-col gap-3.5">
            <Link 
              to="/login" 
              className="group relative w-full py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-slate-900 text-white overflow-hidden"
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <LogIn size={18} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative z-10">Se Connecter</span>
            </Link>

            <Link 
              to="/register" 
              className="group w-full py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 bg-slate-50 border-2 border-slate-100 hover:border-blue-600 hover:bg-white text-slate-600 hover:text-blue-700 shadow-sm"
            >
              <UserPlus size={18} className="transition-transform duration-300 group-hover:scale-110" />
              S'inscrire 
            </Link>
          </div>

          {/* Pied de la carte */}
          <div className="mt-6 pt-5 border-t border-slate-100 w-full flex items-center justify-center gap-2 text-slate-400">
            <GraduationCap size={16} className="text-blue-500/70" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Excellence & Discipline
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;