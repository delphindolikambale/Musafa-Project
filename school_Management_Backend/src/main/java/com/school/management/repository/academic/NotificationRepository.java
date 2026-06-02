package com.school.management.repository.academic;


import com.school.management.model.academic.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<Notification> findByTargetRoleAndReadStatusFalseOrderByCreatedAtDesc(String targetRole);
    long countByTargetRoleAndReadStatusFalse(String targetRole);

}
