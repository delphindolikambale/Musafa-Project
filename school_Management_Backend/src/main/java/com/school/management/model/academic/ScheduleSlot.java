package com.school.management.model.academic;

import com.school.management.model.enums.DayOfWeek;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schedule_slots", uniqueConstraints = {
        // Sécurité supplémentaire mise à jour au niveau de la BDD avec la clé étrangère hour_slot_id
        @UniqueConstraint(columnNames = {"academic_year_id", "day_of_week", "hour_slot_id", "classroom_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "school_id", nullable = false)
    private Long schoolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hour_slot_id", nullable = false)
    private HourSlot hourSlot; // Remplacement de l'Integer primitif par l'objet configuré

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;
}