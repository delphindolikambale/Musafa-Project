package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hour_slots", uniqueConstraints = {
        // Isolation multi-tenant : Un numéro de créneau est unique par école
        @UniqueConstraint(columnNames = {"school_id", "slot_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HourSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "school_id", nullable = false)
    private Long schoolId; // Clé multi-tenant

    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber; // 1 pour 1ère heure, 2 pour 2ème heure...

    @Column(name = "label", nullable = false)
    private String label; // Ex: "08h00 - 09h50"
}