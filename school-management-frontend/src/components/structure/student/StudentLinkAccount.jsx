import React, { useState, useContext } from "react";
import { GraduationCap, ShieldCheck, Key, UserCheck, Loader2, ArrowRight, Languages, Sun, Moon } from "lucide-react";
import { ThemeContext, LanguageContext } from "../../../App";
import studentService from "../../../services/studentService";
import { toast } from "react-hot-toast";

const StudentLinkAccount = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  
  const [matricule, setMatricule] = useState("");
  const [schoolPassword, setSchoolPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Récupération de l'utilisateur connecté depuis le localStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matricule.trim() || !schoolPassword.trim()) {
      toast.error(language === "FR" ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
      return;
    }

    if (!currentUser || !currentUser.id) {
      toast.error(language === "FR" ? "Erreur de session. Veuillez vous reconnecter." : "Session error. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      // Appel réel au service de liaison avec l'identifiant, le matricule et le code/mot de passe
      const response = await studentService.linkAccount(currentUser.id, matricule, schoolPassword);
      
      if (response && response.isLinked) {
        // Mettre à jour l'utilisateur en cache local avec ses nouvelles informations de liaison
        const updatedUser = { 
            ...currentUser, 
            isLinked: true, 
            matricule: response.matricule, 
            studentId: response.studentId 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast.success(language === "FR" ? "Compte lié avec succès !" : "Account linked successfully!");
        
        // Utilisation de window.location.href pour forcer un rechargement complet du contexte applicatif
        window.location.href = "/student/dashboard";
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "FR" 
          ? "Matricule ou mot de passe scolaire incorrect." 
          : "Incorrect matricule or school password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300 font-sans">
      {/* HEADER BAR */}
      <header className="p-6 flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <GraduationCap size={22} />
          </div>
          <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Musafa <span className="text-emerald-500 font-medium">Portal</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLanguage} 
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1"
          >
            <Languages size={14} /> {language}
          </button>
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* CENTER CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-xl dark:shadow-2xl/40 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full pointer-events-none"></div>
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {language === "FR" ? "Sécurisation de l'espace" : "Secure Student Portal"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
              {language === "FR" 
                ? "Saisissez vos identifiants d'inscription physique fournis par le Secrétariat de l'établissement." 
                : "Enter your physical registration credentials provided by the establishment's administration."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INPUT MATRICULE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {language === "FR" ? "Numéro Matricule Élève" : "Student Matricule Number"}
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="ex: MSF-2026-0045"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* INPUT MOT DE PASSE SCOLAIRE / CODE SECRET */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {language === "FR" ? "Code secret d'activation" : "Activation Secret Code"}
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={schoolPassword}
                  onChange={(e) => setSchoolPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all group disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span>{language === "FR" ? "Valider & Lier mon espace" : "Verify & Link Space"}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-6 text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} MyAcademia. All rights reserved.
      </footer>
    </div>
  );
};

export default StudentLinkAccount;