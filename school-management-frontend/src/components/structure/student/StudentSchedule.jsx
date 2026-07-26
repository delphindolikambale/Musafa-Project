import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import AuthService from '../../../services/auth.service';
import studentService from '../../../services/studentService';
import enrollmentService from '../../../services/enrollmentService';
import scheduleSlotService from '../../../services/pedagogieService/scheduleSlotService';
import hourSlotService from '../../../services/pedagogieService/hourSlotService';
import ScheduleCalendar from '../pedagogie/ScheduleCalendar';

const StudentSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [hoursConfig, setHoursConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentClassroomName, setStudentClassroomName] = useState('');

  useEffect(() => {
    const fetchStudentDataAndSchedule = async () => {
      setIsLoading(true);
      try {
        // 1. Récupération de l'utilisateur connecté via le localStorage
        const user = AuthService.getCurrentUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const userId = user.id || user.userId || user.idUser;
        const schoolId = user.schoolId || 1;
        const currentAcademicYearId = localStorage.getItem('currentAcademicYearId') || 1;

        if (!userId) {
          setIsLoading(false);
          return;
        }

        // 2. Récupération de la fiche élève pour obtenir son ID d'élève (ex: ID 55)
        const studentRes = await studentService.getStudentByUserId(userId);
        const studentData = studentRes?.data ? studentRes.data : studentRes;
        const studentId = studentData?.id;

        let classroomId = null;
        let classroomName = null;

        // 3. Passage par le service d'inscription (Enrollment) pour retrouver la classe de cet élève
        if (studentId) {
          try {
            const enrollmentsRes = await enrollmentService.getAllEnrollments(currentAcademicYearId);
            const enrollmentsList = Array.isArray(enrollmentsRes) ? enrollmentsRes : (enrollmentsRes?.data || []);

            // Recherche de l'inscription correspondant à l'élève connecté
            const studentEnrollment = enrollmentsList.find(e => 
              e.student?.id === studentId || 
              e.studentId === studentId || 
              e.student?.matricule === studentData.matricule
            );

            if (studentEnrollment) {
              classroomId = studentEnrollment.classroom?.id || studentEnrollment.classroomId;
              classroomName = studentEnrollment.classroom?.displayName || 
                              studentEnrollment.classroom?.name || 
                              studentEnrollment.classroomName;
            }
          } catch (enrollErr) {
            console.error("Erreur lors de la récupération des inscriptions de l'année:", enrollErr);
          }
        }

        setStudentClassroomName(classroomName || 'Ma Classe');

        // 4. Si la classe est identifiée, chargement des heures et des créneaux
        if (classroomId) {
          try {
            const hoursRes = await hourSlotService.getSchoolHourSlots(schoolId);
            const hoursArray = Array.isArray(hoursRes) ? hoursRes : (hoursRes?.data || []);
            setHoursConfig(hoursArray);
          } catch (hErr) {
            console.error("Erreur lors du chargement des tranches horaires:", hErr);
          }

          try {
            const scheduleRes = await scheduleSlotService.getClassroomSchedule(schoolId, classroomId, currentAcademicYearId);
            const scheduleArray = Array.isArray(scheduleRes) ? scheduleRes : (scheduleRes?.data || []);
            setScheduleData(scheduleArray);
          } catch (sErr) {
            console.error("Erreur lors du chargement des créneaux de l'emploi du temps:", sErr);
          }
        } else {
          console.warn(`Aucune inscription active trouvée pour l'élève ID #${studentId} sur l'année académique #${currentAcademicYearId}`);
        }
      } catch (error) {
        console.error("Erreur globale lors du chargement de l'emploi du temps de l'élève:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentDataAndSchedule();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* En-tête : Espace Élève */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Mon Emploi du Temps</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Classe actuelle :</span>
              {isLoading ? (
                <span className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse inline-block"></span>
              ) : (
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-lg">
                  {studentClassroomName}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions élèves */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all">
            <Printer size={18} /> Imprimer
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Grille Horaire */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-4 transition-colors">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ScheduleCalendar 
            scheduleData={scheduleData} 
            hours={hoursConfig}
            isReadOnly={true}
          />
        )}
      </div>

    </div>
  );
};

export default StudentSchedule;