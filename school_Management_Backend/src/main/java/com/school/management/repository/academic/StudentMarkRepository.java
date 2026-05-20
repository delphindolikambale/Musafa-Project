package com.school.management.repository.academic;

import com.school.management.model.academic.StudentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentMarkRepository extends JpaRepository<StudentMark, Long> {
    List<StudentMark> findByEvaluationTaskId(Long taskId);
    List<StudentMark> findByStudentIdAndEvaluationTaskTeacherAssignmentId(Long studentId, Long taId);
}
