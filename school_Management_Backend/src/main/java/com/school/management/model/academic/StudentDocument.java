package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class StudentDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Le libellé saisi par l'utilisateur (ex: "Certificat 6ème Primaire")
    @Column(nullable = false)
    private String customName;

    // Le nom réel du fichier sur le disque (ex: 2024_DEB001_certif.pdf)
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType; // ex: application/pdf, image/jpeg

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    private LocalDateTime uploadDate;

    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }
}
