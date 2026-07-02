package com.school.management.model.academic;
import com.school.management.model.enums.LevelType;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "classrooms",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {
                        "school_id",
                        "level_id",
                        "section_id",
                        "option_id",
                        "division"
                })
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "level_id")
    private Level level;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne
    @JoinColumn(name = "option_id")
    private Option option;

    /**
     * Pour différencier les classes parallèles (ex: A, B, C)
     */
    private String division;

    /**
     * Relation avec la salle physique
     */
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    /**
     * Relation avec l'enseignant titulaire de la classe
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "titulaire_id", unique = true)
    private Teacher titulaire;

    private boolean active = true;

    // ✅ LIEN MULTI-TENANT : Isolation par établissement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Transient
    public String getDisplayName() {
        StringBuilder sb = new StringBuilder(level.getName());

        if (level.getType() != LevelType.BASE) {
            if (section != null) sb.append(" - ").append(section.getSectionName());
            if (option != null) sb.append(" - ").append(option.getOptionName());
        }
        if (division != null && !division.isEmpty()) {
            sb.append(" (").append(division).append(")");
        }
        return sb.toString();
    }

    @Transient
    public Integer getEffectiveCapacity() {
        return (room != null) ? room.getCapacity() : 0;
    }
}