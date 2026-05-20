package com.school.management.repository.academic;

import com.school.management.model.academic.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SectionRepository extends JpaRepository<Section, Long> {
    Optional<Section> findBySectionName(String sectionName);

    boolean existsBySectionName(String sectionName);
}
