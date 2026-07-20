import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import scheduleSlotService from '../../../services/pedagogieService/scheduleSlotService';
import TeacherAssignmentService from '../../../services/pedagogieService/TeacherAssignmentService';

const ScheduleFormModal = ({ isOpen, onClose, slotInfo, classroomId, schoolId, academicYearId, onSuccess, scheduleData = [] }) => {
  const [assignments, setAssignments] = useState([]);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '', 
    teacherId: ''
  });

  // Initialisation à l'ouverture du modal
  useEffect(() => {
    if (isOpen && classroomId && academicYearId) {
      setSelectedAssignmentId('');
      setFormData({ subjectId: '', teacherId: '' });
      loadDependencies();
    }
  }, [isOpen, classroomId, academicYearId, slotInfo?.isEditing, slotInfo?.slotId]);

  // Logique de filtrage des quotas et auto-sélection en mode Modification
  useEffect(() => {
    if (assignments.length > 0) {
      const filtered = assignments.filter(a => {
        const subjectId = a.subjectId;
        const maxHoursPerWeek = a.weeklyHours || 99; 
        
        // On compte combien de fois ce cours est déjà programmé
        const scheduledCount = scheduleData.filter(slot => slot.subjectId === subjectId).length;
        
        // EXCEPTION : Si on est en train de modifier ce cours précis, on l'autorise même si le quota est atteint
        const isCurrentSubject = slotInfo?.isEditing && subjectId === slotInfo.subjectId;
        
        return isCurrentSubject || (scheduledCount < maxHoursPerWeek);
      });
      setAvailableAssignments(filtered);

      // Si on est en mode Modification, on pré-remplit le select avec les données existantes
      if (slotInfo?.isEditing && !selectedAssignmentId) {
        const matchingAssignment = assignments.find(a => 
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
    }
  }, [assignments, scheduleData, slotInfo]);

  const loadDependencies = async () => {
    try {
      const assignData = await TeacherAssignmentService.getAssignmentsByClass(classroomId, academicYearId);
      setAssignments(assignData || []);
    } catch (error) {
      console.error("Erreur de chargement des affectations", error);
      Swal.fire('Erreur', 'Impossible de charger les cours affectés à cette classe.', 'error');
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Si mode édition on utilise PUT (updateSlot), sinon POST (addSlot)
      if (slotInfo.isEditing) {
        await scheduleSlotService.updateSlot(schoolId, slotInfo.slotId, payload);
      } else {
        await scheduleSlotService.addSlot(payload);
      }
      
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.';
      Swal.fire('Action impossible', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            {slotInfo?.isEditing ? 'Modifier le cours' : 'Programmer un cours'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Jour : {slotInfo?.dayOfWeek} <br/>
              Heure : {slotInfo?.hourSlotLabel} (Créneau n°{slotInfo?.hourSlotNumber}) 
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Cours & Enseignant affecté</label>
              <select 
                value={selectedAssignmentId}
                onChange={handleAssignmentChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 p-3"
              >
                <option value="">-- Choisir un cours affecté --</option>
                {availableAssignments.map(a => {
                  const subjectName = a.subjectName || 'Matière inconnue';
                  const teacherName = a.teacherFullName || 'Enseignant inconnu';
                  const matriculeStr = a.teacherMatricule ? ` - ${a.teacherMatricule}` : '';
                  
                  return (
                    <option key={a.id} value={a.id}>
                      {subjectName} ({teacherName}{matriculeStr})
                    </option>
                  );
                })}
              </select>
              {assignments.length === 0 ? (
                <p className="text-xs text-orange-500 mt-2 font-semibold">Aucune affectation trouvée pour cette classe. Veuillez d'abord affecter des enseignants.</p>
              ) : availableAssignments.length === 0 ? (
                <p className="text-xs text-green-600 mt-2 font-semibold">Tous les quotas horaires hebdomadaires pour cette classe ont été atteints.</p>
              ) : null}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || availableAssignments.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-4 rounded-xl font-bold transition-colors"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} /> 
                {slotInfo?.isEditing ? 'Mettre à jour le créneau' : 'Enregistrer le créneau'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleFormModal;