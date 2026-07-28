package com.school.management.dto.academic.bulletin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinFolderDTO {

    private Long folderId;
    private String folderName;
    private Long classroomId;
    private String classroomName;
    private long totalBulletins;
    private long validatedBulletins;
    private String status;
    private LocalDateTime createdAt;
}