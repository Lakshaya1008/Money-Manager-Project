package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.service.ExcelService;
import in.bushansirgur.moneymanager.service.ExpenseService;
import in.bushansirgur.moneymanager.service.IncomeService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    @GetMapping("/download/income")
    public void downloadIncomeExcel(HttpServletResponse response) throws IOException {
        List<IncomeDTO> incomes = incomeService.getCurrentMonthIncomesForCurrentUser();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
        excelService.writeIncomesToExcel(response.getOutputStream(), incomes);
    }

    @GetMapping("/download/expense")
    public void downloadExpenseExcel(HttpServletResponse response) throws IOException {
        List<ExpenseDTO> expenses = expenseService.getCurrentMonthExpensesForCurrentUser();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=expense.xlsx");
        excelService.writeExpensesToExcel(response.getOutputStream(), expenses);
    }

    @GetMapping("/download/full")
    public void downloadFullReport(
            HttpServletResponse response,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false, defaultValue = "") String keyword
    ) throws IOException {
        Sort sort = Sort.by(Sort.Direction.DESC, "date");
        List<IncomeDTO>  incomes  = incomeService.filterIncomes(startDate, endDate, keyword, sort);
        List<ExpenseDTO> expenses = expenseService.filterExpenses(startDate, endDate, keyword, sort);

        String from = startDate != null ? startDate.toLocalDate().toString() : "all";
        String to   = endDate   != null ? endDate.toLocalDate().toString()   : "today";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=full_report_" + from + "_to_" + to + ".xlsx");
        excelService.writeFullReportToExcel(response.getOutputStream(), incomes, expenses);
    }

    @GetMapping("/download/filtered")
    public void downloadFilteredReport(
            HttpServletResponse response,
            @RequestParam String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "date") String sortField,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) throws IOException {
        // FIX: validate sortField before passing to Sort.by() to prevent JPA exceptions
        if (!sortField.equals("date") && !sortField.equals("amount") && !sortField.equals("name")) {
            throw new ValidationException("sortField",
                    "Invalid sort field '" + sortField + "'. Valid values are: 'date', 'amount', 'name'");
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortField);

        String from = startDate != null ? startDate.toLocalDate().toString() : "all";
        String to   = endDate   != null ? endDate.toLocalDate().toString()   : "today";

        if ("income".equalsIgnoreCase(type)) {
            List<IncomeDTO> incomes = incomeService.filterIncomes(startDate, endDate, keyword, sort);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    "attachment; filename=income_filtered_" + from + "_to_" + to + ".xlsx");
            excelService.writeIncomesToExcel(response.getOutputStream(), incomes);
        } else {
            List<ExpenseDTO> expenses = expenseService.filterExpenses(startDate, endDate, keyword, sort);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    "attachment; filename=expense_filtered_" + from + "_to_" + to + ".xlsx");
            excelService.writeExpensesToExcel(response.getOutputStream(), expenses);
        }
    }
}