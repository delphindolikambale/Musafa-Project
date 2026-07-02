package com.school.management.repository.admin;

import com.school.management.model.admin.SchoolConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolConfigurationRepository extends JpaRepository<SchoolConfiguration, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Isolation des requêtes par identifiant d'école
    Optional<SchoolConfiguration> findBySchoolId(Long schoolId);
}