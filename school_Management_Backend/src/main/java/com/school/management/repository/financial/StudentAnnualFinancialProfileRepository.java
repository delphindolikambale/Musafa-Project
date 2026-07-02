package com.school.management.repository.financial;

import com.school.management.model.financial.StudentAnnualFinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentAnnualFinancialProfileRepository extends JpaRepository<StudentAnnualFinancialProfile, Long>{

    Optional<StudentAnnualFinancialProfile> findByIdAndSchoolId(Long id, Long schoolId);

    Optional<StudentAnnualFinancialProfile> findByFinancialAccountIdAndAcademicYearIdAndSchoolId(Long accountId, Long academicYearId, Long schoolId);

    List<StudentAnnualFinancialProfile> findByFinancialAccount_AccountNumberAndSchoolId(String accountNumber, Long schoolId);

    List<StudentAnnualFinancialProfile> findByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);

    Optional<StudentAnnualFinancialProfile> findByEnrollmentIdAndSchoolId(Long enrollmentId, Long schoolId);

    List<StudentAnnualFinancialProfile> findByScheduleFeesIdAndSchoolId(Long scheduleFeesId, Long schoolId);

    List<StudentAnnualFinancialProfile> findByEnrollment_Classroom_IdAndSchoolId(Long classroomId, Long schoolId);

    List<StudentAnnualFinancialProfile> findByActiveTrueAndSchoolId(Long schoolId);

    // ✅ AJOUT DE LA MÉTHODE MANQUANTE POUR L'ISOLATION GLOBALE MULTI-TENANT
    List<StudentAnnualFinancialProfile> findBySchoolId(Long schoolId);
}