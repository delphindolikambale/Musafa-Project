package com.school.management.repository.academic;

import com.school.management.model.academic.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LevelRepository extends JpaRepository<Level, Long> {
    // Méthode pour vérifier si un niveau existe par son nom
        Optional<Level> findByName(String name);
}
