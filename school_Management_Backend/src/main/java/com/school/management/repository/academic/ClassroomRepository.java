package com.school.management.repository.academic;

import com.school.management.model.academic.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    // Récupérer les classes par niveau
    List<Classroom> findByLevelId(Long levelId);

    // Vérification d'unicité lors de la CRÉATION
    boolean existsByLevelIdAndSectionIdAndOptionIdAndDivision(Long levelId, Long sectionId, Long optionId, String division);

    // Recherche précise pour la validation lors de la MODIFICATION
    Optional<Classroom> findByLevelIdAndSectionIdAndOptionIdAndDivision(Long levelId, Long sectionId, Long optionId, String division);

    // Récupérer uniquement les classes actives
    List<Classroom> findByActiveTrue();

    // Vérifier l'occupation d'une salle physique
    Optional<Classroom> findByRoomId(Long roomId);

}
