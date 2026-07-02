package com.school.management.model.academic;

import com.school.management.model.enums.CourseCategory;
import com.school.management.model.multitenant.School; // ✅ AJOUT
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // ADAPTATION : optional = false a été retiré pour permettre la sauvegarde sans domaine initial
    @ManyToOne
    @JoinColumn(name = "domain_id")
    private Domain domain;

    @ManyToOne
    @JoinColumn(name = "sub_domain_id")
    private SubDomain subDomain;

    // Contexte de classe obligatoire
    @ManyToOne(optional = false)
    @JoinColumn(name = "level_id")
    private Level level;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne
    @JoinColumn(name = "option_id")
    private Option option;

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    // ✅ MULTI-TENANT : Isolation directe au niveau de la matière
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    // --- AJOUTS POUR LA LOGIQUE GRILLE HORAIRE ---
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private CourseCategory category;

    @Column(name = "hours_per_week")
    private Double hoursPerWeek;

    // Gestion de la suppression en cascade : Supprime les maxima liés si le cours est supprimé
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CourseAssignment> assignments = new ArrayList<>();
}