package com.school.management.service.financialImpl;

import com.school.management.dto.financial.StudentFinancialAccountCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountListDTO;
import com.school.management.dto.financial.StudentFinancialAccountResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.enums.AccountStatus;
import com.school.management.model.financial.StudentFinancialAccount;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.financial.StudentFinancialAccountRepository;
import com.school.management.service.financial.StudentFinancialAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentFinancialAccountServiceImpl implements StudentFinancialAccountService {

    private final StudentRepository studentRepository;
    private final StudentFinancialAccountRepository repository;

    @Override
    @Transactional
    public StudentFinancialAccountResponseDTO create(StudentFinancialAccountCreateDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Élève introuvable"));

        return repository.findByStudentId(student.getId())
                .map(this::map)
                .orElseGet(() -> {
                    String generatedAccNumber = StudentFinancialAccount.generateAccountNumber(
                            student.getMatricule(),
                            student.getPermanentNumber()
                    );

                    StudentFinancialAccount account = StudentFinancialAccount.builder()
                            .student(student)
                            .accountNumber(generatedAccNumber)
                            .openedAt(LocalDate.now())
                            .status(AccountStatus.ACTIVE)
                            .build();

                    return map(repository.save(account));
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFinancialAccountListDTO> getAll() {
        return repository.findAll().stream()
                .map(account -> StudentFinancialAccountListDTO.builder()
                        .id(account.getId())
                        .accountNumber(account.getAccountNumber())
                        .studentFullName(account.getStudent().getFullName())
                        // Récupération sécurisée du genre pour le tableau
                        .gender(account.getStudent().getGender() != null ?
                                account.getStudent().getGender().name() : "N/A")
                        // Récupération de la date d'ouverture pour le tableau
                        .openedAt(account.getOpenedAt())
                        .status(account.getStatus().name())
                        .build()
                ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getById(Long id) {
        return map(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable")));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getByAccountNumber(String accountNumber) {
        return map(repository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable")));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getDetailsByAccountNumber(String accountNumber) {
        StudentFinancialAccount account = repository.findWithProfilesByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Compte financier introuvable avec le numéro : " + accountNumber));
        return map(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFinancialAccountResponseDTO> search(String keyword) {
        return repository.findByStudent_LastNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::map)
                .toList();
    }

    /**
     * Méthode de mapping interne vers StudentFinancialAccountResponseDTO.
     * Adaptée pour inclure le genre et la date d'ouverture.
     */
    private StudentFinancialAccountResponseDTO map(StudentFinancialAccount acc) {
        return StudentFinancialAccountResponseDTO.builder()
                .id(acc.getId())
                .accountNumber(acc.getAccountNumber())
                .permanentNumber(acc.getStudent().getPermanentNumber())
                .studentFullName(acc.getStudent().getFullName())
                .gender(acc.getStudent().getGender() != null ?
                        acc.getStudent().getGender().name() : "N/A")
                .openedAt(acc.getOpenedAt())
                .status(acc.getStatus().name())
                .build();
    }
}
