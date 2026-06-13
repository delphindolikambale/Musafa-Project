package com.school.management.service.financialImpl;

import com.school.management.dto.financial.MyFinancialStatusDTO;
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
import com.school.management.service.financial.MyStudentFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyStudentFinanceServiceImpl implements MyStudentFinanceService {

    private final UserRepository userRepository; // Ajout de l'injection du UserRepository
    private final StudentRepository studentRepository;
    private final StudentFinancialAccountRepository accountRepository;
    private final StudentPaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public MyFinancialStatusDTO getMyCurrentFinancialStatus(String username) {

        // 1. Récupérer l'utilisateur (User) via le username contenu dans le token JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec ce pseudo : " + username));

        // 2. Récupérer l'étudiant lié à cet ID utilisateur
        Student student = studentRepository.findByUserId(user.getId())
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

        // 7. Construire et retourner le DTO final global
        return MyFinancialStatusDTO.builder()
                .accountNumber(account.getAccountNumber())
                .academicYear(activeProfile.getAcademicYear().getAnnee())
                .className(activeProfile.getEnrollment().getClassroom().getDisplayName())
                .totalAmountDue(activeProfile.getTotalAmountDue())
                .totalAmountPaid(activeProfile.getTotalAmountPaid())
                .balance(activeProfile.getBalance())
                .currency(activeProfile.getCurrency().toString())
                .paymentHistory(transactionDTOs)
                .build();
    }
}