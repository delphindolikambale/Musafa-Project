package com.school.management.service.academic;

import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;

import java.util.List;

public interface BulletinTitulaireService {
    void validateGradeSheet(Long classroomId, Long subjectId, String periodId, Long academicYearId, Long schoolId);
    void notifyTeacherOnRelease(Long schoolId, Long teacherId, String classroomName, String periodId);

    // ✅ NOUVEAU : Méthodes pour gérer les dossiers et les élèves du bulletin
    List<BulletinFolderDTO> getBulletinFolders(Long teacherId, Long academicYearId, Long schoolId);
    List<StudentBulletinRowDTO> getStudentsInFolder(Long classroomId, Long academicYearId, Long schoolId);
}