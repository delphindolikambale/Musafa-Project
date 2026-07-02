package com.school.management.repository.academic;

import com.school.management.model.academic.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    Optional<Section> findBySectionNameAndSchoolId(String sectionName, Long schoolId);

    boolean existsBySectionNameAndSchoolId(String sectionName, Long schoolId);

    List<Section> findAllBySchoolId(Long schoolId);

    Optional<Section> findByIdAndSchoolId(Long id, Long schoolId);
}