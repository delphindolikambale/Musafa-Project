package com.school.management.model.academic;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "academic_years",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"school_id", "annee"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String annee;

    // --- AJOUTS POUR LE CALENDRIER ---
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut; // Date d'ouverture de l'année

    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;   // Date de clôture de l'année

    @Column(nullable = false)
    private boolean active;

    // ✅ LIEN MULTI-TENANT : Chaque année académique appartient désormais à une école spécifique
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Transient
    public String getName() {
        return annee;
    }
}