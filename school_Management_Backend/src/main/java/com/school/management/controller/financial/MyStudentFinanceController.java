package com.school.management.controller.financial;

import com.school.management.dto.financial.MyFinancialStatusDTO;
import com.school.management.service.financial.MyStudentFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/finance")
@RequiredArgsConstructor
public class MyStudentFinanceController {

    private final MyStudentFinanceService myStudentFinanceService;

    @GetMapping("/status")
    public ResponseEntity<MyFinancialStatusDTO> getMyFinancialStatus(Authentication authentication) {
        // L'authentification Spring Security nous donne l'identifiant (username/email) de l'utilisateur connecté
        String username = authentication.getName();

        MyFinancialStatusDTO status = myStudentFinanceService.getMyCurrentFinancialStatus(username);
        return ResponseEntity.ok(status);
    }
}