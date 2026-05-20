package com.school.management.service.financialImpl;

import com.school.management.dto.financial.DetailsCashTransactionCreateDTO;
import com.school.management.dto.financial.DetailsCashTransactionResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import com.school.management.model.financial.CashTransaction;
import com.school.management.model.financial.DetailsCashTransaction;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.CashTransactionRepository;
import com.school.management.repository.financial.DetailsCashTransactionRepository;
import com.school.management.service.financial.DetailsCashTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class DetailsCashTransactionServiceImpl implements DetailsCashTransactionService {

    private final DetailsCashTransactionRepository repository;
    private final CashTransactionRepository cashTransactionRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public void record(DetailsCashTransactionCreateDTO dto) {
        DetailsCashTransaction tx = DetailsCashTransaction.builder()
                .academicYear(dto.getAcademicYear())
                .month(dto.getMonth())
                .transactionDate(LocalDateTime.now())
                .type(dto.getType())
                .description(dto.getDescription())
                .currency(dto.getCurrency())
                .amount(dto.getAmount())
                .actor(dto.getActor())
                .documentNumber(dto.getDocumentNumber())
                .build();
        repository.save(tx);

        updateDailySummary(tx);
    }

    private void updateDailySummary(DetailsCashTransaction detail) {
        LocalDate today = detail.getTransactionDate().toLocalDate();

        AcademicYear year = academicYearRepository.findAll().stream()
                .filter(y -> y.getAnnee() != null && y.getAnnee().equals(detail.getAcademicYear()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée : " + detail.getAcademicYear()));

        CashTransaction summary = cashTransactionRepository.findByTransactionDateAndAcademicYearId(today, year.getId())
                .orElse(CashTransaction.builder()
                        .transactionDate(today)
                        .academicYear(year)
                        .description("Récapitulatif des opérations")
                        .type(detail.getType())
                        .totalEntryUSD(BigDecimal.ZERO)
                        .totalExitUSD(BigDecimal.ZERO)
                        .totalEntryCDF(BigDecimal.ZERO)
                        .totalExitCDF(BigDecimal.ZERO)
                        .balanceUSD(BigDecimal.ZERO)
                        .balanceCDF(BigDecimal.ZERO)
                        .build());

        if (detail.getCurrency() == Currency.USD) {
            if (detail.getType() == TransactionType.ENTREE) {
                summary.setTotalEntryUSD(summary.getTotalEntryUSD().add(detail.getAmount()));
            } else {
                summary.setTotalExitUSD(summary.getTotalExitUSD().add(detail.getAmount()));
            }
        } else {
            if (detail.getType() == TransactionType.ENTREE) {
                summary.setTotalEntryCDF(summary.getTotalEntryCDF().add(detail.getAmount()));
            } else {
                summary.setTotalExitCDF(summary.getTotalExitCDF().add(detail.getAmount()));
            }
        }

        cashTransactionRepository.save(summary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetailsCashTransactionResponseDTO> getJournalDetails(String academicYear) {
        return repository.findByAcademicYearOrderByTransactionDateDesc(academicYear).stream()
                .map(tx -> DetailsCashTransactionResponseDTO.builder()
                        .id(tx.getId())
                        .academicYear(tx.getAcademicYear())
                        .month(tx.getMonth())
                        .transactionDate(tx.getTransactionDate())
                        .type(tx.getType().name())
                        .description(tx.getDescription())
                        .currency(tx.getCurrency().name())
                        .amount(tx.getAmount())
                        .actor(tx.getActor())
                        .documentNumber(tx.getDocumentNumber())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void migrateAll() {
        cashTransactionRepository.deleteAll();
        List<DetailsCashTransaction> allDetails = repository.findAll().stream()
                .sorted((a, b) -> a.getTransactionDate().compareTo(b.getTransactionDate()))
                .collect(Collectors.toList());

        for (DetailsCashTransaction detail : allDetails) {
            updateDailySummary(detail);
        }
    }
}