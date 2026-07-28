package com.school.management.controller.academic;

import com.school.management.dto.academic.PedagogyDashboardDTO;
import com.school.management.service.academic.PedagogyDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedagogy/dashboard")
@RequiredArgsConstructor
public class PedagogyDashboardController {

    private final PedagogyDashboardService pedagogyDashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN', 'ROLE_PROVISEUR', 'PROVISEUR', 'ROLE_PROVISEUR_PRINCIPAL', 'PROVISEUR_PRINCIPAL', 'ROLE_PREFET', 'PREFET', 'ROLE_DIRECTEUR_ETUDES', 'DIRECTEUR_ETUDES', 'ROLE_SUPER_ADMIN_SYSTEM', 'SUPER_ADMIN_SYSTEM')")
    public ResponseEntity<PedagogyDashboardDTO> getPedagogyStatistics() {
        PedagogyDashboardDTO stats = pedagogyDashboardService.getPedagogyStatistics();
        return ResponseEntity.ok(stats);
    }
}