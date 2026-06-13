package com.school.management.controller.student;

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
        // L'authentification Spring Security nous donne l'identifiant (généralement l'email ou username) de l'utilisateur connecté
        String studentEmail = authentication.getName();

        MyFinancialStatusDTO status = myStudentFinanceService.getMyCurrentFinancialStatus(studentEmail);
        return ResponseEntity.ok(status);
    }
}