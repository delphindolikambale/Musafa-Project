package com.school.management.repository.academic;

import com.school.management.model.academic.ProviseurNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviseurNotificationRepository extends JpaRepository<ProviseurNotification, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Filtrage systématique des flux de notifications par école
    List<ProviseurNotification> findByTargetRoleAndSchoolIdOrderByCreatedAtDesc(String targetRole, Long schoolId);

    List<ProviseurNotification> findByTargetRoleAndReadStatusFalseAndSchoolIdOrderByCreatedAtDesc(String targetRole, Long schoolId);

    long countByTargetRoleAndReadStatusFalseAndSchoolId(String targetRole, Long schoolId);
}