package com.school.management.repository.academic;

import com.school.management.model.academic.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findByAcademicYearIdAndSchoolId(Long yearId, Long schoolId);
    List<TeacherAssignment> findByTeacherIdAndAcademicYearIdAndSchoolId(Long teacherId, Long yearId, Long schoolId);
    List<TeacherAssignment> findByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long yearId, Long schoolId);

    Optional<TeacherAssignment> findByCourseAssignmentIdAndClassroomIdAndSchoolId(Long courseId, Long classroomId, Long schoolId);

    @Query("SELECT t FROM TeacherAssignment t WHERE t.school.id = :schoolId " +
            "AND t.classroom.id = :classroomId " +
            "AND t.courseAssignment.subject.id = :subjectId " +
            "AND t.academicYear.id = :academicYearId")
    Optional<TeacherAssignment> findBySchoolIdAndClassroomIdAndSubjectIdAndAcademicYearId(
            @Param("schoolId") Long schoolId,
            @Param("classroomId") Long classroomId,
            @Param("subjectId") Long subjectId,
            @Param("academicYearId") Long academicYearId
    );

    // ✅ NOUVEAU : Comptage global des affectations et des cours distincts attribués aux enseignants
    long countBySchoolId(Long schoolId);

    @Query("SELECT COUNT(DISTINCT ta.courseAssignment.id) FROM TeacherAssignment ta WHERE ta.school.id = :schoolId")
    long countDistinctAssignedCoursesBySchoolId(@Param("schoolId") Long schoolId);
}