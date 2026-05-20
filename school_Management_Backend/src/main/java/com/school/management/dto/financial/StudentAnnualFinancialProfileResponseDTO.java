package com.school.management.dto.financial;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class StudentAnnualFinancialProfileResponseDTO {

    private Long id;

    // Informations Élève
    private String studentFullName;
    private String permanentNumber;

    // Contexte Académique
    private String academicYear;
    private String classroom;
    private Long scheduleFeesId;
    private String scheduleFeesName;

    // Nouveaux champs pour le caissier
    private String paymentFrequency;
    private Integer numberOfInstallments;
    private List<InstallmentScheduleResponseDTO> installments;

    // NOUVEAU : Répartition détaillée (Scolarité 70%, Divers 30%, etc.)
    private List<FeesGroupResponseDTO> feeBreakdown;

    // État Financier
    private BigDecimal totalAmountDue;
    private BigDecimal totalAmountPaid;
    private BigDecimal balance;
    private String currency;

    private LocalDate createdAt;
    private boolean active;
}
