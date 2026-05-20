package com.school.management.dto.financial;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class InstallmentSchedulePaymentCreateDTO {

    @NotNull(message = "L'ID de la tranche est obligatoire")
    private Long installmentScheduleId;

    @NotNull(message = "L'ID du paiement global est obligatoire")
    private Long studentPaymentId;

    @NotNull(message = "Le montant appliqué ne peut pas être nul")
    @Positive(message = "Le montant appliqué doit être supérieur à zéro")
    private BigDecimal amountApplied;

    /**
     * Optionnel : On peut laisser le système le récupérer de l'entité InstallmentSchedule
     * ou le passer ici si on fait une saisie manuelle forcée.
     */
    private Integer installmentNumber;
}
