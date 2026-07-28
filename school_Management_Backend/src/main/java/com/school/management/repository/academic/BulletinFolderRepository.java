package com.school.management.repository.academic;

import com.school.management.model.academic.BulletinFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BulletinFolderRepository extends JpaRepository<BulletinFolder, Long> {
    Optional<BulletinFolder> findByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long academicYearId, Long schoolId);

    List<BulletinFolder> findByClassroomId(Long classroomId);
}