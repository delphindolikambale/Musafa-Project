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
    // ✅ Ajout de la méthode manquante pour corriger l'erreur de compilation
    Optional<Enrollment> findByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);
    boolean existsByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);

    long countByAcademicYearId(Long academicYearId);

    List<Enrollment> findByClassroomIdAndAcademicYearIdAndActiveTrue(Long classroomId, Long academicYearId);

    List<Enrollment> findByStudentId(Long studentId);

    // Nouvelle méthode pour le filtrage par année
    List<Enrollment> findByAcademicYearId(Long academicYearId);

    long countByClassroomIdAndAcademicYearIdAndActiveTrue(Long classroomId, Long academicYearId);

    long countByClassroomId(Long classroomId);

    List<Enrollment> findByStudentMatriculeOrderByAcademicYearDesc(String matricule);

    @Query("SELECT e FROM Enrollment e WHERE e.student.matricule = :matricule " +
            "ORDER BY e.academicYear.dateDebut DESC")
    List<Enrollment> findAllHistoryByMatricule(@Param("matricule") String matricule);
    // ✅ Cette méthode permet au service de compter les élèves par classe ET par année
    long countByClassroomIdAndAcademicYearId(Long classroomId, Long academicYearId);
}
