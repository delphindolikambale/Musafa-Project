package com.school.management.repository.academic;

import com.school.management.model.academic.HourSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HourSlotRepository extends JpaRepository<HourSlot, Long> {

    // Récupérer la configuration horaire ordonnée d'une école spécifique
    List<HourSlot> findBySchoolIdOrderBySlotNumberAsc(Long schoolId);

    Optional<HourSlot> findBySchoolIdAndSlotNumber(Long schoolId, Integer slotNumber);

    boolean existsBySchoolIdAndSlotNumber(Long schoolId, Integer slotNumber);
}