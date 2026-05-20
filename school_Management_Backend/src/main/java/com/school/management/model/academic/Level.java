package com.school.management.model.academic;
import com.school.management.model.enums.LevelType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Cette classe représente un NIVEAU SCOLAIRE
 * selon le système éducatif de la RDC (7e, 8e, 1ère, 2e, 3e, 4e).
 *
 * IMPORTANT :
 * - Un Level est créé UNE SEULE FOIS par l'administrateur
 * - Il est ensuite réutilisé lors des inscriptions (Enrollment)
 */
@Entity
@Table(
        name = "levels",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "code")
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
    @Column(nullable = false, unique = true)
    private String name;

    // BASE ou OPTIONNEL
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LevelType type;

    private boolean active = true;
}
