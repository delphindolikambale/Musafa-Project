package com.school.management.repository.academic;

import com.school.management.model.academic.Option;
import com.school.management.model.academic.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findBySectionId(Long sectionId);

    Optional<Option> findByOptionNameAndSectionId(String optionName, Long sectionId);


    boolean existsByOptionNameAndSection(String optionName, Section section);


}
