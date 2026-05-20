package com.school.management.repository.financial;

import com.school.management.model.financial.DetailsCashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface DetailsCashTransactionRepository extends JpaRepository<DetailsCashTransaction, Long> {
    List<DetailsCashTransaction> findByAcademicYearOrderByTransactionDateDesc(String academicYear);
}
