package com.school.management.dto.academic.bulletin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinFolderDTO {
    private Long classroomId;
    private String classroomName;
    private long totalBulletins;
    private long validatedBulletins;
    private String status; // Ex: "NOUVEAU", "EN COURS", "COMPLET"
}