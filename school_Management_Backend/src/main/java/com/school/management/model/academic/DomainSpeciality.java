package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class DomainSpeciality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // ex: "SCIENCES", "MATHEMATIQUES"
}
