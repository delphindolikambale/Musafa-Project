package com.school.management.model.academic;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proviseur_notifications")
public class ProviseurNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // Exemple: "NEW_GRADE_SHEET"

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private String targetRole; // Exemple: "PROVISEUR" ou "ROLE_PROVISEUR"

    @Column(nullable = false)
    private boolean readStatus = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Métadonnées spécifiques pour faciliter la redirection au clic côté Frontend
    private String subjectName;
    private String classroomName;
    private String period;
    private String teacherName;
    private Long assignmentId;

    public ProviseurNotification() {
        this.createdAt = LocalDateTime.now();
    }

    public ProviseurNotification(String type, String title, String message, String targetRole,
                                 String subjectName, String classroomName, String period,
                                 String teacherName, Long assignmentId) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetRole = targetRole;
        this.subjectName = subjectName;
        this.classroomName = classroomName;
        this.period = period;
        this.teacherName = teacherName;
        this.assignmentId = assignmentId;
        this.readStatus = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
}