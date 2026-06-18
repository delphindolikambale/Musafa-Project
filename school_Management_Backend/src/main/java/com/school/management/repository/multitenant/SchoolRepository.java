package com.school.management.repository.multitenant;

import com.school.management.model.multitenant.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);

    // ✅ AJOUT : Recherche indispensable pour cibler l'établissement lors de la saisie du code secret
    Optional<School> findByCode(String code);
}