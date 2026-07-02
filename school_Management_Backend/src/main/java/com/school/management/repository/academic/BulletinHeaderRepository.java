package com.school.management.repository.academic;

import com.school.management.model.academic.BulletinHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BulletinHeaderRepository extends JpaRepository<BulletinHeader, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Récupère la configuration spécifique de l'école courante
    Optional<BulletinHeader> findBySchoolId(Long schoolId);
}