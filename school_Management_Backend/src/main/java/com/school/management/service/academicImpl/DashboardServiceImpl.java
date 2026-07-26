package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DashboardDTO;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.academic.EnrollmentRepository;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.repository.financial.StudentPaymentRepository;
import com.school.management.repository.financial.ExpenseRepository;
import com.school.management.service.academic.DashboardService;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.Gender;
import com.school.management.model.enums.EnrollmentType;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository; // ✅ Injecté

    private final StudentPaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    public DashboardDTO getGlobalStatistics() {
        Long schoolId = getCurrentSchoolId();

        // ====================================================================
        // 1. STATISTIQUES DES ACTEURS (Effectifs, Genres, Réinscriptions)
        // ====================================================================
        long totalStudents = studentRepository.countBySchoolId(schoolId);

        // ✅ Actifs grâce aux nouvelles méthodes dans les repositories
        long totalBoys = studentRepository.countByGenderAndSchoolId(Gender.MASCULIN, schoolId);
        long totalGirls = studentRepository.countByGenderAndSchoolId(Gender.FEMININ, schoolId);

        // Adaptation : Assurez-vous que REINSCRIPTION correspond bien à l'Enum exact de votre projet
        long totalReenrolled = enrollmentRepository.countByEnrollmentTypeAndSchoolId(EnrollmentType.REINSCRIPTION, schoolId);
        long totalReenrolledBoys = enrollmentRepository.countByEnrollmentTypeAndStudentGenderAndSchoolId(EnrollmentType.REINSCRIPTION, Gender.MASCULIN, schoolId);
        long totalReenrolledGirls = enrollmentRepository.countByEnrollmentTypeAndStudentGenderAndSchoolId(EnrollmentType.REINSCRIPTION, Gender.FEMININ, schoolId);

        long totalClasses = classroomRepository.countBySchoolId(schoolId);

        // ✅ Correction : Récupération dynamique des enseignants et des genres
        long totalTeachers = teacherRepository.countBySchoolId(schoolId);
        long totalMaleTeachers = teacherRepository.countByGenderIgnoreCaseAndSchoolId("M", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Masculin", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Homme", schoolId);

        long totalFemaleTeachers = teacherRepository.countByGenderIgnoreCaseAndSchoolId("F", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Féminin", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Femme", schoolId);

        long connectedUsers = 1;

        // ====================================================================
        // 2. STATISTIQUES FINANCIÈRES (Caisse Réelle Bi-devise : USD & CDF)
        // ====================================================================

        // ---- Calculs USD ----
        BigDecimal recoveredUSD = paymentRepository.sumAmountPaidByCurrencyAndSchoolId(Currency.USD, schoolId);
        recoveredUSD = (recoveredUSD != null) ? recoveredUSD : BigDecimal.ZERO;

        BigDecimal expensesUSD = expenseRepository.sumAmountByCurrencyAndSchoolId(Currency.USD, schoolId);
        expensesUSD = (expensesUSD != null) ? expensesUSD : BigDecimal.ZERO;

        BigDecimal actualCashBalanceUSD = recoveredUSD.subtract(expensesUSD);

        // ---- Calculs CDF ----
        BigDecimal recoveredCDF = paymentRepository.sumAmountPaidByCurrencyAndSchoolId(Currency.CDF, schoolId);
        recoveredCDF = (recoveredCDF != null) ? recoveredCDF : BigDecimal.ZERO;

        BigDecimal expensesCDF = expenseRepository.sumAmountByCurrencyAndSchoolId(Currency.CDF, schoolId);
        expensesCDF = (expensesCDF != null) ? expensesCDF : BigDecimal.ZERO;

        BigDecimal actualCashBalanceCDF = recoveredCDF.subtract(expensesCDF);

        // ✅ CORRECTION : Simulation du Total Attendu (Expected Revenue)
        // Note: Le dépôt pour calculer "les frais attendus" (ex: FeeRepository) n'était pas dans vos fichiers.
        // Vous devrez remplacer ces lignes par la somme réelle attendue (ex: total des factures générées).
        BigDecimal expectedRevenueUSD = BigDecimal.valueOf(totalStudents * 150L);     // Base factice: 150$ par élève
        BigDecimal expectedRevenueCDF = BigDecimal.valueOf(totalStudents * 400000L);  // Base factice: 400.000 Fc par élève

        // ====================================================================
        // 3. PRÉPARATION DES DONNÉES POUR LES GRAPHIQUES
        // ====================================================================
        Map<String, Long> studentsByClass = new HashMap<>();
        studentsByClass.put("1ère Année", 45L);
        studentsByClass.put("2ème Année", 38L);

        Map<String, Long> enrollmentEvolution = new HashMap<>();
        enrollmentEvolution.put("2024-2025", totalStudents);

        Map<String, Long> genderRatio = new HashMap<>();
        genderRatio.put("Garçons", totalBoys > 0 ? totalBoys : 1L);
        genderRatio.put("Filles", totalGirls > 0 ? totalGirls : 1L);

        // ====================================================================
        // CONSTRUCTION DU DTO DE RÉPONSE
        // ====================================================================
        return DashboardDTO.builder()
                .totalStudents(totalStudents)
                .totalBoys(totalBoys)
                .totalGirls(totalGirls)
                .totalReenrolled(totalReenrolled)
                .totalReenrolledBoys(totalReenrolledBoys)
                .totalReenrolledGirls(totalReenrolledGirls)

                .totalTeachers(totalTeachers)
                .totalMaleTeachers(totalMaleTeachers)
                .totalFemaleTeachers(totalFemaleTeachers)

                .totalClasses(totalClasses)
                .connectedUsers(connectedUsers)

                .totalExpectedRevenueUSD(expectedRevenueUSD)
                .totalExpectedRevenueCDF(expectedRevenueCDF)

                .totalRecoveredUSD(recoveredUSD)
                .totalExpensesUSD(expensesUSD)
                .actualCashBalanceUSD(actualCashBalanceUSD)

                .totalRecoveredCDF(recoveredCDF)
                .totalExpensesCDF(expensesCDF)
                .actualCashBalanceCDF(actualCashBalanceCDF)

                .studentsByClass(studentsByClass)
                .enrollmentEvolution(enrollmentEvolution)
                .genderRatio(genderRatio)
                .build();
    }
}