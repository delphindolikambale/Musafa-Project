import React, { useState, useEffect } from 'react';
import pedagogieDashboardService from '../../../services/pedagogieService/pedagogieDashboardService';
import { 
  Users, 
  School, 
  BookOpen, 
  UserCheck, 
  FileSpreadsheet, 
  UserPlus, 
  Loader2, 
  GraduationCap, 
  Phone, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const PedagogieDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedagogyData = async () => {
      try {
        setLoading(true);
        const res = await pedagogieDashboardService.getPedagogyStats();
        
        // ✅ LOG DE DÉBOGAGE : Regardez dans la console de votre navigateur (Touche F12)
        console.log("📥 Données du Dashboard reçues depuis le Backend :", res.data);
        
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des données pédagogiques:", err);
        
        // Affinage du message d'erreur pour une meilleure lisibilité
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           setError("Accès refusé : Vérifiez que votre rôle vous autorise à voir ces statistiques.");
        } else {
           setError("Impossible de charger les données du tableau de bord. La connexion au serveur a échoué.");
        }
        
        setStats({
          totalTeachers: 0,
          totalMaleTeachers: 0,
          totalFemaleTeachers: 0,
          totalActiveClasses: 0,
          totalRegisteredCourses: 0,
          totalAssignedCourses: 0,
          totalGradeSheetsReceived: 0,
          recentTeachers: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPedagogyData();
  }, []);

  // Configuration des 5 Cartes de statistiques adaptées au style visuel requis
  const statCards = [
    {
      title: "NOMBRE TOTAL ENSEIGNANTS",
      subtitle: "Effectif global de l'établissement",
      value: stats?.totalTeachers || 0,
      footerText: `Masculin : ${stats?.totalMaleTeachers || 0} • Féminin : ${stats?.totalFemaleTeachers || 0}`,
      icon: <Users size={20} />,
      colorClass: "bg-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-500"
    },
    {
      title: "CLASSES ACTIVES",
      subtitle: "Salles & divisions opérationnelles",
      value: stats?.totalActiveClasses || 0,
      footerText: "Salles de classe en cours de fonctionnement",
      icon: <School size={20} />,
      colorClass: "bg-indigo-500",
      iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
      iconColor: "text-indigo-500"
    },
    {
      title: "COURS ENREGISTRÉS",
      subtitle: "Catalogue des matières du système",
      value: stats?.totalRegisteredCourses || 0,
      footerText: "Total des unités d'enseignement configurées",
      icon: <BookOpen size={20} />,
      colorClass: "bg-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-500"
    },
    {
      title: "COURS AFFECTÉS",
      subtitle: "Attribués aux enseignants",
      value: stats?.totalAssignedCourses || 0,
      footerText: `${Math.round(((stats?.totalAssignedCourses || 0) / (stats?.totalRegisteredCourses || 1)) * 100)}% du programme attribué`,
      icon: <UserCheck size={20} />,
      colorClass: "bg-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-500"
    },
    {
      title: "FICHES DE NOTES REÇUES",
      subtitle: "Validations académiques transmises",
      value: stats?.totalGradeSheetsReceived || 0,
      footerText: "Fiches de cotes validées par les titulaires",
      icon: <FileSpreadsheet size={20} />,
      colorClass: "bg-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-500">
      
      {/* EN-TÊTE DU TABLEAU DE BORD */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
            Espace Gestionnaire - Tableau de Bord Pédagogique
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Gérez le capital intellectuel et le suivi académique de l'établissement.
          </p>
        </div>
        <div className="self-start sm:self-auto bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">Statut Système</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Année Académique Active
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* SECTION DES 5 CARTES EN GRILLE RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-300"
          >
            {/* Bordure colorée sur le côté gauche */}
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${card.colorClass}`}></div>

            <div className="flex justify-between items-start pl-2">
              <div className="pr-2">
                <h4 className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
                  {card.title}
                </h4>
                {card.subtitle && (
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pl-2">
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {card.value}
                  </span>
                </div>
              )}

              {card.footerText && !loading && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                  {card.footerText}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION PRINCIPALE (PERFORMANCE & DERNIERS ENSEIGNANTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOC GAUCHE : SUIVI ET PERFORMANCE PÉDAGOGIQUE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                Performance & Charge Pédagogique
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase">
                Répartition des cours et attribution par section
              </p>
            </div>
            <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase">
              Synthèse globale
            </span>
          </div>

          <div className="min-h-[280px] flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/60 p-6 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Analyse des Couvertures de Cours
            </h4>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-md mt-1">
              Les statistiques démontrent un taux d'affectation de <span className="text-blue-600 font-bold">{Math.round(((stats?.totalAssignedCourses || 0) / (stats?.totalRegisteredCourses || 1)) * 100)}%</span> des matières sur l'ensemble des {stats?.totalActiveClasses || 0} classes actives.
            </p>
          </div>
        </div>

        {/* BLOC DROITE : LES DERNIERS ENSEIGNANTS ENREGISTRÉS */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-tight">
                  Les Derniers Enseignants Enregistrés dans l'établissement
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="animate-spin w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Chargement du personnel...</span>
              </div>
            ) : stats?.recentTeachers && stats.recentTeachers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTeachers.map((teacher) => (
                  <div 
                    key={teacher.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100/80 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        {teacher.fullName ? teacher.fullName.substring(0, 2).toUpperCase() : "ENS"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                          {teacher.fullName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          <span className="uppercase text-blue-600 dark:text-blue-400">{teacher.registrationNumber}</span>
                          <span>•</span>
                          <span className="truncate">{teacher.speciality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      {teacher.phone && (
                        <a 
                          href={`tel:${teacher.phone}`} 
                          title={teacher.phone}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors border border-slate-200 dark:border-slate-600"
                        >
                          <Phone size={12} />
                        </a>
                      )}
                      <span className={`w-2 h-2 rounded-full ${teacher.active ? 'bg-emerald-500' : 'bg-slate-300'}`} title={teacher.active ? "Actif" : "Inactif"}></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs font-bold">
                Aucun enseignant répertorié récemment.
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400">
            <span>Mise à jour en temps réel</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 size={12} /> Données vérifiées
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PedagogieDashboard;