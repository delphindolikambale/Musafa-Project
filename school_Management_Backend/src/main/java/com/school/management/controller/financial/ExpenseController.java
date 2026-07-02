package com.school.management.controller.financial;

import com.school.management.dto.financial.ExpenseCreateDTO;
import com.school.management.dto.financial.ExpenseResponseDTO;
import com.school.management.model.auth.User;
import com.school.management.repository.auth.UserRepository;
import com.school.management.service.financial.ExpenseService;
import com.school.management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> createExpense(@RequestBody ExpenseCreateDTO dto, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return new ResponseEntity<>(expenseService.createExpense(dto, schoolId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponseDTO>> getAllExpenses(Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(expenseService.getAllExpenses(schoolId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> getExpenseById(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(expenseService.getById(id, schoolId));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<List<ExpenseResponseDTO>> getExpensesByAcademicYear(@PathVariable Long academicYearId, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(expenseService.getByAcademicYear(academicYearId, schoolId));
    }

    private Long getSchoolIdFromAuthentication(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
        return user.getSchool().getId();
    }
}