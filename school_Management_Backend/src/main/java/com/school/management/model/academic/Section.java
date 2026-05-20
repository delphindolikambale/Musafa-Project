package com.school.management.model.academic;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(
        name = "sections",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "section_name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nom de la section
     * Exemples : Générale, Technique, Professionnelle
     */
    @Column(name = "section_name", nullable = false, length = 50)
    private String sectionName;

    /**
     * Activation / désactivation logique
     */
    @Column(nullable = false)
    private boolean active = true;
}
