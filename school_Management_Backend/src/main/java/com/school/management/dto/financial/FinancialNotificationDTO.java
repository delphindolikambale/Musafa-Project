package com.school.management.dto.financial;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class FinancialNotificationDTO {

    private String studentName;
    private String accountNumber;
    private String classroom;
    private String amountDue;
    private String currency;
    private String message;
    private LocalDateTime createdAt;

}