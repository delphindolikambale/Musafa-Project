package com.school.management.repository.financial;

import com.school.management.model.financial.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ✅ Isolation multi-tenant ajoutée pour le compteur de séquence mensuel
    long countByVoucherNumberStartingWithAndSchoolId(String prefix, Long schoolId);

    // ✅ Isolation multi-tenant ajoutée
    List<Expense> findByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);
}