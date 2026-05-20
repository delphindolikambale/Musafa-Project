package com.school.management.service.financialImpl;

import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.DetailsCashTransactionCreateDTO;
import com.school.management.dto.financial.ExpenseCreateDTO;
import com.school.management.dto.financial.ExpenseResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.admin.SchoolConfiguration;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import com.school.management.model.financial.Expense;
import com.school.management.model.financial.FeesGroup;
import com.school.management.model.financial.FeesItem;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.admin.SchoolConfigurationRepository;
import com.school.management.repository.financial.ExpenseRepository;
import com.school.management.repository.financial.FeesGroupRepository;
import com.school.management.repository.financial.FeesItemRepository;
import com.school.management.service.financial.CashTransactionService;
import com.school.management.service.financial.DetailsCashTransactionService;
import com.school.management.service.financial.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ExpenseServiceImpl implements ExpenseService{
    private final ExpenseRepository expenseRepository;
    private final FeesItemRepository feesItemRepository;
    private final FeesGroupRepository feesGroupRepository;
    private final AcademicYearRepository academicYearRepository;
    private final DetailsCashTransactionService detailsService;

    @Override
    @Transactional
    public ExpenseResponseDTO createExpense(ExpenseCreateDTO dto) {
        // 1. Récupération et vérification
        FeesItem item = feesItemRepository.findById(dto.getFeesItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Sous-frais introuvable"));

        FeesGroup group = item.getFeesGroup();

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable"));

        BigDecimal amount = dto.getAmount();

        // 2. Vérification du solde disponible
        if (dto.getCurrency() == Currency.USD) {
            if (item.getBalanceUSD().compareTo(amount) < 0) {
                throw new BadRequestException("Solde USD insuffisant (Dispo: " + item.getBalanceUSD() + ")");
            }
            item.setBalanceUSD(item.getBalanceUSD().subtract(amount));
            group.setBalanceUSD(group.getBalanceUSD().subtract(amount));
        } else {
            if (item.getBalanceCDF().compareTo(amount) < 0) {
                throw new BadRequestException("Solde CDF insuffisant (Dispo: " + item.getBalanceCDF() + ")");
            }
            item.setBalanceCDF(item.getBalanceCDF().subtract(amount));
            group.setBalanceCDF(group.getBalanceCDF().subtract(amount));
        }

        // 3. Sauvegarde des soldes mis à jour
        feesItemRepository.save(item);
        feesGroupRepository.save(group);

        // 4. GÉNÉRATION AUTOMATIQUE DU BON DE SORTIE (BS)
        // Format: BS-YY-MM-NNN (ex: BS-26-04-001)
        String yearSuffix = year.getAnnee().substring(2, 4);
        String monthSuffix = String.format("%02d", LocalDateTime.now().getMonthValue());
        String prefix = "BS-" + yearSuffix + "-" + monthSuffix + "-";

        long nextSequence = expenseRepository.countByVoucherNumberStartingWith(prefix) + 1;
        String voucherNumber = prefix + String.format("%03d", nextSequence);

        // 5. Création de l'entité Expense
        Expense expense = Expense.builder()
                .voucherNumber(voucherNumber)
                .description(dto.getDescription())
                .amount(amount)
                .currency(dto.getCurrency())
                .requestedBy(dto.getRequestedBy())
                .authorizedBy("CHEF_DE_CAISSE") // Peut être dynamisé via SecurityContext
                .expenseDate(LocalDateTime.now())
                .feesItem(item)
                .academicYear(year)
                .build();

        Expense saved = expenseRepository.save(expense);

        // 6. Enregistrement dans le Journal de Caisse
        String currentMonth = LocalDateTime.now().getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH).toUpperCase();
        detailsService.record(DetailsCashTransactionCreateDTO.builder()
                .academicYear(year.getAnnee())
                .month(currentMonth)
                .type(TransactionType.SORTIE)
                .description(item.getNameFeesItem() + " - " + dto.getDescription())
                .currency(dto.getCurrency())
                .amount(amount)
                .actor(dto.getRequestedBy())
                .documentNumber(voucherNumber)
                .build());

        return mapToDTO(saved);
    }

    @Override @Transactional(readOnly = true)
    public List<ExpenseResponseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public ExpenseResponseDTO getById(Long id) {
        return expenseRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Dépense introuvable"));
    }

    @Override @Transactional(readOnly = true)
    public List<ExpenseResponseDTO> getByAcademicYear(Long academicYearId) {
        return expenseRepository.findAll().stream()
                .filter(e -> e.getAcademicYear().getId().equals(academicYearId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ExpenseResponseDTO mapToDTO(Expense expense) {
        return ExpenseResponseDTO.builder()
                .id(expense.getId())
                .voucherNumber(expense.getVoucherNumber())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .currency(expense.getCurrency())
                .feesGroupName(expense.getFeesItem().getFeesGroup().getType().name())
                .feesItemName(expense.getFeesItem().getNameFeesItem())
                .requestedBy(expense.getRequestedBy())
                .authorizedBy(expense.getAuthorizedBy())
                .expenseDate(expense.getExpenseDate())
                .build();
    }
}
