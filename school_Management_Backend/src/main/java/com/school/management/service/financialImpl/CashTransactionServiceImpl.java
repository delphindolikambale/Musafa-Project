package com.school.management.service.financialImpl;

import com.school.management.dto.financial.CashBookDashboardDTO;
import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.CashTransactionResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.FeesGroupType;
import com.school.management.model.enums.TransactionType;
import com.school.management.model.financial.CashTransaction;
import com.school.management.model.financial.FeesGroup;
import com.school.management.model.financial.FeesItem;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.CashTransactionRepository;
import com.school.management.repository.financial.FeesGroupRepository;
import com.school.management.repository.financial.FeesItemRepository;
import com.school.management.service.financial.CashTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class CashTransactionServiceImpl implements CashTransactionService {

    private final CashTransactionRepository repository;
    private final FeesGroupRepository feesGroupRepository;
    private final FeesItemRepository feesItemRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public CashTransactionResponseDTO recordTransaction(CashTransactionCreateDTO dto) {
        FeesGroup group = dto.getFeesGroupId() != null ? feesGroupRepository.findById(dto.getFeesGroupId()).orElse(null) : null;
        FeesItem item = dto.getFeesItemId() != null ? feesItemRepository.findById(dto.getFeesItemId()).orElse(null) : null;

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée"));

        BigDecimal entUSD = BigDecimal.ZERO, sorUSD = BigDecimal.ZERO;
        BigDecimal entCDF = BigDecimal.ZERO, sorCDF = BigDecimal.ZERO;

        if (dto.getCurrency() == Currency.USD) {
            if (dto.getType() == TransactionType.ENTREE) entUSD = dto.getAmount();
            else sorUSD = dto.getAmount();
        } else {
            if (dto.getType() == TransactionType.ENTREE) entCDF = dto.getAmount();
            else sorCDF = dto.getAmount();
        }

        CashTransaction tx = CashTransaction.builder()
                .type(dto.getType())
                .description(dto.getDescription())
                .transactionDate(LocalDate.now())
                .totalEntryUSD(entUSD)
                .totalExitUSD(sorUSD)
                .totalEntryCDF(entCDF)
                .totalExitCDF(sorCDF)
                .academicYear(year)
                .feesGroup(group)
                .feesItem(item)
                .build();

        return mapToResponseDTO(repository.save(tx), BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashTransactionResponseDTO> getLivreDeCaisse(Long academicYearId) {
        List<CashTransaction> txs = repository.findByAcademicYearIdOrderByTransactionDateAsc(academicYearId);
        List<CashTransactionResponseDTO> response = new ArrayList<>();

        BigDecimal balanceUSD = BigDecimal.ZERO;
        BigDecimal balanceCDF = BigDecimal.ZERO;

        for (CashTransaction tx : txs) {
            BigDecimal entryUSD = tx.getTotalEntryUSD() != null ? tx.getTotalEntryUSD() : BigDecimal.ZERO;
            BigDecimal exitUSD = tx.getTotalExitUSD() != null ? tx.getTotalExitUSD() : BigDecimal.ZERO;
            BigDecimal entryCDF = tx.getTotalEntryCDF() != null ? tx.getTotalEntryCDF() : BigDecimal.ZERO;
            BigDecimal exitCDF = tx.getTotalExitCDF() != null ? tx.getTotalExitCDF() : BigDecimal.ZERO;

            balanceUSD = balanceUSD.add(entryUSD).subtract(exitUSD);
            balanceCDF = balanceCDF.add(entryCDF).subtract(exitCDF);

            boolean hasUSD = entryUSD.compareTo(BigDecimal.ZERO) > 0 || exitUSD.compareTo(BigDecimal.ZERO) > 0;
            boolean hasCDF = entryCDF.compareTo(BigDecimal.ZERO) > 0 || exitCDF.compareTo(BigDecimal.ZERO) > 0;

            if (hasUSD || (!hasUSD && !hasCDF)) {
                response.add(CashTransactionResponseDTO.builder()
                        .id(tx.getId() != null ? tx.getId() * 10 : null)
                        .transactionDate(tx.getTransactionDate().atStartOfDay())
                        .type(tx.getType())
                        .currency(Currency.USD)
                        .entryAmount(entryUSD)
                        .exitAmount(exitUSD)
                        .balance(balanceUSD)
                        .description(tx.getDescription() != null ? tx.getDescription() + " (USD)" : "Opérations (USD)")
                        .feesGroupName(tx.getFeesGroup() != null ? tx.getFeesGroup().getType().name() : null)
                        .feesItemName(tx.getFeesItem() != null ? tx.getFeesItem().getNameFeesItem() : null)
                        .build());
            }

            if (hasCDF) {
                response.add(CashTransactionResponseDTO.builder()
                        .id(tx.getId() != null ? tx.getId() * 10 + 1 : null)
                        .transactionDate(tx.getTransactionDate().atStartOfDay())
                        .type(tx.getType())
                        .currency(Currency.CDF)
                        .entryAmount(entryCDF)
                        .exitAmount(exitCDF)
                        .balance(balanceCDF)
                        .description(tx.getDescription() != null ? tx.getDescription() + " (CDF)" : "Opérations (CDF)")
                        .feesGroupName(tx.getFeesGroup() != null ? tx.getFeesGroup().getType().name() : null)
                        .feesItemName(tx.getFeesItem() != null ? tx.getFeesItem().getNameFeesItem() : null)
                        .build());
            }
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CashBookDashboardDTO getDashboardData(Long academicYearId) {
        List<CashTransaction> txs = repository.findByAcademicYearIdOrderByTransactionDateAsc(academicYearId);

        BigDecimal entUSD = BigDecimal.ZERO, entCDF = BigDecimal.ZERO;
        BigDecimal sorUSD = BigDecimal.ZERO, sorCDF = BigDecimal.ZERO;

        for (CashTransaction tx : txs) {
            entUSD = entUSD.add(tx.getTotalEntryUSD() != null ? tx.getTotalEntryUSD() : BigDecimal.ZERO);
            sorUSD = sorUSD.add(tx.getTotalExitUSD() != null ? tx.getTotalExitUSD() : BigDecimal.ZERO);
            entCDF = entCDF.add(tx.getTotalEntryCDF() != null ? tx.getTotalEntryCDF() : BigDecimal.ZERO);
            sorCDF = sorCDF.add(tx.getTotalExitCDF() != null ? tx.getTotalExitCDF() : BigDecimal.ZERO);
        }

        return CashBookDashboardDTO.builder()
                .totalEntriesUSD(entUSD).totalEntriesCDF(entCDF)
                .totalExitsUSD(sorUSD).totalExitsCDF(sorCDF)
                .netBalanceUSD(entUSD.subtract(sorUSD))
                .netBalanceCDF(entCDF.subtract(sorCDF))
                .build();
    }

    private CashTransactionResponseDTO mapToResponseDTO(CashTransaction tx, BigDecimal balance) {
        BigDecimal entryUSD = tx.getTotalEntryUSD() != null ? tx.getTotalEntryUSD() : BigDecimal.ZERO;
        BigDecimal exitUSD = tx.getTotalExitUSD() != null ? tx.getTotalExitUSD() : BigDecimal.ZERO;
        boolean isUSD = entryUSD.compareTo(BigDecimal.ZERO) > 0 || exitUSD.compareTo(BigDecimal.ZERO) > 0;

        return CashTransactionResponseDTO.builder()
                .id(tx.getId())
                .transactionDate(tx.getTransactionDate().atStartOfDay())
                .type(tx.getType())
                .currency(isUSD ? Currency.USD : Currency.CDF)
                .entryAmount(isUSD ? entryUSD : (tx.getTotalEntryCDF() != null ? tx.getTotalEntryCDF() : BigDecimal.ZERO))
                .exitAmount(isUSD ? exitUSD : (tx.getTotalExitCDF() != null ? tx.getTotalExitCDF() : BigDecimal.ZERO))
                .balance(balance)
                .description(tx.getDescription())
                .feesGroupName(tx.getFeesGroup() != null ? tx.getFeesGroup().getType().name() : null)
                .feesItemName(tx.getFeesItem() != null ? tx.getFeesItem().getNameFeesItem() : null)
                .build();
    }
}