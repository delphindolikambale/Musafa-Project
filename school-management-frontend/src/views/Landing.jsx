import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  ChevronRight, 
  Server, 
  ShieldCheck,
  LockKeyhole,
  Clock
} from 'lucide-react';

const Landing = () => {
  const [time, setTime] = useState(new Date());

  // Horloge en temps réel pour le côté "Dashboard"
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      
      {/* Container principal du logiciel */}
      <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col lg:flex-row min-h-[750px] relative border border-slate-200/60">
        
        {/* --- PANNEAU GAUCHE : IDENTITÉ ET STATUT SYSTÈME --- */}
        <div className="lg:w-[45%] bg-[#0b1120] relative flex flex-col justify-between p-10 lg:p-14 overflow-hidden">
          {/* Dégradés d'ambiance (Vert et Orange selon la charte) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[20%] w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-[40%] -right-[30%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[300px] h-[300px] bg-orange-500/15 rounded-full blur-[100px]"></div>
          </div>

          {/* En-tête / Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-500/30">
                M
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">C.S. MUSAFA</h1>
                <span className="text-xs font-bold text-orange-400 tracking-[0.2em] uppercase">Espace Numérique</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">Système Opérationnel</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                Gestion <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Centralisée</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mt-4">
                Plateforme sécurisée d'administration académique, financière et pédagogique.
              </p>
            </div>
          </div>

          {/* Statut du serveur & Info */}
          <div className="relative z-10 mt-12 pt-8 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Server size={14} />
                  <span className="text-xs uppercase tracking-wider font-bold">Serveur Local</span>
                </div>
                <p className="text-sm font-medium text-white">Connecté (1ms)</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck size={14} />
                  <span className="text-xs uppercase tracking-wider font-bold">Sécurité</span>
                </div>
                <p className="text-sm font-medium text-emerald-400">Chiffrement AES-256</p>
              </div>
              <div className="col-span-2 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-xs uppercase tracking-wider font-bold">Heure Système</span>
                </div>
                <p className="text-sm font-medium text-white tabular-nums">
                  {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PANNEAU DROIT : SÉLECTION DU PORTAIL --- */}
        <div className="lg:w-[55%] bg-white p-10 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-6">
                <LockKeyhole size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Portail d'Accès</h2>
              <p className="text-slate-500 text-sm">Veuillez sélectionner votre module de connexion pour accéder à votre espace de travail.</p>
            </div>

            {/* Cartes d'accès aux modules */}
            <div className="space-y-4">
              
              {/* Module Administration */}
              <Link to="/login" className="block group relative p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Module Administration</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Direction, Secrétariat & Finances</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Module Pédagogique */}
              <Link to="/login" className="block group relative p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Users size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-orange-900 transition-colors">Espace Enseignant</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Gestion des cotes et présences</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Module Élève */}
              <Link to="/login" className="block group relative p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">Portail Élève / Parent</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Consultation des résultats et horaires</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

            </div>

            {/* Footer d'application */}
            <div className="mt-12 text-center">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Projet : Conception et réalisation d'un système de gestion scolaire
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Version 2.0.0 © 2026
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;