package com.school.management.repository.academic;

import com.school.management.model.academic.Bulletin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    boolean existsByStudentIdAndClassroomIdAndAcademicYearIdAndSchoolId(
            Long studentId, Long classroomId, Long academicYearId, Long schoolId);

    Optional<Bulletin> findByStudentIdAndClassroomIdAndAcademicYearIdAndSchoolId(
            Long studentId, Long classroomId, Long academicYearId, Long schoolId);

    List<Bulletin> findByClassroomIdAndAcademicYearIdAndSchoolId(
            Long classroomId, Long academicYearId, Long schoolId);

    List<Bulletin> findByClassroomId(Long classroomId);

    long countByClassroomIdAndAcademicYearIdAndSchoolId(
            Long classroomId, Long academicYearId, Long schoolId);

    long countByClassroomIdAndAcademicYearIdAndSchoolIdAndStatus(
            Long classroomId, Long academicYearId, Long schoolId, String status);

    // Requêtes directes par Dossier physique
    List<Bulletin> findByFolderId(Long folderId);

    long countByFolderId(Long folderId);

    long countByFolderIdAndStatus(Long folderId, String status);
}