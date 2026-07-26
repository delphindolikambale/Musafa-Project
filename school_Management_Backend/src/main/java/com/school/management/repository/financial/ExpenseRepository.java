package com.school.management.repository.financial;

import com.school.management.model.financial.Expense;
import com.school.management.model.enums.Currency; // ✅ Assurez-vous du bon chemin de l'enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ✅ Isolation multi-tenant ajoutée pour le compteur de séquence mensuel
    long countByVoucherNumberStartingWithAndSchoolId(String prefix, Long schoolId);

    // ✅ Isolation multi-tenant ajoutée
    List<Expense> findByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);

    // ✅ NOUVELLE MÉTHODE : Calculer le total des dépenses selon la devise et l'école
    // (Note: Si votre champ s'appelle différemment que "amount", ajustez-le ici)
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.currency = :currency AND e.school.id = :schoolId")
    BigDecimal sumAmountByCurrencyAndSchoolId(@Param("currency") Currency currency, @Param("schoolId") Long schoolId);
}