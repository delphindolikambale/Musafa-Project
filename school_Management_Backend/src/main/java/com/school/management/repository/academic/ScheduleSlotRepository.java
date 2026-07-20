package com.school.management.repository.academic;

import com.school.management.model.academic.ScheduleSlot;
import com.school.management.model.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {

    List<ScheduleSlot> findBySchoolIdAndClassroomIdAndAcademicYearId(Long schoolId, Long classroomId, Long academicYearId);

    // Ajout pour récupérer toutes les affectations d'un enseignant peu importe la classe
    List<ScheduleSlot> findBySchoolIdAndAcademicYearIdAndTeacherId(Long schoolId, Long academicYearId, Long teacherId);

    // Ajustement des signatures de recherche avec hourSlot.id
    boolean existsBySchoolIdAndAcademicYearIdAndDayOfWeekAndHourSlotIdAndTeacherId(Long schoolId, Long academicYearId, DayOfWeek dayOfWeek, Long hourSlotId, Long teacherId);

    boolean existsBySchoolIdAndAcademicYearIdAndDayOfWeekAndHourSlotIdAndClassroomId(Long schoolId, Long academicYearId, DayOfWeek dayOfWeek, Long hourSlotId, Long classroomId);

    long countBySchoolIdAndAcademicYearIdAndClassroomIdAndSubjectId(Long schoolId, Long academicYearId, Long classroomId, Long subjectId);
}