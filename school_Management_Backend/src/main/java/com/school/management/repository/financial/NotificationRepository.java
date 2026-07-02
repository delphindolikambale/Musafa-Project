package com.school.management.repository.financial;

import com.school.management.model.financial.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ✅ Isolation multi-tenant ajoutée pour ne lister que les notifications de l'école active
    List<Notification> findAllBySchoolIdOrderByCreatedAtDesc(Long schoolId);
}