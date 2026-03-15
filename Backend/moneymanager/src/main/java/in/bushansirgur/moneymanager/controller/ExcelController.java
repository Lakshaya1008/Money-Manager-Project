package in.bushansirgur.moneymanager.controller;

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

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    @GetMapping("/download/income")
    public void downloadIncomeExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
        excelService.writeIncomesToExcel(response.getOutputStream(), incomeService.getCurrentMonthIncomesForCurrentUser());
    }

    @GetMapping("/download/expense")
    public void downloadExpenseExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=expense.xlsx");
        excelService.writeExpensesToExcel(response.getOutputStream(), expenseService.getCurrentMonthExpensesForCurrentUser());
    }

    // Fixed: this endpoint was missing — Filter page "Download Full Report" button was getting 404.
    // Accepts optional startDate, endDate, keyword query params to match the filter the user applied.
    @GetMapping("/download/full")
    public void downloadFullReport(
            HttpServletResponse response,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false, defaultValue = "") String keyword
    ) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        // Build a meaningful filename if date range was provided
        String from = startDate != null ? startDate.toLocalDate().toString() : "all";
        String to   = endDate   != null ? endDate.toLocalDate().toString()   : "today";
        response.setHeader("Content-Disposition",
                "attachment; filename=full_report_" + from + "_to_" + to + ".xlsx");

        Sort sort = Sort.by(Sort.Direction.DESC, "date");

        excelService.writeFullReportToExcel(
                response.getOutputStream(),
                incomeService.filterIncomes(startDate, endDate, keyword, sort),
                expenseService.filterExpenses(startDate, endDate, keyword, sort)
        );
    }
}