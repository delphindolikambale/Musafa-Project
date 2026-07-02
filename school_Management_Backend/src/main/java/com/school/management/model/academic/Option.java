package com.school.management.model.academic;

import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "options",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"school_id", "option_name", "section_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nom de l’option
     * Exemples : Sciences, Informatique, Menuiserie
     */
    @Column(name = "option_name", nullable = false, length = 50)
    private String optionName;

    /**
     * Section parente
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "section_id")
    private Section section;

    /**
     * Activation / désactivation logique
     */
    @Column(nullable = false)
    private boolean active = true;

    // ✅ LIEN MULTI-TENANT : Isolation par établissement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}