package com.school.management.service.financialImpl;

import com.school.management.dto.financial.MyFinancialStatusDTO;
import com.school.management.dto.financial.MyInstallmentStatusDTO;
import com.school.management.dto.financial.MyPaymentTransactionDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.auth.User;
import com.school.management.model.financial.StudentAnnualFinancialProfile;
import com.school.management.model.financial.StudentFinancialAccount;
import com.school.management.model.financial.StudentPayment;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.repository.financial.StudentFinancialAccountRepository;
import com.school.management.repository.financial.StudentPaymentRepository;
import com.school.management.repository.financial.InstallmentSchedulePaymentRepository;
import com.school.management.service.financial.MyStudentFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyStudentFinanceServiceImpl implements MyStudentFinanceService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentFinancialAccountRepository accountRepository;
    private final StudentPaymentRepository paymentRepository;
    private final InstallmentSchedulePaymentRepository installmentSchedulePaymentRepository; // Injection du repository de suivi

    @Override
    @Transactional(readOnly = true)
    public MyFinancialStatusDTO getMyCurrentFinancialStatus(String username) {

        // 1. Récupérer l'utilisateur (User) via le username contenu dans le token JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec ce pseudo : " + username));

        // 2. Récupérer l'étudiant lié à cet ID utilisateur en sécurisant par son école (Multi-tenant)
        // ✅ CORRECTION : Utilisation de la méthode native findByUserIdAndSchoolId
        Student student = studentRepository.findByUserIdAndSchoolId(user.getId(), user.getSchool().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun profil étudiant n'est lié à cet utilisateur"));

        // 3. Récupérer le compte financier de l'étudiant
        StudentFinancialAccount account = accountRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun compte financier associé à cet élève"));

        // 4. Récupérer le profil financier ACTIF (année en cours)
        StudentAnnualFinancialProfile activeProfile = accountRepository.findWithProfilesByAccountNumber(account.getAccountNumber())
                .map(acc -> acc.getAnnualProfiles().stream()
                        .filter(StudentAnnualFinancialProfile::isActive)
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Aucun profil financier actif pour l'année en cours")))
                .orElseThrow(() -> new ResourceNotFoundException("Erreur lors de la lecture du profil financier"));

        // 5. Récupérer l'historique des paiements (les reçus) pour ce profil
        List<StudentPayment> payments = paymentRepository.findByAnnualProfileId(activeProfile.getId());

        // 6. Mapper les paiements en DTOs
        List<MyPaymentTransactionDTO> transactionDTOs = payments.stream().map(payment -> {

            // Déterminer le motif principal pour l'affichage
            boolean hasScolarite = payment.getBreakdowns().stream()
                    .anyMatch(b -> "SCOLARITE".equalsIgnoreCase(b.getFeesGroupName()));

            String motif = hasScolarite ? "Frais Scolaires" :
                    (!payment.getBreakdowns().isEmpty() ? "Frais divers (" + payment.getBreakdowns().get(0).getFeesItemName() + ")" : "Paiement");

            return MyPaymentTransactionDTO.builder()
                    .paymentId(payment.getId())
                    .receiptNumber(payment.getReceiptNumber())
                    .amountPaid(payment.getAmountPaid())
                    .currency(payment.getCurrency().toString())
                    .paymentDate(payment.getPaymentDate())
                    .paymentMethod(payment.getPaymentMethod())
                    .mainPurpose(motif)
                    .build();
        }).collect(Collectors.toList());

        // 7. CALCUL ET MAPPING DE L'ÉVOLUTION DE CHAQUE TRANCHE (Sans supposition)
        List<MyInstallmentStatusDTO> installmentDTOs = activeProfile.getScheduleFees().getInstallments().stream()
                .sorted((a, b) -> a.getInstallmentNumber().compareTo(b.getInstallmentNumber()))
                .map(installment -> {
                    // Utilisation de la méthode native et sécurisée par profil élève
                    BigDecimal amountPaidForThisInstallment = installmentSchedulePaymentRepository
                            .sumAmountAppliedByInstallmentAndProfile(installment.getId(), activeProfile.getId());

                    BigDecimal remaining = installment.getAmount().subtract(amountPaidForThisInstallment);
                    if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                        remaining = BigDecimal.ZERO;
                    }

                    boolean isFullyPaid = remaining.compareTo(BigDecimal.ZERO) == 0;

                    return MyInstallmentStatusDTO.builder()
                            .installmentId(installment.getId())
                            .installmentNumber(installment.getInstallmentNumber())
                            .amountRequired(installment.getAmount())
                            .amountPaid(amountPaidForThisInstallment)
                            .remainingAmount(remaining)
                            .startDate(installment.getStartDate())
                            .dueDate(installment.getDueDate())
                            .fullyPaid(isFullyPaid)
                            .build();
                }).collect(Collectors.toList());

        // 8. Construire et retourner le DTO final global enrichi
        return MyFinancialStatusDTO.builder()
                .accountNumber(account.getAccountNumber())
                .academicYear(activeProfile.getAcademicYear().getAnnee())
                .className(activeProfile.getEnrollment().getClassroom().getDisplayName())
                .totalAmountDue(activeProfile.getTotalAmountDue())
                .totalAmountPaid(activeProfile.getTotalAmountPaid())
                .balance(activeProfile.getBalance())
                .currency(activeProfile.getCurrency().toString())
                .installments(installmentDTOs)
                .paymentHistory(transactionDTOs)
                .build();
    }
}