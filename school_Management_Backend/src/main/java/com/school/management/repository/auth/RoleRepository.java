package com.school.management.repository.auth;

import com.school.management.model.auth.Role;
import com.school.management.model.enums.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(AppRole name);

}
