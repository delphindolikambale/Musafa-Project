package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class CourseAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // --- LE CŒUR DE LA LOGIQUE ---
    @ManyToOne(optional = false)
    @JoinColumn(name = "level_id")
    private Level level; // Ex: 7ème, 1ère

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section; // Optionnel (null pour 7e/8e)

    @ManyToOne
    @JoinColumn(name = "option_id")
    private Option option;   // Optionnel (null pour 7e/8e)

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxP3;
    private double maxP4;
    private double maxExam2;

    public double getMaxS1() { return maxP1 + maxP2 + maxExam1; }
    public double getMaxS2() { return maxP3 + maxP4 + maxExam2; }
    public double getMaxTotal() { return getMaxS1() + getMaxS2(); }
}
