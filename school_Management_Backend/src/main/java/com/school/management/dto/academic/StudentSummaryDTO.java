package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class StudentSummaryDTO {

    private String matricule;
    private String fullName;
    private String currentClass;
    private String photoUrl;
}
