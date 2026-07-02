package com.school.management.repository.academic;

import com.school.management.model.academic.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // ✅ SÉCURISÉ : Récupération par ID avec verrou de scope d'école
    Optional<Enrollment> findByIdAndSchoolId(Long id, Long schoolId);

    Optional<Enrollment> findByStudentIdAndAcademicYearIdAndSchoolId(Long studentId, Long academicYearId, Long schoolId);

    boolean existsByStudentIdAndAcademicYearIdAndSchoolId(Long studentId, Long academicYearId, Long schoolId);

    long countByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);

    List<Enrollment> findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(Long classroomId, Long academicYearId, Long schoolId);

    List<Enrollment> findByStudentIdAndSchoolId(Long studentId, Long schoolId);

    List<Enrollment> findByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);

    List<Enrollment> findBySchoolId(Long schoolId);

    long countByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(Long classroomId, Long academicYearId, Long schoolId);

    long countByClassroomIdAndSchoolId(Long classroomId, Long schoolId);

    List<Enrollment> findByStudentMatriculeAndSchoolIdOrderByAcademicYearDesc(String matricule, Long schoolId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.matricule = :matricule AND e.school.id = :schoolId " +
            "ORDER BY e.academicYear.dateDebut DESC")
    List<Enrollment> findAllHistoryByMatriculeAndSchoolId(@Param("matricule") String matricule, @Param("schoolId") Long schoolId);

    long countByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long academicYearId, Long schoolId);
}