package com.school.management.service.financialImpl;

import com.school.management.dto.financial.CashReceiptDashboardDTO;
import com.school.management.dto.financial.FeesGroupSummaryDTO;
import com.school.management.dto.financial.FeesItemSummaryDTO;
import com.school.management.model.enums.Currency;
import com.school.management.model.financial.Expense;
import com.school.management.repository.financial.CashReceiptRepository;
import com.school.management.repository.financial.ExpenseRepository;
import com.school.management.service.financial.CashReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service

public class CashReceiptServiceImpl implements CashReceiptService {
    @Autowired
    private CashReceiptRepository repository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public CashReceiptDashboardDTO getDashboardData(String filterType, LocalDate date, Long classroomId) {
        LocalDateTime startDate, endDate;
        String periodLabel;
        Locale french = Locale.FRENCH;

        switch (filterType.toUpperCase()) {
            case "DAILY":
                startDate = date.atStartOfDay();
                endDate = date.atTime(LocalTime.MAX);
                periodLabel = "JOURNÉE DU " + date.getDayOfMonth() + " " + date.getMonth().getDisplayName(TextStyle.FULL, french).toUpperCase();
                break;
            case "MONTHLY":
                startDate = date.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
                endDate = date.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
                periodLabel = "MOIS DE " + date.getMonth().getDisplayName(TextStyle.FULL, french).toUpperCase() + " " + date.getYear();
                break;
            case "ANNUAL":
                startDate = date.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
                endDate = date.with(TemporalAdjusters.lastDayOfYear()).atTime(LocalTime.MAX);
                periodLabel = "ANNÉE SCOLAIRE " + date.getYear();
                break;
            default: // WEEKLY
                startDate = date.minusDays(date.getDayOfWeek().getValue() - 1).atStartOfDay();
                endDate = startDate.toLocalDate().plusDays(6).atTime(LocalTime.MAX);
                periodLabel = "SEMAINE DU " + startDate.getDayOfMonth() + " AU " + endDate.getDayOfMonth() + " " + endDate.getMonth().getDisplayName(TextStyle.FULL, french).toUpperCase();
                break;
        }

        List<Object[]> flowResults = repository.getFlowReceiptsForPeriod(startDate, endDate, classroomId);
        List<Object[]> cumulativePerceptions = repository.getCumulativeReceiptsUntil(endDate);

        List<Expense> periodExpenses = expenseRepository.findAll().stream()
                .filter(e -> !e.getExpenseDate().isBefore(startDate) && !e.getExpenseDate().isAfter(endDate))
                .toList();

        return processDashboardLogic(flowResults, cumulativePerceptions, periodExpenses, periodLabel, classroomId);
    }

    private CashReceiptDashboardDTO processDashboardLogic(List<Object[]> flowResults, List<Object[]> cumulativePerceptions, List<Expense> allExpenses, String periodLabel, Long targetClassroomId) {
        CashReceiptDashboardDTO dashboard = new CashReceiptDashboardDTO();
        dashboard.setPeriodLabel(periodLabel);
        dashboard.setTotalGeneralUSD(BigDecimal.ZERO);
        dashboard.setTotalGeneralCDF(BigDecimal.ZERO);
        dashboard.setGroups(new ArrayList<>());

        Map<Long, FeesGroupSummaryDTO> groupMap = new HashMap<>();

        for (Object[] row : flowResults) {
            Long groupId = (Long) row[0];
            String groupName = row[1].toString();
            String itemName = (String) row[2];
            BigDecimal amount = (BigDecimal) row[3];
            Currency currency = (Currency) row[5];

            FeesGroupSummaryDTO groupDTO = groupMap.computeIfAbsent(groupId, k -> createGroupDTO(groupId, groupName, dashboard));
            updateGroupTotals(groupDTO, dashboard, amount, currency);

            FeesItemSummaryDTO itemDTO = new FeesItemSummaryDTO();
            itemDTO.setItemName(itemName);
            itemDTO.setAmount(amount);
            itemDTO.setCurrency(currency);
            groupDTO.getItems().add(itemDTO);
        }

        applyExpensesLogic(groupMap, dashboard, cumulativePerceptions, allExpenses, targetClassroomId);

        return dashboard;
    }

