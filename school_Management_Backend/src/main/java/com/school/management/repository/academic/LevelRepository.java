package com.school.management.repository.academic;

import com.school.management.model.academic.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LevelRepository extends JpaRepository<Level, Long> {

    // Vérifier l'existence ou trouver un niveau par nom au sein d'un établissement précis
    Optional<Level> findByNameAndSchoolId(String name, Long schoolId);

    boolean existsByNameAndSchoolId(String name, Long schoolId);

    List<Level> findAllBySchoolId(Long schoolId);

    Optional<Level> findByIdAndSchoolId(Long id, Long schoolId);
}