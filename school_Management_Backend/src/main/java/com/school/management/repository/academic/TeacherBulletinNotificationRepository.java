package com.school.management.repository.academic;

import com.school.management.model.academic.TeacherBulletinNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherBulletinNotificationRepository extends JpaRepository<TeacherBulletinNotification, Long> {
    List<TeacherBulletinNotification> findByTeacherIdAndSchoolIdOrderByCreatedAtDesc(Long teacherId, Long schoolId);
}