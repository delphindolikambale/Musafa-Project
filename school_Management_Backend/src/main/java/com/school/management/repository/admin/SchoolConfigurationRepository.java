package com.school.management.repository.admin;

import com.school.management.model.admin.SchoolConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
// Vérifiez bien que vous avez écrit <SchoolConfiguration, Long>
public interface SchoolConfigurationRepository extends JpaRepository<SchoolConfiguration, Long> {

    /// Récupère la configuration unique du système
    Optional<SchoolConfiguration> findFirstByOrderByIdAsc();
}
