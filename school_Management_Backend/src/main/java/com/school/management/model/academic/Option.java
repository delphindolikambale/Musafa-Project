package com.school.management.model.academic;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(
        name = "options",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"option_name", "section_id"})
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
}
