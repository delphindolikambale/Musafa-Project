package com.school.management.dto.financial;

import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
@Data // Pour avoir les getters et les setters
@NoArgsConstructor
@AllArgsConstructor

public class StudentFinancialAccountResponseDTO {

    private Long id;

    private String accountNumber;

    private String permanentNumber;

    private String studentFullName;

    /**
     * Ajout du Genre pour la cohérence des détails
     */
    private String gender;

    private LocalDate openedAt;

    private String status;
}
