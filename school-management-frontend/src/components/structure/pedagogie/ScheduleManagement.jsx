import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Printer, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import scheduleSlotService from '../../../services/pedagogieService/scheduleSlotService';
import hourSlotService from '../../../services/pedagogieService/hourSlotService'; 
import ScheduleCalendar from './ScheduleCalendar'; 
import ScheduleFormModal from './ScheduleFormModal';
import { ClassroomService } from '../../../services/classroomService'; 

const ScheduleManagement = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(''); 
  const [hoursConfig, setHoursConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState(null);

  const schoolId = JSON.parse(localStorage.getItem('user'))?.schoolId || 1;
  const currentAcademicYearId = localStorage.getItem('currentAcademicYearId') || 1;

  useEffect(() => {
    fetchClassrooms();
    fetchHoursConfig();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchSchedule();
    }
  }, [selectedClassroom]);

  const fetchClassrooms = async () => {
    try {
      const res = await ClassroomService.getAll(currentAcademicYearId);
      const classesData = res.data ? res.data : res;
      setClassrooms(classesData || []);
      if (classesData && classesData.length > 0) setSelectedClassroom(classesData[0].id);
    } catch (error) {
      console.error("Erreur chargement classes", error);
    }
  };

  const fetchHoursConfig = async () => {
    try {
      const data = await hourSlotService.getSchoolHourSlots(schoolId);
      setHoursConfig(data.data ? data.data : data);
    } catch (error) {
      console.error("Erreur lors du chargement des tranches horaires", error);
    }
  };

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await scheduleSlotService.getClassroomSchedule(schoolId, selectedClassroom, currentAcademicYearId);
      setScheduleData(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger l\'emploi du temps.',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // HAUTE SÉCURITÉ : Utilisation exclusive de l'horloge pour l'ajout
  const handleCreateHourSlot = async () => {
    const nextSlotNumber = hoursConfig.length + 1;

    const { value: label } = await Swal.fire({
      title: 'Ajouter une tranche horaire',
      html: `
        <div class="text-left space-y-4">
          <p class="text-xs font-bold text-blue-600 uppercase bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg mb-4">
            Créneau automatique : N°${nextSlotNumber}
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Heure de début
              </label>
              <input type="time" id="swal-start-time" class="swal2-input w-full m-0 focus:ring-2 focus:ring-blue-500" style="padding: 0.5rem; height: 3rem;" value="08:00">
            </div>
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Heure de fin
              </label>
              <input type="time" id="swal-end-time" class="swal2-input w-full m-0 focus:ring-2 focus:ring-blue-500" style="padding: 0.5rem; height: 3rem;" value="08:50">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const start = document.getElementById('swal-start-time').value;
        const end = document.getElementById('swal-end-time').value;
        
        if (!start || !end) {
          Swal.showValidationMessage('Veuillez sélectionner l\'heure de début et de fin');
          return false;
        }

        if (start >= end) {
          Swal.showValidationMessage("L'heure de fin doit être supérieure à l'heure de début");
          return false;
        }

        // Génération automatique du libellé pour empêcher l'utilisateur de l'écrire à la main
        const startFormatted = start.replace(':', 'h');
        const endFormatted = end.replace(':', 'h');
        const inputVal = `${startFormatted} - ${endFormatted}`;

        const normalizedInput = inputVal.replace(/\s+/g, '').toLowerCase();
        
        const isDuplicate = hoursConfig.some(h => 
          h.label.replace(/\s+/g, '').toLowerCase() === normalizedInput
        );

        if (isDuplicate) {
          Swal.showValidationMessage(`Sécurité : La tranche "${inputVal}" existe déjà !`);
          return false;
        }

        return inputVal;
      }
    });

    if (label) {
      try {
        await hourSlotService.addHourSlot({
          label: label,
          slotNumber: nextSlotNumber,
          schoolId: schoolId
        });
        Swal.fire('Succès', 'La tranche horaire a été ajoutée.', 'success');
        fetchHoursConfig();
      } catch (error) {
        Swal.fire('Erreur', 'Impossible d\'ajouter la tranche horaire.', 'error');
      }
    }
  };

  // ✅ CORRECTION : Modification d'une tranche horaire avec sélection d'horloge
  const handleEditHour = async (hour) => {
    // Extraction des heures à partir du libellé pour pré-remplir les horloges
    let defaultStart = "08:00";
    let defaultEnd = "08:50";
    
    if (hour.label) {
      const parts = hour.label.split('-').map(p => p.trim());
      if (parts.length === 2) {
        defaultStart = parts[0].replace(/[hH]/g, ':');
        defaultEnd = parts[1].replace(/[hH]/g, ':');
      }
    }

    const { value: label } = await Swal.fire({
      title: 'Modifier la tranche horaire',
      html: `
        <div class="text-left space-y-4">
          <p class="text-xs font-bold text-blue-600 uppercase bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg mb-4">
            Créneau N°${hour.slotNumber || ''}
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Heure de début
              </label>
              <input type="time" id="swal-start-time-edit" class="swal2-input w-full m-0 focus:ring-2 focus:ring-blue-500" style="padding: 0.5rem; height: 3rem;" value="${defaultStart}">
            </div>
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Heure de fin
              </label>
              <input type="time" id="swal-end-time-edit" class="swal2-input w-full m-0 focus:ring-2 focus:ring-blue-500" style="padding: 0.5rem; height: 3rem;" value="${defaultEnd}">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const start = document.getElementById('swal-start-time-edit').value;
        const end = document.getElementById('swal-end-time-edit').value;
        
        if (!start || !end) {
          Swal.showValidationMessage('Veuillez sélectionner l\'heure de début et de fin');
          return false;
        }

        if (start >= end) {
          Swal.showValidationMessage("L'heure de fin doit être supérieure à l'heure de début");
          return false;
        }

        // Génération du libellé final
        const startFormatted = start.replace(':', 'h');
        const endFormatted = end.replace(':', 'h');
        const inputVal = `${startFormatted} - ${endFormatted}`;

        const normalizedInput = inputVal.replace(/\s+/g, '').toLowerCase();
        
        const isDuplicate = hoursConfig.some(h => 
          h.id !== hour.id && h.label.replace(/\s+/g, '').toLowerCase() === normalizedInput
        );

        if (isDuplicate) {
          Swal.showValidationMessage(`Sécurité : La tranche "${inputVal}" existe déjà !`);
          return false;
        }

        return inputVal;
      }
    });

    if (label) {
      try {
        await hourSlotService.updateHourSlot(schoolId, hour.id, {
          label: label,
          slotNumber: hour.slotNumber,
          schoolId: schoolId
        });
        Swal.fire('Succès', 'La tranche horaire a été modifiée.', 'success');
        fetchHoursConfig();
      } catch (error) {
        Swal.fire('Erreur', error.response?.data?.message || 'Impossible de modifier la tranche horaire.', 'error');
      }
    }
  };

  // Gestion de la suppression d'une tranche horaire
  const handleDeleteHour = async (hourId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette tranche horaire sera définitivement supprimée. Les cours liés à cette heure seront impactés !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await hourSlotService.deleteHourSlot(schoolId, hourId);
        Swal.fire('Supprimé !', 'La tranche horaire a été retirée.', 'success');
        fetchHoursConfig();
        fetchSchedule(); 
      } catch (error) {
        Swal.fire('Erreur', error.response?.data?.message || 'Échec de la suppression.', 'error');
      }
    }
  };

  const handleCellClick = (dayOfWeek, hourSlotId, hourSlotNumber, hourSlotLabel) => {
    if (!selectedClassroom) {
      Swal.fire('Attention', 'Veuillez sélectionner une classe d\'abord.', 'warning');
      return;
    }
    // Mode CRÉATION
    setSelectedSlotInfo({ isEditing: false, dayOfWeek, hourSlotId, hourSlotNumber, hourSlotLabel });
    setIsModalOpen(true);
  };

  const handleEditSlot = (slotContent) => {
    // Mode MODIFICATION
    setSelectedSlotInfo({
      isEditing: true,
      slotId: slotContent.id,
      dayOfWeek: slotContent.dayOfWeek,
      hourSlotId: slotContent.hourSlotId,
      hourSlotNumber: slotContent.hourSlot,
      hourSlotLabel: slotContent.hourSlotLabel,
      subjectId: slotContent.subjectId,
      teacherId: slotContent.teacherId
    });
    setIsModalOpen(true);
  };

  const handleDeleteSlot = async (slotId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Ce créneau sera définitivement supprimé !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await scheduleSlotService.deleteSlot(schoolId, slotId);
        Swal.fire('Supprimé !', 'Le créneau a été retiré.', 'success');
        fetchSchedule(); 
      } catch (error) {
        Swal.fire('Erreur', error.response?.data?.message || 'Échec de la suppression.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl shadow-inner">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des Horaires</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <select 
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2"
              >
                <option value="" disabled>Sélectionner une classe</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName || c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleCreateHourSlot}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
          >
            <Clock size={18} /> + Tranche Horaire
          </button>
          <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all">
            <Printer size={18} /> Imprimer
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-4 transition-colors">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ScheduleCalendar 
            scheduleData={scheduleData} 
            onCellClick={handleCellClick} 
            onEditSlot={handleEditSlot}
            onDeleteSlot={handleDeleteSlot} 
            hours={hoursConfig}
            onAddHourRequest={handleCreateHourSlot}
            onEditHour={handleEditHour} 
            onDeleteHour={handleDeleteHour} 
          />
        )}
      </div>

      {isModalOpen && (
        <ScheduleFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          slotInfo={selectedSlotInfo}
          classroomId={selectedClassroom}
          schoolId={schoolId}
          academicYearId={currentAcademicYearId}
          scheduleData={scheduleData}
          onSuccess={() => {
            fetchSchedule();
            setIsModalOpen(false);
            Swal.fire('Succès', 'Opération réussie.', 'success');
          }}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;