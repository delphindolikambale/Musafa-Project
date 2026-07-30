import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import scheduleSlotService from '../../../services/pedagogieService/scheduleSlotService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';
import TeacherService from '../../../services/pedagogieService/TeacherService';

const ScheduleFormModal = ({ 
  isOpen, 
  onClose, 
  slotInfo = null, 
  classroomId = null, 
  schoolId, 
  academicYearId, 
  onSuccess, 
  scheduleData = [],
  nextSlotNumber = 1,
  mode // Optionnel : 'hourSlot' | 'course'
}) => {
  // Détection automatique du mode (Configuration de Tranche Horaire VS Affectation de Cours)
  const isHourSlotMode = mode === 'hourSlot' || 
    slotInfo?.isHourSlotConfig || 
    slotInfo?.mode === 'hourSlot' || 
    (!classroomId && !slotInfo?.dayOfWeek);

  // --- États pour le mode "Affectation de Cours" ---
  const [assignments, setAssignments] = useState([]);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [formData, setFormData] = useState({ subjectId: '', teacherId: '' });

  // --- États pour le mode "Configuration Tranche Horaire" ---
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:50');
  const [slotNumber, setSlotNumber] = useState(nextSlotNumber);

  // --- État commun ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatage de sécurité pour <input type="time"> (ex: "07h30" -> "07:30")
  const formatToTimeInput = (str) => {
    if (!str) return '08:00';
    const clean = str.replace(/[hH]/g, ':').trim();
    const [h, m] = clean.split(':');
    if (h && m !== undefined) {
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    }
    return '08:00';
  };

  // Génération du libellé d'affichage (ex: "07:30" -> "07h30 - 08h30")
  const formatLabel = (start, end) => {
    const startFormatted = start.replace(':', 'h');
    const endFormatted = end.replace(':', 'h');
    return `${startFormatted} - ${endFormatted}`;
  };

  // 1. Initialisation selon le mode actif
  useEffect(() => {
    if (!isOpen) return;

    if (isHourSlotMode) {
      // MODE TRANCHE HORAIRE
      if (slotInfo && (slotInfo.label || slotInfo.hourSlotLabel)) {
        const labelToParse = slotInfo.label || slotInfo.hourSlotLabel || '';
        const parts = labelToParse.split('-').map(p => p.trim());
        
        if (parts.length === 2) {
          setStartTime(formatToTimeInput(parts[0]));
          setEndTime(formatToTimeInput(parts[1]));
        } else {
          setStartTime('08:00');
          setEndTime('08:50');
        }
        setSlotNumber(slotInfo.slotNumber || slotInfo.hourSlotNumber || nextSlotNumber);
      } else {
        setStartTime('08:00');
        setEndTime('08:50');
        setSlotNumber(nextSlotNumber);
      }
    } else {
      // MODE PROGRAMMATION DE COURS
      if (classroomId && academicYearId) {
        setSelectedAssignmentId('');
        setFormData({ subjectId: '', teacherId: '' });
        loadCourseDependencies();
      }
    }
  }, [isOpen, classroomId, academicYearId, isHourSlotMode, slotInfo, nextSlotNumber]);

  // 2. Filtrage des cours & enseignants pour le mode Programmation de Cours
  useEffect(() => {
    if (isHourSlotMode) return;

    if (assignments.length > 0) {
      const filtered = assignments.filter(a => {
        const subjectId = a.subjectId;
        const maxHoursPerWeek = a.weeklyHours || 99; 
        
        // Contrôle du quota horaire hebdomadaire
        const scheduledCount = scheduleData.filter(slot => slot.subjectId === subjectId).length;
        const isCurrentSubject = slotInfo?.isEditing && subjectId === slotInfo.subjectId;
        const quotaOk = isCurrentSubject || (scheduledCount < maxHoursPerWeek);

        // Vérification du Jour Pédagogique (Jour de repos)
        const pedaDays = a.pedagogicalDays || a.teacherPedagogicalDays || a.teacher?.pedagogicalDays || [];
        const isPedagogicalDay = pedaDays.some(
          day => day?.toString().trim().toUpperCase() === slotInfo?.dayOfWeek?.toString().trim().toUpperCase()
        );

        return quotaOk && !isPedagogicalDay;
      });

      setAvailableAssignments(filtered);

      // Pré-sélection en mode Modification
      if (slotInfo?.isEditing && !selectedAssignmentId) {
        const matchingAssignment = filtered.find(a => 
          a.subjectId === slotInfo.subjectId && a.teacherId === slotInfo.teacherId
        );
        if (matchingAssignment) {
          setSelectedAssignmentId(matchingAssignment.id.toString());
          setFormData({
            subjectId: matchingAssignment.subjectId,
            teacherId: matchingAssignment.teacherId
          });
        }
      }
    } else {
      setAvailableAssignments([]);
    }
  }, [assignments, scheduleData, slotInfo, isHourSlotMode]);

  // Chargement des données pour le mode Programmation de Cours
  const loadCourseDependencies = async () => {
    try {
      const [assignData, teachersData] = await Promise.all([
        TeacherAssignmentService.getAssignmentsByClass(classroomId, academicYearId),
        TeacherService.getActiveTeachers().catch(() => [])
      ]);

      const enrichedAssignments = (assignData || []).map(assign => {
        const teacherObj = (teachersData || []).find(t => t.id === assign.teacherId);
        return {
          ...assign,
          pedagogicalDays: assign.pedagogicalDays || assign.teacherPedagogicalDays || teacherObj?.pedagogicalDays || []
        };
      });

      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error("Erreur de chargement des affectations :", error);
      Swal.fire('Erreur', 'Impossible de charger les cours affectés à cette classe.', 'error');
    }
  };

  // Changement de la sélection dans le dropdown de cours
  const handleAssignmentChange = (e) => {
    const assignId = e.target.value;
    setSelectedAssignmentId(assignId);

    if (assignId) {
      const selected = availableAssignments.find(a => a.id.toString() === assignId);
      if (selected) {
        setFormData({
          subjectId: selected.subjectId || '',
          teacherId: selected.teacherId || ''
        });
      }
    } else {
      setFormData({ subjectId: '', teacherId: '' });
    }
  };

  // --- Soumission du formulaire ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isHourSlotMode) {
      await handleSubmitHourSlot();
    } else {
      await handleSubmitCourse();
    }
  };

  // Enregistrement : Mode Tranche Horaire
  const handleSubmitHourSlot = async () => {
    if (!startTime || !endTime) {
      Swal.fire('Attention', 'Veuillez renseigner les heures de début et de fin.', 'warning');
      return;
    }

    if (startTime >= endTime) {
      Swal.fire('Erreur de saisie', "L'heure de fin doit être strictement supérieure à l'heure de début.", 'error');
      return;
    }

    const generatedLabel = formatLabel(startTime, endTime);
    const payload = {
      schoolId: schoolId,
      academicYearId: academicYearId,
      slotNumber: parseInt(slotNumber, 10),
      label: generatedLabel
    };

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(slotInfo && (slotInfo.id || slotInfo.hourSlotId) && slotInfo.isEditing);
      const targetId = slotInfo?.id || slotInfo?.hourSlotId;

      if (isEditing) {
        if (scheduleSlotService.updateHourSlot) {
          await scheduleSlotService.updateHourSlot(schoolId, targetId, payload);
        } else if (scheduleSlotService.updateSlot) {
          await scheduleSlotService.updateSlot(schoolId, targetId, payload);
        }
      } else {
        if (scheduleSlotService.addHourSlot) {
          await scheduleSlotService.addHourSlot(payload);
        } else if (scheduleSlotService.addSlot) {
          await scheduleSlotService.addSlot(payload);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Succès !',
        text: `La tranche horaire (${generatedLabel}) a été enregistrée avec succès.`,
        timer: 2000,
        showConfirmButton: false
      });

      if (onSuccess) onSuccess(payload);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la tranche horaire :", error);
      const errorMessage = error.response?.data?.message || "Impossible d'enregistrer la tranche horaire.";
      Swal.fire('Action impossible', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enregistrement : Mode Programmation de Cours
  const handleSubmitCourse = async () => {
    if (!formData.subjectId || !formData.teacherId) {
      Swal.fire('Erreur', 'Veuillez sélectionner un cours valide.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        schoolId: schoolId,
        academicYearId: academicYearId,
        classroomId: classroomId,
        dayOfWeek: slotInfo.dayOfWeek,
        hourSlotId: slotInfo.hourSlotId, 
        subjectId: formData.subjectId,
        teacherId: formData.teacherId
      };

      if (slotInfo?.isEditing) {
        await scheduleSlotService.updateSlot(schoolId, slotInfo.slotId, payload);
      } else {
        await scheduleSlotService.addSlot(payload);
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du créneau de cours :", error);
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.";
      Swal.fire('Action impossible', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentLabelPreview = formatLabel(startTime, endTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* En-tête du Modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              {isHourSlotMode ? (
                slotInfo?.isEditing ? 'Modifier la tranche horaire' : 'Ajouter une tranche horaire'
              ) : (
                slotInfo?.isEditing ? 'Modifier le cours' : 'Programmer un cours'
              )}
            </h3>
            {isHourSlotMode && (
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Configuration du créneau dans la grille du temps
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire Hybride */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* ==================== RENDU : MODE TRANCHE HORAIRE ==================== */}
          {isHourSlotMode ? (
            <>
              {/* Badge Numéro de Tranche */}
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 block">
                    POSITION DANS L'EMPLOI DU TEMPS
                  </span>
                  <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200">
                    Tranche Horaire N° {slotNumber}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  {slotNumber}
                </div>
              </div>

              {/* Sélection Heures de Début et Fin */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                      Heure de début
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 font-bold rounded-xl focus:ring-2 focus:ring-blue-500 p-3.5 text-sm"
                      />
                      <Clock size={18} className="absolute right-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                      Heure de fin
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 font-bold rounded-xl focus:ring-2 focus:ring-blue-500 p-3.5 text-sm"
                      />
                      <Clock size={18} className="absolute right-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Aperçu Dynamique */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block mb-0.5 uppercase tracking-wider">
                    Aperçu du libellé généré
                  </span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">
                    {currentLabelPreview}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* ==================== RENDU : MODE PROGRAMMATION DE COURS ==================== */
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                  Jour : {slotInfo?.dayOfWeek} <br/>
                  Heure : {slotInfo?.hourSlotLabel} (Créneau n°{slotInfo?.hourSlotNumber}) 
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    Cours & Enseignant disponible
                  </label>
                  <select 
                    value={selectedAssignmentId}
                    onChange={handleAssignmentChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 p-3"
                  >
                    <option value="">-- Choisir un cours affecté --</option>
                    {availableAssignments.map(a => {
                      const subjectName = a.subjectName || 'Matière inconnue';
                      const teacherName = a.teacherFullName || a.teacherName || 'Enseignant inconnu';
                      const matriculeStr = a.teacherMatricule ? ` - ${a.teacherMatricule}` : '';
                      
                      return (
                        <option key={a.id} value={a.id}>
                          {subjectName} ({teacherName}{matriculeStr})
                        </option>
                      );
                    })}
                  </select>
                  
                  {assignments.length === 0 ? (
                    <p className="text-xs text-orange-500 mt-2 font-semibold">
                      Aucune affectation trouvée pour cette classe. Veuillez d'abord affecter des enseignants.
                    </p>
                  ) : availableAssignments.length === 0 ? (
                    <p className="text-xs text-red-500 mt-2 font-semibold">
                      ⚠️ Aucun enseignant disponible ce {slotInfo?.dayOfWeek} (enseignants en journée pédagogique ou quotas d'heures hebdomadaires atteints).
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {/* Bouton de Validation Commun */}
          <button 
            type="submit" 
            disabled={
              isSubmitting || 
              (!isHourSlotMode && (availableAssignments.length === 0 || !selectedAssignmentId))
            }
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white p-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} /> 
                {isHourSlotMode ? (
                  slotInfo?.isEditing ? 'Mettre à jour la tranche' : 'Enregistrer la tranche'
                ) : (
                  slotInfo?.isEditing ? 'Mettre à jour le créneau' : 'Enregistrer le créneau'
                )}
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ScheduleFormModal;