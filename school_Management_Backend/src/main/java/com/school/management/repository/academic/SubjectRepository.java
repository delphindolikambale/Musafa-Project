package com.school.management.repository.academic;

import com.school.management.model.academic.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @Query("SELECT s FROM Subject s WHERE s.level.id = :levelId " +
            "AND ((s.section IS NULL AND :sectionId IS NULL) OR (s.section.id = :sectionId)) " +
            "AND ((s.option IS NULL AND :optionId IS NULL) OR (s.option.id = :optionId)) " +
            "AND s.academicYear.id = :yearId")
    List<Subject> findByClassContext(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId
    );
}
