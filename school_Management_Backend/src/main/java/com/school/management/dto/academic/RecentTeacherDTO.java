package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentTeacherDTO {
    private Long id;
    private String registrationNumber;
    private String fullName;
    private String gender;
    private String speciality;
    private String phone;
    private boolean active;
}