package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Ex: "Local 101", "Labo A"

    private Integer capacity; // La seule et unique capacité (ex: 30)

    private String building; // Ex: "Bâtiment Central"

    private boolean active = true;

}
