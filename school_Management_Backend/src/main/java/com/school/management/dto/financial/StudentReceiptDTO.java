package com.school.management.dto.financial;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder

public class StudentReceiptDTO {

    // Infos École
    private String schoolName;
    private String schoolSlogan;
    private String schoolLogo;
    private String schoolAddress;
    private String schoolPhone;
    private String schoolEmail;
    private String schoolWebsite;

    // Infos Étudiant
    private String studentRegNumber;
    private String studentFullName;
    private String classLevel;
    private String sectionOption;

    // Infos Paiement
    private String receiptNumber;
    private String paymentDate;
    private String paymentTime;
    private BigDecimal amount;
    private String currency;
    private String amountInWords;
    private String paymentFor;
    private String paymentMethod;
    private String cashierName;

}
