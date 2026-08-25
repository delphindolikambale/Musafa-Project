package com.school.management.service.academic;

import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.model.academic.TeacherBulletinNotification;

import java.util.List;
import java.util.Map;

public interface BulletinTitulaireService {

    void validateGradeSheet(Long classroomId, Long subjectId, String periodId, Long academicYearId, Long schoolId);

    void notifyTeacherOnRelease(Long schoolId, Long teacherId, String classroomName, String periodId);

    List<BulletinFolderDTO> getBulletinFolders(Long teacherId, Long academicYearId, Long schoolId);

    List<StudentBulletinRowDTO> getStudentsInFolder(Long folderId);

    Map<String, Object> getStudentBulletinData(Long classroomId, Long studentId);

    List<TeacherBulletinNotification> getTeacherNotifications(Long teacherId, Long schoolId);

    void deleteNotification(Long notificationId);
}