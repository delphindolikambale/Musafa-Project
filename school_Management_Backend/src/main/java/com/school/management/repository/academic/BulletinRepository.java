package com.school.management.repository.academic;

import com.school.management.model.academic.Bulletin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    /**
     * Vérifie si un bulletin a déjà été initialisé pour un élève,
     * dans une classe spécifique, pour une année académique donnée
     * et au sein d'une école spécifique (Logique Multi-Tenant).
     */
    boolean existsByStudentIdAndClassroomIdAndAcademicYearIdAndSchoolId(
            Long studentId, Long classroomId, Long academicYearId, Long schoolId);

    // ✅ AJOUTS POUR LE SERVICE DES DOSSIERS (BulletinTitulaireServiceImpl)

    long countByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long academicYearId, Long schoolId);

    long countByClassroomIdAndAcademicYearIdAndSchoolIdAndStatus(Long classroomId, Long academicYearId, Long schoolId, String status);

    List<Bulletin> findByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long academicYearId, Long schoolId);

    /**
     * ✅ Récupère tous les bulletins d'une classe sans distinction d'année ou d'école.
     * Cette méthode sert de fallback de secours pour la robustesse de l'UI.
     */
    List<Bulletin> findByClassroomId(Long classroomId);

}