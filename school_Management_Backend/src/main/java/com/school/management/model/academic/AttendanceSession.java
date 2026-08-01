package com.school.management.model.attendance;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.Teacher;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance_sessions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"classroom_id", "date", "academic_year_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "morning_done", nullable = false)
    private boolean morningDone = false;

    @Column(name = "evening_done", nullable = false)
    private boolean eveningDone = false;

    @Column(name = "morning_recorded_at")
    private LocalDateTime morningRecordedAt;

    @Column(name = "evening_recorded_at")
    private LocalDateTime eveningRecordedAt;
}