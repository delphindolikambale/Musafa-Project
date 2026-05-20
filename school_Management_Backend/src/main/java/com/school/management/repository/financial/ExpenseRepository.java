package com.school.management.repository.financial;

import com.school.management.model.financial.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Compte les bons pour générer le prochain numéro unique par mois/année
    long countByVoucherNumberStartingWith(String prefix);
    List<Expense> findByAcademicYearId(Long academicYearId);
}
