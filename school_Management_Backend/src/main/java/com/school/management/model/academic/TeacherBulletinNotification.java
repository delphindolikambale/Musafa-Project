package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_bulletin_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherBulletinNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    @Column(name = "school_id", nullable = false)
    private Long schoolId;

    private String title;

    @Column(length = 500)
    private String message;

    private String actionType;

    @Builder.Default
    private boolean isRead = false;

    private LocalDateTime createdAt;
}