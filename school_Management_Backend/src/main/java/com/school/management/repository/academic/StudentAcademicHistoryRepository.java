package com.school.management.repository.academic;

import com.school.management.model.academic.StudentAcademicHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAcademicHistoryRepository extends JpaRepository<StudentAcademicHistory, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Liste l'historique d'un élève au sein de l'établissement
    List<StudentAcademicHistory> findByStudentIdAndSchoolId(Long studentId, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Liste globale pour purger ou exporter les données d'une école
    List<StudentAcademicHistory> findBySchoolId(Long schoolId);
}