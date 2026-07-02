package com.school.management.repository.academic;

import com.school.management.model.academic.Option;
import com.school.management.model.academic.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findBySectionIdAndSchoolId(Long sectionId, Long schoolId);

    Optional<Option> findByOptionNameAndSectionIdAndSchoolId(String optionName, Long sectionId, Long schoolId);

    boolean existsByOptionNameAndSectionAndSchoolId(String optionName, Section section, Long schoolId);

    List<Option> findAllBySchoolId(Long schoolId);

    Optional<Option> findByIdAndSchoolId(Long id, Long schoolId);
}