    private void applyExpensesLogic(Map<Long, FeesGroupSummaryDTO> groupMap, CashReceiptDashboardDTO dashboard, List<Object[]> cumulativePerceptions, List<Expense> allExpenses, Long targetClassroomId) {
        for (Expense expense : allExpenses) {
            if (expense.getFeesItem() == null) continue;

            String itemName = expense.getFeesItem().getNameFeesItem();
            BigDecimal totalExpense = expense.getAmount();
            Currency currency = expense.getCurrency();
            Long groupId = expense.getFeesItem().getFeesGroup().getId();

            BigDecimal expenseToSubtract;

            if (targetClassroomId == null) {
                expenseToSubtract = totalExpense;
            } else {
                BigDecimal globalPerception = cumulativePerceptions.stream()
                        .filter(row -> row[1].equals(itemName) && row[3].equals(currency))
                        .map(row -> (BigDecimal) row[2])
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal classPerception = cumulativePerceptions.stream()
                        .filter(row -> row[1].equals(itemName) && row[3].equals(currency) && row[4].equals(targetClassroomId))
                        .map(row -> (BigDecimal) row[2])
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (globalPerception.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal ratio = classPerception.divide(globalPerception, 10, RoundingMode.HALF_UP);
                    expenseToSubtract = totalExpense.multiply(ratio);
                } else {
                    expenseToSubtract = BigDecimal.ZERO;
                }
            }

            if (expenseToSubtract.compareTo(BigDecimal.ZERO) > 0) {
                subtractFromDashboard(groupMap, dashboard, groupId, itemName, expenseToSubtract, currency);
            }
        }
    }

    private FeesGroupSummaryDTO createGroupDTO(Long id, String name, CashReceiptDashboardDTO dashboard) {
        FeesGroupSummaryDTO g = new FeesGroupSummaryDTO();
        g.setGroupId(id);
        g.setGroupName(name);
        g.setGroupTotalUSD(BigDecimal.ZERO);
        g.setGroupTotalCDF(BigDecimal.ZERO);
        g.setItems(new ArrayList<>());
        dashboard.getGroups().add(g);
        return g;
    }

    private void updateGroupTotals(FeesGroupSummaryDTO g, CashReceiptDashboardDTO d, BigDecimal amt, Currency cur) {
        if (cur == Currency.USD) {
            g.setGroupTotalUSD(g.getGroupTotalUSD().add(amt));
            d.setTotalGeneralUSD(d.getTotalGeneralUSD().add(amt));
        } else {
            g.setGroupTotalCDF(g.getGroupTotalCDF().add(amt));
            d.setTotalGeneralCDF(d.getTotalGeneralCDF().add(amt));
        }
    }

    private void subtractFromDashboard(Map<Long, FeesGroupSummaryDTO> map, CashReceiptDashboardDTO d, Long gId, String item, BigDecimal amtToSubtract, Currency cur) {
        FeesGroupSummaryDTO g = map.get(gId);
        if (g != null) {
            Optional<FeesItemSummaryDTO> itemOpt = g.getItems().stream()
                    .filter(i -> i.getItemName().equals(item) && i.getCurrency() == cur)
                    .findFirst();

            if (itemOpt.isPresent()) {
                FeesItemSummaryDTO i = itemOpt.get();

                // CALCUL INTELLIGENT : On ne soustrait jamais plus que le montant disponible (Cap à 0)
                BigDecimal currentAmount = i.getAmount();
                BigDecimal actualSubtraction = amtToSubtract.min(currentAmount); // Si amt > current, on prend juste current

                // Mise à jour de l'item
                i.setAmount(currentAmount.subtract(actualSubtraction));

                // Mise à jour des totaux groupe et dashboard
                if (cur == Currency.USD) {
                    g.setGroupTotalUSD(g.getGroupTotalUSD().subtract(actualSubtraction));
                    d.setTotalGeneralUSD(d.getTotalGeneralUSD().subtract(actualSubtraction));
                } else {
                    g.setGroupTotalCDF(g.getGroupTotalCDF().subtract(actualSubtraction));
                    d.setTotalGeneralCDF(d.getTotalGeneralCDF().subtract(actualSubtraction));
                }
            }
        }
    }
}
