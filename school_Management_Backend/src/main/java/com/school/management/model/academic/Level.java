package com.school.management.model.academic;

import com.school.management.model.enums.LevelType;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

/**
 * Cette classe représente un NIVEAU SCOLAIRE
 * selon le système éducatif de la RDC (7e, 8e, 1ère, 2e, 3e, 4e).
 */
@Entity
@Table(
        name = "levels",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"school_id", "name"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ex: 7e, 1ère
    @Column(nullable = false, length = 50)
    private String name;

    // BASE ou OPTIONNEL
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LevelType type;

    private boolean active = true;

    // ✅ LIEN MULTI-TENANT : Isolation par établissement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}