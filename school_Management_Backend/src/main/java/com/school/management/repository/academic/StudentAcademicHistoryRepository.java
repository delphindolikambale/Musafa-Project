package com.school.management.repository.academic;
import com.school.management.model.academic.StudentAcademicHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface StudentAcademicHistoryRepository extends JpaRepository<StudentAcademicHistory, Long> {

}
