package com.school.management.dto.academic;

import com.school.management.model.enums.VisaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaStatusResponseDTO {
    private VisaStatus status;
    private String rejectComment;
}