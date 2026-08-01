package com.school.management.model.academic;
import com.school.management.model.enums.AttendanceStatus;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "student_attendances",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "date", "school_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private com.school.management.model.attendance.AttendanceSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "morning_status")
    private AttendanceStatus morningStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "evening_status")
    private AttendanceStatus eveningStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_status", nullable = false)
    private AttendanceStatus finalStatus;

    @Column(length = 255)
    private String remarks;
}
