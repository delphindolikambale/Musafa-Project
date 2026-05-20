package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "domains")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // ex: DOMAINE DES SCIENCES

    private int orderIndex;

    // L'exigence de compétence pour ce domaine
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "required_speciality_id")
    private DomainSpeciality requiredSpeciality;

    // Liaison à la classe spécifique
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

    @OneToMany(mappedBy = "domain", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubDomain> subDomains = new ArrayList<>();
}
