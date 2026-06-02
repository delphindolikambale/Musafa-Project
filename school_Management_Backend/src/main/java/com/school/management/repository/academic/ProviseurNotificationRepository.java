package com.school.management.repository.academic;

import com.school.management.model.academic.ProviseurNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviseurNotificationRepository extends JpaRepository<ProviseurNotification, Long> {
    List<ProviseurNotification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<ProviseurNotification> findByTargetRoleAndReadStatusFalseOrderByCreatedAtDesc(String targetRole);
    long countByTargetRoleAndReadStatusFalse(String targetRole);
}