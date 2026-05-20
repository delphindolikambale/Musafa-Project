package com.school.management.model.academic;
import com.school.management.model.enums.LevelType;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(
        name = "classrooms",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {
                        "level_id",
                        "section_id",
                        "option_id",
                        "division" // On ajoute la division ici pour permettre les classes parallèles
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

    private boolean active = true;

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

    /**
     * Récupère dynamiquement la capacité via la salle liée
     */
    @Transient
    public Integer getEffectiveCapacity() {
        return (room != null) ? room.getCapacity() : 0;
    }
}
