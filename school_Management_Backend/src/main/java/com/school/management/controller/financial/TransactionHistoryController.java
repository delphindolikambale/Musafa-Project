package com.school.management.controller.financial;

import com.school.management.dto.financial.TransactionHistoryDTO;
import com.school.management.model.auth.User;
import com.school.management.repository.auth.UserRepository;
import com.school.management.service.financial.TransactionHistoryService;
import com.school.management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial/history")
@RequiredArgsConstructor
public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;
    private final UserRepository userRepository;

    @GetMapping
    public List<TransactionHistoryDTO> getHistory(@RequestParam(required = false) String type, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);

        if (type != null) {
            if (type.equalsIgnoreCase("aujourd'hui")) {
                return transactionHistoryService.getTodayHistory(schoolId);
            } else if (!type.equalsIgnoreCase("tout")) {
                String filterType = type.equalsIgnoreCase("entrées") ? "IN" : "OUT";
                return transactionHistoryService.getHistoryByType(filterType, schoolId);
            }
        }
        return transactionHistoryService.getAllHistory(schoolId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        transactionHistoryService.deleteHistory(id, schoolId);
        return ResponseEntity.ok().build();
    }

    private Long getSchoolIdFromAuthentication(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
        return user.getSchool().getId();
    }
}