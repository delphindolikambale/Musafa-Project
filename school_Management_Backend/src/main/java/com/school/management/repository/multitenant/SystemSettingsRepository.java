package com.school.management.repository.multitenant;

import com.school.management.model.multitenant.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
}