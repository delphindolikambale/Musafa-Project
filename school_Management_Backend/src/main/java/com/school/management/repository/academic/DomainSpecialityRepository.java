package com.school.management.repository.academic;

import com.school.management.model.academic.DomainSpeciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface DomainSpecialityRepository extends JpaRepository<DomainSpeciality, Long> {
    Optional<DomainSpeciality> findByNameIgnoreCase(String name);
}
