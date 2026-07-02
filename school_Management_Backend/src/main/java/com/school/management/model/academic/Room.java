package com.school.management.model.academic;

import com.school.management.model.multitenant.School; // ✅ AJOUT
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        // ✅ MULTI-TENANT : L'unicité du nom de la salle est désormais isolée par établissement
        @UniqueConstraint(columnNames = {"name", "school_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ MULTI-TENANT : Retrait de unique = true global qui bloquait les autres structures
    @Column(nullable = false)
    private String name; // Ex: "Local 101", "Labo A"

    private Integer capacity; // La seule et unique capacité (ex: 30)

    private String building; // Ex: "Bâtiment Central"

    private boolean active = true;

    // ✅ MULTI-TENANT : Rattachement explicite de la salle à son école
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}