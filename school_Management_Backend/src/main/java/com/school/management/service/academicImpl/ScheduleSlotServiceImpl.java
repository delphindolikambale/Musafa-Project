package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ScheduleSlotCreateDTO;
import com.school.management.dto.academic.ScheduleSlotResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.ScheduleSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleSlotServiceImpl implements ScheduleSlotService {

    private final ScheduleSlotRepository scheduleSlotRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final AcademicYearRepository academicYearRepository;
    private final HourSlotRepository hourSlotRepository;

    @Override
    @Transactional
    public ScheduleSlotResponseDTO addSlot(ScheduleSlotCreateDTO dto) {

        // 0. Vérification de l'enseignant et de ses jours pédagogiques
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new BadRequestException("L'enseignant spécifié n'existe pas."));

        if (teacher.getPedagogicalDays() != null && teacher.getPedagogicalDays().contains(dto.getDayOfWeek())) {
            throw new BadRequestException("Action refusée : Le " + dto.getDayOfWeek()
                    + " est une journée pédagogique (repos) pour l'enseignant " + teacher.getFullName() + ".");
        }

        // Résolution de la tranche horaire demandée
        HourSlot newHourSlot = hourSlotRepository.findById(dto.getHourSlotId())
                .orElseThrow(() -> new BadRequestException("La tranche horaire spécifiée n'existe pas."));

        // HAUTE SÉCURITÉ : Normalisation du libellé pour contrer les IDs différents sur des textes identiques
        String normalizedLabel = newHourSlot.getLabel().replaceAll("\\s+", "").toLowerCase();

        // 1. Isolation & Anti-collision Classe (par le libellé)
        boolean classConflict = scheduleSlotRepository.findBySchoolIdAndClassroomIdAndAcademicYearId(
                        dto.getSchoolId(), dto.getClassroomId(), dto.getAcademicYearId())
                .stream()
                .anyMatch(slot -> Objects.equals(slot.getDayOfWeek(), dto.getDayOfWeek()) &&
                        slot.getHourSlot().getLabel().replaceAll("\\s+", "").toLowerCase().equals(normalizedLabel));

        if (classConflict) {
            throw new BadRequestException("Action refusée : Cette classe a déjà un cours programmé à cette heure (" + newHourSlot.getLabel() + ").");
        }

        // 2. Isolation & Anti-clonage Enseignant (par le libellé, sur l'ensemble de l'école)
        boolean teacherConflict = scheduleSlotRepository.findBySchoolIdAndAcademicYearIdAndTeacherId(
                        dto.getSchoolId(), dto.getAcademicYearId(), dto.getTeacherId())
                .stream()
                .anyMatch(slot -> Objects.equals(slot.getDayOfWeek(), dto.getDayOfWeek()) &&
                        slot.getHourSlot().getLabel().replaceAll("\\s+", "").toLowerCase().equals(normalizedLabel));

        if (teacherConflict) {
            throw new BadRequestException("Action refusée : Cet enseignant est déjà programmé dans une autre classe à cette même heure (" + newHourSlot.getLabel() + ").");
        }

        // 3. Validation stricte du Quota Horaire Hebdomadaire
        TeacherAssignment assignment = teacherAssignmentRepository
                .findBySchoolIdAndClassroomIdAndSubjectIdAndAcademicYearId(dto.getSchoolId(), dto.getClassroomId(), dto.getSubjectId(), dto.getAcademicYearId())
                .orElseThrow(() -> new BadRequestException("Aucune affectation trouvée pour cette matière dans cette classe."));

        long currentScheduledHours = scheduleSlotRepository.countBySchoolIdAndAcademicYearIdAndClassroomIdAndSubjectId(
                dto.getSchoolId(), dto.getAcademicYearId(), dto.getClassroomId(), dto.getSubjectId());

        if (currentScheduledHours >= assignment.getWeeklyHours()) {
            throw new BadRequestException("Quota horaire hebdomadaire atteint ! Cette matière ne peut pas dépasser "
                    + assignment.getWeeklyHours() + "h par semaine.");
        }

        // 4. Enregistrement avec les entités résolues
        Classroom classroom = classroomRepository.findById(dto.getClassroomId()).orElseThrow();
        Subject subject = subjectRepository.findById(dto.getSubjectId()).orElseThrow();
        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId()).orElseThrow();

        ScheduleSlot slot = ScheduleSlot.builder()
                .schoolId(dto.getSchoolId())
                .dayOfWeek(dto.getDayOfWeek())
                .hourSlot(newHourSlot)
                .classroom(classroom)
                .subject(subject)
                .teacher(teacher)
                .academicYear(academicYear)
                .build();

        return mapToResponseDTO(scheduleSlotRepository.save(slot));
    }

    @Override
    @Transactional
    public ScheduleSlotResponseDTO updateSlot(Long schoolId, Long slotId, ScheduleSlotCreateDTO dto) {
        // 0. Validation de l'existence du créneau et cloisonnement SaaS multi-tenant
        ScheduleSlot existingSlot = scheduleSlotRepository.findById(slotId)
                .orElseThrow(() -> new BadRequestException("Créneau introuvable."));

        if (!existingSlot.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("Action non autorisée sur les données de cette école.");
        }

        // Vérification de l'enseignant et de ses jours pédagogiques
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new BadRequestException("L'enseignant spécifié n'existe pas."));

        if (teacher.getPedagogicalDays() != null && teacher.getPedagogicalDays().contains(dto.getDayOfWeek())) {
            throw new BadRequestException("Action refusée : Le " + dto.getDayOfWeek()
                    + " est une journée pédagogique (repos) pour l'enseignant " + teacher.getFullName() + ".");
        }

        // Résolution de la tranche horaire demandée
        HourSlot newHourSlot = hourSlotRepository.findById(dto.getHourSlotId())
                .orElseThrow(() -> new BadRequestException("La tranche horaire spécifiée n'existe pas."));

        String normalizedLabel = newHourSlot.getLabel().replaceAll("\\s+", "").toLowerCase();

        // 1. Anti-collision Classe (En excluant le créneau en cours de modification)
        boolean classConflict = scheduleSlotRepository.findBySchoolIdAndClassroomIdAndAcademicYearId(
                        dto.getSchoolId(), dto.getClassroomId(), dto.getAcademicYearId())
                .stream()
                .filter(slot -> !slot.getId().equals(slotId)) // Ignorer soi-même
                .anyMatch(slot -> Objects.equals(slot.getDayOfWeek(), dto.getDayOfWeek()) &&
                        slot.getHourSlot().getLabel().replaceAll("\\s+", "").toLowerCase().equals(normalizedLabel));

        if (classConflict) {
            throw new BadRequestException("Action refusée : Cette classe a déjà un cours programmé à cette heure (" + newHourSlot.getLabel() + ").");
        }

        // 2. Anti-clonage Enseignant (En excluant le créneau en cours de modification)
        boolean teacherConflict = scheduleSlotRepository.findBySchoolIdAndAcademicYearIdAndTeacherId(
                        dto.getSchoolId(), dto.getAcademicYearId(), dto.getTeacherId())
                .stream()
                .filter(slot -> !slot.getId().equals(slotId)) // Ignorer soi-même
                .anyMatch(slot -> Objects.equals(slot.getDayOfWeek(), dto.getDayOfWeek()) &&
                        slot.getHourSlot().getLabel().replaceAll("\\s+", "").toLowerCase().equals(normalizedLabel));

        if (teacherConflict) {
            throw new BadRequestException("Action refusée : Cet enseignant est déjà programmé dans une autre classe à cette même heure (" + newHourSlot.getLabel() + ").");
        }

        // 3. Validation stricte du Quota Horaire Hebdomadaire
        TeacherAssignment assignment = teacherAssignmentRepository
                .findBySchoolIdAndClassroomIdAndSubjectIdAndAcademicYearId(dto.getSchoolId(), dto.getClassroomId(), dto.getSubjectId(), dto.getAcademicYearId())
                .orElseThrow(() -> new BadRequestException("Aucune affectation trouvée pour cette matière dans cette classe."));

        long currentScheduledHours = scheduleSlotRepository.countBySchoolIdAndAcademicYearIdAndClassroomIdAndSubjectId(
                dto.getSchoolId(), dto.getAcademicYearId(), dto.getClassroomId(), dto.getSubjectId());

        // Si le créneau en cours de modification avait déjà cette matière et cette classe, on le soustrait du total actuel
        if (existingSlot.getClassroom().getId().equals(dto.getClassroomId()) &&
                existingSlot.getSubject().getId().equals(dto.getSubjectId())) {
            currentScheduledHours--;
        }

        if (currentScheduledHours >= assignment.getWeeklyHours()) {
            throw new BadRequestException("Quota horaire hebdomadaire atteint ! Cette matière ne peut pas dépasser "
                    + assignment.getWeeklyHours() + "h par semaine.");
        }

        // 4. Mise à jour des données de l'entité reliée
        Classroom classroom = classroomRepository.findById(dto.getClassroomId()).orElseThrow();
        Subject subject = subjectRepository.findById(dto.getSubjectId()).orElseThrow();
        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId()).orElseThrow();

        existingSlot.setDayOfWeek(dto.getDayOfWeek());
        existingSlot.setHourSlot(newHourSlot);
        existingSlot.setClassroom(classroom);
        existingSlot.setSubject(subject);
        existingSlot.setTeacher(teacher);
        existingSlot.setAcademicYear(academicYear);

        return mapToResponseDTO(scheduleSlotRepository.save(existingSlot));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSlotResponseDTO> getClassroomSchedule(Long schoolId, Long classroomId, Long academicYearId) {
        return scheduleSlotRepository.findBySchoolIdAndClassroomIdAndAcademicYearId(schoolId, classroomId, academicYearId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSlotResponseDTO> getTeacherSchedule(Long schoolId, Long teacherId, Long academicYearId) {
        return scheduleSlotRepository.findBySchoolIdAndAcademicYearIdAndTeacherId(schoolId, academicYearId, teacherId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSlot(Long schoolId, Long slotId) {
        ScheduleSlot slot = scheduleSlotRepository.findById(slotId)
                .orElseThrow(() -> new BadRequestException("Créneau introuvable."));

        if (!slot.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("Action non autorisée sur les données de cette école.");
        }
        scheduleSlotRepository.delete(slot);
    }

    private ScheduleSlotResponseDTO mapToResponseDTO(ScheduleSlot slot) {
        ScheduleSlotResponseDTO dto = new ScheduleSlotResponseDTO();
        dto.setId(slot.getId());
        dto.setSchoolId(slot.getSchoolId());
        dto.setDayOfWeek(slot.getDayOfWeek());

        // Mapping dynamique des configurations horaires héritées
        dto.setHourSlotId(slot.getHourSlot().getId());
        dto.setHourSlot(slot.getHourSlot().getSlotNumber());
        dto.setHourSlotLabel(slot.getHourSlot().getLabel());

        dto.setClassroomId(slot.getClassroom().getId());
        dto.setClassroomName(slot.getClassroom().getDisplayName());
        dto.setSubjectId(slot.getSubject().getId());
        dto.setSubjectName(slot.getSubject().getName());

        dto.setTeacherId(slot.getTeacher().getId());
        dto.setTeacherName(slot.getTeacher().getFullName());
        dto.setTeacherMatricule(slot.getTeacher().getSchoolRegistrationNumber());
        return dto;
    }
}