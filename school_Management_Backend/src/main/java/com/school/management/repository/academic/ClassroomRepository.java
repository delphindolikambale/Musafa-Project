package com.school.management.repository.academic;

import com.school.management.model.academic.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    List<Classroom> findByLevelIdAndSchoolId(Long levelId, Long schoolId);

    boolean existsByLevelIdAndSectionIdAndOptionIdAndDivisionAndSchoolId(Long levelId, Long sectionId, Long optionId, String division, Long schoolId);

    Optional<Classroom> findByLevelIdAndSectionIdAndOptionIdAndDivisionAndSchoolId(Long levelId, Long sectionId, Long optionId, String division, Long schoolId);

    List<Classroom> findByActiveTrueAndSchoolId(Long schoolId);

    Optional<Classroom> findByRoomIdAndSchoolId(Long roomId, Long schoolId);

    Optional<Classroom> findByTitulaireIdAndSchoolId(Long titulaireId, Long schoolId);

    List<Classroom> findAllBySchoolId(Long schoolId);

    Optional<Classroom> findByIdAndSchoolId(Long id, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Ajout du prototype de comptage automatique pour le DashboardService
    long countBySchoolId(Long schoolId);
}