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
    public void record(DetailsCashTransactionCreateDTO dto, Long schoolId) {
        // Filtrage initial pour garantir que l'année textuelle appartient bien à l'école connectée
        AcademicYear year = academicYearRepository.findAll().stream()
                .filter(y -> y.getSchool() != null && y.getSchool().getId().equals(schoolId) && y.getAnnee() != null && y.getAnnee().equals(dto.getAcademicYear()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée ou non autorisée pour cette école : " + dto.getAcademicYear()));

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
                .school(year.getSchool()) // ✅ Association obligatoire du tenant
                .build();
        repository.save(tx);

        updateDailySummary(tx, schoolId);
    }

    private void updateDailySummary(DetailsCashTransaction detail, Long schoolId) {
        LocalDate today = detail.getTransactionDate().toLocalDate();

        AcademicYear year = academicYearRepository.findAll().stream()
                .filter(y -> y.getSchool() != null && y.getSchool().getId().equals(schoolId) && y.getAnnee() != null && y.getAnnee().equals(detail.getAcademicYear()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée pour cette école : " + detail.getAcademicYear()));

        // ✅ CORRECTION : Utilisation de la méthode de repository multi-tenant pour éviter un "cannot find symbol"
        CashTransaction summary = cashTransactionRepository.findByTransactionDateAndAcademicYearIdAndSchoolId(today, year.getId(), schoolId)
                .orElse(CashTransaction.builder()
                        .transactionDate(today)
                        .academicYear(year)
                        .school(year.getSchool()) // ✅ Sécurité tenant intégrée au builder
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
    public List<DetailsCashTransactionResponseDTO> getJournalDetails(String academicYear, Long schoolId) {
        return repository.findByAcademicYearAndSchoolIdOrderByTransactionDateDesc(academicYear, schoolId).stream()
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
    public void migrateAll(Long schoolId) {
        // 🛡️ Multi-tenant Safe: Supprime uniquement les résumés liés à l'école connectée
        List<CashTransaction> schoolTxs = cashTransactionRepository.findAll().stream()
                .filter(tx -> tx.getAcademicYear() != null && tx.getAcademicYear().getSchool() != null && tx.getAcademicYear().getSchool().getId().equals(schoolId))
                .collect(Collectors.toList());
        cashTransactionRepository.deleteAll(schoolTxs);

        // 🛡️ Multi-tenant Safe: Récupère uniquement les détails appartenant à cette école
        List<DetailsCashTransaction> schoolDetails = repository.findAll().stream()
                .filter(d -> d.getSchool() != null && d.getSchool().getId().equals(schoolId))
                .sorted((a, b) -> a.getTransactionDate().compareTo(b.getTransactionDate()))
                .collect(Collectors.toList());

        for (DetailsCashTransaction detail : schoolDetails) {
            updateDailySummary(detail, schoolId);
        }
    }
}