package com.school.management.service.financialImpl;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency; // Importatio
import com.school.management.dto.financial.CashierDashboardDTO;
import com.school.management.model.financial.Expense;
import com.school.management.model.financial.StudentAnnualFinancialProfile;
import com.school.management.model.financial.StudentPayment;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.ExpenseRepository;
import com.school.management.repository.financial.StudentAnnualFinancialProfileRepository;
import com.school.management.repository.financial.StudentPaymentRepository;
import com.school.management.service.financial.CashierDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashierDashboardServiceImpl implements CashierDashboardService {

    private final StudentAnnualFinancialProfileRepository profileRepository;
    private final StudentPaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional(readOnly = true)
    public CashierDashboardDTO getGlobalStats(Long academicYearId) {

        // Récupération de l'année académique pour le libellé
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée avec l'ID: " + academicYearId));

        List<StudentAnnualFinancialProfile> profiles = profileRepository.findByAcademicYearId(academicYearId);
        List<StudentPayment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getAnnualProfile().getAcademicYear().getId().equals(academicYearId))
                .toList();
        List<Expense> expenses = expenseRepository.findByAcademicYearId(academicYearId);

        // Sommes USD
        BigDecimal totalExpectedUsd = sumProfileAmount(profiles, Currency.USD, StudentAnnualFinancialProfile::getTotalAmountDue);
        BigDecimal totalReceivedUsd = sumProfileAmount(profiles, Currency.USD, StudentAnnualFinancialProfile::getTotalAmountPaid);
        BigDecimal totalDebtsUsd = sumProfileAmount(profiles, Currency.USD, StudentAnnualFinancialProfile::getBalance);
        BigDecimal totalExpensesUsd = sumExpenseAmount(expenses, Currency.USD);

        // Sommes CDF
        BigDecimal totalExpectedCdf = sumProfileAmount(profiles, Currency.CDF, StudentAnnualFinancialProfile::getTotalAmountDue);
        BigDecimal totalReceivedCdf = sumProfileAmount(profiles, Currency.CDF, StudentAnnualFinancialProfile::getTotalAmountPaid);
        BigDecimal totalDebtsCdf = sumProfileAmount(profiles, Currency.CDF, StudentAnnualFinancialProfile::getBalance);
        BigDecimal totalExpensesCdf = sumExpenseAmount(expenses, Currency.CDF);

        // Performance par Classe
        Map<String, List<StudentAnnualFinancialProfile>> profilesByClass = profiles.stream()
                .collect(Collectors.groupingBy(p -> p.getEnrollment().getClassroom().getDisplayName()));

        List<CashierDashboardDTO.ClassPerformanceDTO> classPerformances = profilesByClass.entrySet().stream()
                .map(entry -> {
                    BigDecimal due = entry.getValue().stream().map(StudentAnnualFinancialProfile::getTotalAmountDue).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal paid = entry.getValue().stream().map(StudentAnnualFinancialProfile::getTotalAmountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
                    double ratio = (due.compareTo(BigDecimal.ZERO) > 0) ? (paid.doubleValue() / due.doubleValue()) * 100 : 0;
                    return new CashierDashboardDTO.ClassPerformanceDTO(entry.getKey(), Math.round(ratio * 100.0) / 100.0);
                })
                .sorted(Comparator.comparing(CashierDashboardDTO.ClassPerformanceDTO::getRatio).reversed())
                .collect(Collectors.toList());

        return CashierDashboardDTO.builder()
                .academicYearLabel(academicYear.getAnnee()) // Injection du nom de l'année
                .totalExpectedUsd(totalExpectedUsd)
                .totalExpectedCdf(totalExpectedCdf)
                .totalReceivedUsd(totalReceivedUsd)
                .totalReceivedCdf(totalReceivedCdf)
                .totalDebtsUsd(totalDebtsUsd)
                .totalDebtsCdf(totalDebtsCdf)
                .totalExpensesUsd(totalExpensesUsd)
                .totalExpensesCdf(totalExpensesCdf)
                .netCashUsd(totalReceivedUsd.subtract(totalExpensesUsd))
                .netCashCdf(totalReceivedCdf.subtract(totalExpensesCdf))
                .classPerformances(classPerformances)
                .monthlyFlows(calculateMonthlyFlows(payments, expenses))
                .build();
    }

    // Helpers
    private BigDecimal sumProfileAmount(List<StudentAnnualFinancialProfile> list, Currency currency, java.util.function.Function<StudentAnnualFinancialProfile, BigDecimal> mapper) {
        return list.stream().filter(p -> p.getCurrency() == currency).map(mapper).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumExpenseAmount(List<Expense> list, Currency currency) {
        return list.stream().filter(e -> e.getCurrency() == currency).map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CashierDashboardDTO.MonthlyFlowDTO> calculateMonthlyFlows(List<StudentPayment> payments, List<Expense> expenses) {
        Map<Integer, CashierDashboardDTO.MonthlyFlowDTO> monthlyData = new TreeMap<>(); // TreeMap trie par mois (1-12)

        for (StudentPayment p : payments) {
            int monthVal = p.getPaymentDate().getMonthValue();
            String monthName = p.getPaymentDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH);

            monthlyData.putIfAbsent(monthVal, new CashierDashboardDTO.MonthlyFlowDTO(monthName, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
            CashierDashboardDTO.MonthlyFlowDTO dto = monthlyData.get(monthVal);

            if (p.getCurrency() == Currency.USD) {
                dto.setIncomeUsd(dto.getIncomeUsd().add(p.getAmountPaid()));
            } else {
                dto.setIncomeCdf(dto.getIncomeCdf().add(p.getAmountPaid()));
            }
        }

        for (Expense e : expenses) {
            int monthVal = e.getExpenseDate().getMonthValue();
            String monthName = e.getExpenseDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH);

            monthlyData.putIfAbsent(monthVal, new CashierDashboardDTO.MonthlyFlowDTO(monthName, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
            CashierDashboardDTO.MonthlyFlowDTO dto = monthlyData.get(monthVal);

            if (e.getCurrency() == Currency.USD) {
                dto.setExpensesUsd(dto.getExpensesUsd().add(e.getAmount()));
            } else {
                dto.setExpensesCdf(dto.getExpensesCdf().add(e.getAmount()));
            }
        }
        return new ArrayList<>(monthlyData.values());
    }

}
