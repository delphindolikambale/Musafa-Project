package com.school.management.repository.academic;

import com.school.management.model.academic.EvaluationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationTaskRepository  extends JpaRepository<EvaluationTask, Long> {

    List<EvaluationTask> findByTeacherAssignmentIdAndPeriod(Long teacherAssignmentId, int period);

    @Query("SELECT SUM(e.maxPoints) FROM EvaluationTask e WHERE e.teacherAssignment.id = :taId AND e.period = :period")
    Double sumMaxPointsByAssignmentAndPeriod(@Param("taId") Long taId, @Param("period") int period);
}
