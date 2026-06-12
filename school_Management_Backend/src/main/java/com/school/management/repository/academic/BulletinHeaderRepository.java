package com.school.management.repository.academic;

import com.school.management.model.academic.BulletinHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BulletinHeaderRepository extends JpaRepository<BulletinHeader, Long> {
    // Utile pour toujours récupérer la première et unique configuration
    Optional<BulletinHeader> findFirstByOrderByIdAsc();
}