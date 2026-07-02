package com.school.management.repository.academic;

import com.school.management.model.academic.DomainSpeciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DomainSpecialityRepository extends JpaRepository<DomainSpeciality, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Recherche d'unicité locale au niveau du tenant
    Optional<DomainSpeciality> findByNameIgnoreCaseAndSchoolId(String name, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Liste toutes les spécialités de l'école active
    List<DomainSpeciality> findBySchoolId(Long schoolId);
}