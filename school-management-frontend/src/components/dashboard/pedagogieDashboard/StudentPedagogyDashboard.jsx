import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Calendar, CheckCircle, ArrowUpRight, Clock, FileText, Loader2 } from "lucide-react";
import { LanguageContext } from "../../../App";
import { studentDashboardService } from "../../../services/pedagogieService/StudentDashboardService";

const StudentPedagogyDashboard = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  // États de gestion des données
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Extraction sécurisée des identifiants depuis la session
        const userStr = localStorage.getItem('user');
        let currentSchoolId = localStorage.getItem('schoolId');
        let currentAcademicYearId = localStorage.getItem('academicYearId') || localStorage.getItem('currentAcademicYearId');
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            currentSchoolId = currentSchoolId || user?.schoolId;
            currentAcademicYearId = currentAcademicYearId || user?.academicYearId || user?.currentAcademicYearId;
          } catch (e) {
            console.error("Erreur de parsing de l'utilisateur", e);
          }
        }

        // Valeurs de repli
        const finalSchoolId = currentSchoolId || 1;
        const finalAcademicYearId = currentAcademicYearId || 1;

        const data = await studentDashboardService.getDashboardData(finalSchoolId, finalAcademicYearId);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération du tableau de bord:", err);
        setError(language === "FR" ? "Impossible de charger les données du tableau de bord." : "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [language]);

  // Écran de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">
          {language === "FR" ? "Chargement de votre espace..." : "Loading your workspace..."}
        </p>
      </div>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh] w-full">
        <p className="text-red-500 bg-red-50 dark:bg-red-950/30 px-6 py-4 rounded-xl font-bold border border-red-100 dark:border-red-900">
          {error}
        </p>
      </div>
    );
  }

  // Extraction des données du backend
  const totalCourses = dashboardData?.totalCourses || 0;
  const attendanceRate = dashboardData?.attendanceRate || 0;
  const pendingAssignments = dashboardData?.pendingAssignmentsCount || 0;

  // Configuration des cartes de statistiques selon le style Admin
  const stats = [
    { 
      label: language === "FR" ? "COURS SUIVIS" : "ENROLLED COURSES", 
      subLabel: language === "FR" ? "Programme académique actif" : "Active academic curriculum",
      value: totalCourses < 10 && totalCourses > 0 ? `0${totalCourses}` : totalCourses, 
      icon: <GraduationCap />, 
      borderColor: "border-l-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      bottomNote: language === "FR" ? "Matières au programme" : "Registered subjects"
    },
    { 
      label: language === "FR" ? "TAUX DE PRÉSENCE" : "ATTENDANCE RATE", 
      subLabel: language === "FR" ? "Suivi d'assiduité globale" : "Overall attendance rate",
      value: `${attendanceRate}%`, 
      icon: <CheckCircle />, 
      borderColor: "border-l-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bottomNote: language === "FR" ? "Assiduité globale calculée" : "Calculated attendance"
    },
    { 
      label: language === "FR" ? "TP EN ATTENTE" : "PENDING ASSIGNMENTS", 
      subLabel: language === "FR" ? "Devoirs & travaux à soumettre" : "Homework & lab reports to submit",
      value: pendingAssignments < 10 && pendingAssignments > 0 ? `0${pendingAssignments}` : pendingAssignments, 
      icon: <FileText />, 
      borderColor: "border-l-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-950/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      bottomNote: language === "FR" ? "À rendre prochainement" : "Due soon"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* BIENVENUE SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight">
            {language === "FR" ? "Content de vous revoir !" : "Welcome back!"}
          </h1>
          <p className="text-indigo-200 max-w-md text-sm lg:text-base font-medium opacity-90 leading-relaxed">
            {language === "FR" 
              ? "Consultez vos horaires d'examens et n'oubliez pas de remettre vos TP avant l'échéance." 
              : "Check your exam schedule and remember to submit your assignments before the deadline."}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 -skew-x-12 transform translate-x-10 pointer-events-none"></div>
      </div>

      {/* STATS GRID - Adaptation du style Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-y border-r border-slate-100 dark:border-slate-800 border-l-[6px] ${stat.borderColor} transition-all hover:shadow-md flex flex-col justify-between`}
          >
            {/* Header de la carte : Titre, sous-titre et Icône */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                  {stat.label}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                  {stat.subLabel}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
                {React.cloneElement(stat.icon, { size: 22 })}
              </div>
            </div>

            {/* Valeur de la carte */}
            <div className="mt-5 mb-3">
              <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </span>
            </div>

            {/* Séparateur et note inférieure */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
              <span>{stat.bottomNote}</span>
            </div>
          </div>
        ))}
      </div>

      {/* HORAIRE & BULLETIN PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PROCHAINS COURS (Dynamique) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> {language === "FR" ? "Horaire du jour" : "Today's Schedule"}
            </h2>
            <button 
              onClick={() => navigate("/student/schedule")} 
              className="text-blue-600 text-xs font-black uppercase hover:underline transition-all cursor-pointer"
            >
              {language === "FR" ? "Voir tout" : "View all"}
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {dashboardData?.todaySchedule?.length > 0 ? (
              dashboardData.todaySchedule.map((slot, i) => (
                <div 
                  key={slot.slotId || i} 
                  onClick={() => navigate("/student/schedule")}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex gap-4 items-center">
                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm italic border dark:border-slate-700">
                      {slot.timeSlot}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">
                        {slot.subjectName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                        {slot.roomName} • {slot.teacherName}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400 dark:text-slate-500">
                <Calendar size={32} className="mb-3 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  {language === "FR" ? "Aucun cours prévu aujourd'hui" : "No classes scheduled today"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DERNIERS RÉSULTATS (Dynamique) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="text-emerald-500" size={18} /> {language === "FR" ? "Résultats Récents" : "Recent Grades"}
            </h2>
            <button className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase hover:underline">
              {language === "FR" ? "Télécharger" : "Download"}
            </button>
          </div>
          <div className="p-6 overflow-x-auto flex-1">
            {dashboardData?.recentResults?.length > 0 ? (
              <table className="w-full text-left min-w-[300px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b dark:border-slate-800">
                    <th className="pb-3">{language === "FR" ? "Branche" : "Subject"}</th>
                    <th className="pb-3">{language === "FR" ? "Période" : "Period"}</th>
                    <th className="pb-3">{language === "FR" ? "Note" : "Grade"}</th>
                    <th className="pb-3">{language === "FR" ? "Statut" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {dashboardData.recentResults.map((result, i) => (
                    <tr key={result.markId || i} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <td className="py-4 font-black text-slate-800 dark:text-white uppercase tracking-wide">
                        {result.subjectName}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">
                        {result.periodLabel}
                      </td>
                      <td className="py-4 font-black text-blue-600 dark:text-blue-400">
                        {result.scoreDisplay}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                          result.passed 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                        }`}>
                          {language === "FR" 
                            ? (result.passed ? "Réussi" : "Échoué") 
                            : (result.passed ? "Passed" : "Failed")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400 dark:text-slate-500">
                <FileText size={32} className="mb-3 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  {language === "FR" ? "Aucun résultat récent disponible" : "No recent results available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPedagogyDashboard;