import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, RefreshCw, UserCheck, Phone, Clock, CalendarDays } from 'lucide-react';
import ScheduleCalendar from './ScheduleCalendar';
import scheduleSlotService from '../../../services/pedagogieService/scheduleSlotService';
import hourSlotService from '../../../services/pedagogieService/hourSlotService';
import TeacherService from "../../../services/pedagogieService/TeacherService";

const MyScheduleTeacher = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [hours, setHours] = useState([]);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tranches horaires par défaut
  const defaultHours = [
    { id: 1, slotNumber: 1, label: '07h30 - 08h20' },
    { id: 2, slotNumber: 2, label: '08h20 - 09h10' },
    { id: 3, slotNumber: 3, label: '09h10 - 10h00' },
    { id: 4, slotNumber: 4, label: '10h20 - 11h10' },
    { id: 5, slotNumber: 5, label: '11h10 - 12h00' },
    { id: 6, slotNumber: 6, label: '12h00 - 12h50' },
    { id: 7, slotNumber: 7, label: '12h50 - 13h40' }
  ];

  const DAY_LABELS = {
    LUNDI: 'Lundi',
    MARDI: 'Mardi',
    MERCREDI: 'Mercredi',
    JEUDI: 'Jeudi',
    VENDREDI: 'Vendredi',
    SAMEDI: 'Samedi'
  };

  // Lecture dynamique des clés de session local storage
  const getUserSessionData = () => {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      console.error("Erreur de lecture dans localStorage", e);
    }

    const schoolId = 
      localStorage.getItem('schoolId') || 
      localStorage.getItem('selectedSchoolId') || 
      user.schoolId || 
      user.school?.id;

    const academicYearId = 
      localStorage.getItem('currentAcademicYearId') || 
      localStorage.getItem('academicYearId') || 
      localStorage.getItem('selectedAcademicYearId') || 
      localStorage.getItem('activeAcademicYearId') || 
      user.academicYearId || 
      user.currentAcademicYearId ||
      user.academicYear?.id ||
      user.school?.academicYearId;

    const teacherId = 
      user.teacherId || 
      user.teacher?.id || 
      localStorage.getItem('teacherId') || 
      user.id;

    return { schoolId, academicYearId, teacherId, user };
  };

  const fetchScheduleAndHours = async () => {
    const { schoolId, academicYearId, teacherId, user } = getUserSessionData();

    if (!schoolId) {
      setError("École introuvable dans la session (schoolId). Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Charger les détails du profil enseignant
      if (teacherId) {
        try {
          const teacherProfile = await TeacherService.getTeacherById(teacherId);
          setTeacherDetails(teacherProfile);
        } catch (tErr) {
          console.warn("Impossible d'obtenir les détails du profil enseignant via l'API", tErr);
          setTeacherDetails({
            firstName: user.firstName || user.name || '',
            lastName: user.lastName || '',
            middleName: user.middleName || '',
            phoneNumber: user.phoneNumber || user.phone || 'N/A',
            pedagogicalDays: user.pedagogicalDays || []
          });
        }
      }

      // 2. Charger les créneaux horaires
      let fetchedHours = defaultHours;
      try {
        if (hourSlotService && typeof hourSlotService.getAll === 'function') {
          const hoursResponse = await hourSlotService.getAll(schoolId);
          if (hoursResponse && hoursResponse.length > 0) fetchedHours = hoursResponse;
        } else if (hourSlotService && typeof hourSlotService.getHourSlots === 'function') {
          const hoursResponse = await hourSlotService.getHourSlots(schoolId);
          if (hoursResponse && hoursResponse.length > 0) fetchedHours = hoursResponse;
        }
      } catch (hErr) {
        console.warn("Erreur chargement tranches horaires, utilisation des valeurs par défaut.", hErr);
      }
      
      setHours(fetchedHours); 

      // 3. Charger l'emploi du temps de l'enseignant
      if (!academicYearId || !teacherId) {
        const missingKeys = [];
        if (!academicYearId) missingKeys.push("Année académique");
        if (!teacherId) missingKeys.push("Identifiant Enseignant");
        setError(`Données de session manquantes : [${missingKeys.join(', ')}].`);
        setLoading(false);
        return;
      }

      const scheduleResponse = await scheduleSlotService.getTeacherSchedule(schoolId, teacherId, academicYearId);
      setScheduleData(scheduleResponse || []);
      
    } catch (err) {
      console.error("Erreur lors de la récupération du calendrier:", err);
      setError("Impossible de charger l'emploi du temps. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleAndHours();
  }, []);

  const getTeacherFullName = () => {
    if (!teacherDetails) return 'N/A';
    const parts = [teacherDetails.firstName, teacherDetails.middleName, teacherDetails.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const getPedagogicalDaysFormatted = () => {
    if (!teacherDetails || !teacherDetails.pedagogicalDays || teacherDetails.pedagogicalDays.length === 0) {
      return 'Aucune';
    }
    return teacherDetails.pedagogicalDays
      .map(day => DAY_LABELS[day] || day)
      .join(' & ');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <Calendar size={24} />
            </div>
            Mon Emploi du Temps
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-14">
            Consultez votre grille horaire hebdomadaire et vos affectations par classe.
          </p>
        </div>

        <button 
          onClick={fetchScheduleAndHours}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-semibold"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Cartouche FICHE DE CHARGE HORAIRE */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-blue-900/40">
        <div className="text-center pb-3 border-b border-blue-800/50 mb-4">
          <h2 className="text-lg font-black tracking-wider uppercase text-blue-200">
            Fiche de Charge Horaire
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-xl border border-blue-800/30">
            <UserCheck className="text-blue-400 shrink-0" size={20} />
            <div>
              <span className="text-blue-300 font-semibold block uppercase text-[10px]">Enseignant</span>
              <span className="font-bold text-sm text-white">{getTeacherFullName()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-xl border border-blue-800/30">
            <Phone className="text-blue-400 shrink-0" size={20} />
            <div>
              <span className="text-blue-300 font-semibold block uppercase text-[10px]">Contact</span>
              <span className="font-bold text-sm text-white">{teacherDetails?.phoneNumber || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-xl border border-blue-800/30">
            <Clock className="text-blue-400 shrink-0" size={20} />
            <div>
              <span className="text-blue-300 font-semibold block uppercase text-[10px]">Nombre d'heures</span>
              <span className="font-bold text-sm text-white">{scheduleData.length} Heures / semaine</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-xl border border-blue-800/30">
            <CalendarDays className="text-blue-400 shrink-0" size={20} />
            <div>
              <span className="text-blue-300 font-semibold block uppercase text-[10px]">Journée Pédagogique</span>
              <span className="font-bold text-sm text-white">{getPedagogicalDaysFormatted()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Grille Horaire avec variante "teacher" */}
      {loading && hours.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement de votre grille horaire...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
          <ScheduleCalendar 
            scheduleData={scheduleData}
            hours={hours}
            isReadOnly={true}
            variant="teacher"
          />
        </div>
      )}
    </div>
  );
};

export default MyScheduleTeacher;