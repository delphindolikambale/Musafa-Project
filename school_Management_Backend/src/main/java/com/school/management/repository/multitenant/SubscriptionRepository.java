package com.school.management.repository.multitenant;

import com.school.management.model.multitenant.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findBySchoolIdOrderByEndDateDesc(Long schoolId);
}