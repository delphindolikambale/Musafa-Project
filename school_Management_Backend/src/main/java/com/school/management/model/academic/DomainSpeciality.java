package com.school.management.model.academic;

import com.school.management.model.multitenant.School; // ✅ AJOUT
import jakarta.persistence.*;
import lombok.*;

@Entity
// ✅ MULTI-TENANT : L'unicité du nom de la spécialité se gère désormais par établissement
@Table(name = "specialities", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name", "school_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DomainSpeciality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ MULTI-TENANT : Retrait du unique=true global qui bloquait les autres écoles
    @Column(nullable = false)
    private String name; // ex: "SCIENCES", "MATHEMATIQUES"

    // ✅ MULTI-TENANT : Rattachement de la spécialité à son école
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}