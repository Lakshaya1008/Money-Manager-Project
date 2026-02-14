package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.FilterDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.service.ExpenseService;
import in.bushansirgur.moneymanager.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/filter")
public class FilterController {

    private final ExpenseService expenseService;
    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<?> filterTransactions(@RequestBody FilterDTO filter) {
        // Validate type field
        if (filter.getType() == null || filter.getType().trim().isEmpty()) {
            throw new ValidationException("type", "Filter type is required. Valid values are: 'income' or 'expense'");
        }

        // Preparing the data or validation
        // Use start of current year as default instead of LocalDate.MIN (which PostgreSQL can't handle)
        LocalDateTime startDate = filter.getStartDate() != null ? filter.getStartDate() : LocalDate.now().withMonth(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDate = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();

        // Validate date range
        if (startDate.isAfter(endDate)) {
            throw new ValidationException("startDate", "Start date cannot be after end date");
        }

        String keyword = filter.getKeyword() != null ? filter.getKeyword() : "";
        String sortField = filter.getSortField() != null ? filter.getSortField() : "date";

        // Validate sort field
        if (!sortField.equals("date") && !sortField.equals("amount") && !sortField.equals("name")) {
            throw new ValidationException("sortField", "Invalid sort field '" + sortField + "'. Valid values are: 'date', 'amount', 'name'");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(filter.getSortOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortField);

        if ("income".equalsIgnoreCase(filter.getType())) {
            List<IncomeDTO> incomes = incomeService.filterIncomes(startDate, endDate, keyword, sort);
            return ResponseEntity.ok(incomes);
        } else if ("expense".equalsIgnoreCase(filter.getType())) {
            List<ExpenseDTO> expenses = expenseService.filterExpenses(startDate, endDate, keyword, sort);
            return ResponseEntity.ok(expenses);
        } else {
            throw new ValidationException("type", "Invalid filter type '" + filter.getType() + "'. Valid values are: 'income' or 'expense'");
        }
    }
}
