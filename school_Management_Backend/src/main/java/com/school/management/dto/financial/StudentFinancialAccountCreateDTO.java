package com.school.management.dto.financial;


import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO de création du compte financier
 * ⚠️ Le numéro de compte n’est JAMAIS fourni
 */
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFinancialAccountCreateDTO {

    @NotNull(message = "L'identifiant de l'élève est obligatoire")
    private Long studentId;

}
