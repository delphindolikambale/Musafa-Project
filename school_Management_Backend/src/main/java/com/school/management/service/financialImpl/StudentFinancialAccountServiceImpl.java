package com.school.management.service.financialImpl;

import com.school.management.dto.financial.StudentFinancialAccountCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountListDTO;
import com.school.management.dto.financial.StudentFinancialAccountResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.enums.AccountStatus;
import com.school.management.model.financial.StudentFinancialAccount;
import com.school.management.model.multitenant.School;
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
    public StudentFinancialAccountResponseDTO create(StudentFinancialAccountCreateDTO dto, Long schoolId) {
        // Enforce Multi-tenant isolation sur la sélection de l'élève
        Student student = studentRepository.findById(dto.getStudentId())
                .filter(s -> s.getSchool() != null && s.getSchool().getId().equals(schoolId))
                .orElseThrow(() -> new ResourceNotFoundException("Élève introuvable dans votre établissement."));

        return repository.findByStudentIdAndSchoolId(student.getId(), schoolId)
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
                            .school(School.builder().id(schoolId).build()) // ✅ Isolation
                            .build();

                    return map(repository.save(account));
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFinancialAccountListDTO> getAll(Long schoolId) {
        return repository.findBySchoolId(schoolId).stream()
                .map(account -> StudentFinancialAccountListDTO.builder()
                        .id(account.getId())
                        .accountNumber(account.getAccountNumber())
                        .studentFullName(account.getStudent().getFullName())
                        .gender(account.getStudent().getGender() != null ?
                                account.getStudent().getGender().name() : "N/A")
                        .openedAt(account.getOpenedAt())
                        .status(account.getStatus().name())
                        .build()
                ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getById(Long id, Long schoolId) {
        return map(repository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable dans votre établissement.")));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getByAccountNumber(String accountNumber, Long schoolId) {
        return map(repository.findByAccountNumberAndSchoolId(accountNumber, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable dans votre établissement.")));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialAccountResponseDTO getDetailsByAccountNumber(String accountNumber, Long schoolId) {
        StudentFinancialAccount account = repository.findWithProfilesByAccountNumberAndSchoolId(accountNumber, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte financier introuvable avec le numéro : " + accountNumber));
        return map(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFinancialAccountResponseDTO> search(String keyword, Long schoolId) {
        return repository.findByStudent_LastNameContainingIgnoreCaseAndSchoolId(keyword, schoolId)
                .stream()
                .map(this::map)
                .toList();
    }

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