package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.PaymentFrequency;
import com.school.management.model.financial.InstallmentSchedulePayment;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Data
public class ScheduleFeesResponseDTO {

    private Long id;
    private Long academicYearId;
    private Long levelId;
    private Long optionId;

    // Libellés pour affichage rapide sans jointures frontales complexes
    private String levelName;
    private String optionName;

    private Currency currency;
    private BigDecimal totalAmount;
    private Integer numberOfInstallments;
    private PaymentFrequency paymentFrequency;
    private LocalDate startDate;
    private Boolean active;

    private List<InstallmentScheduleResponseDTO> installments;
    private List<FeesGroupResponseDTO> feesGroups;
}
