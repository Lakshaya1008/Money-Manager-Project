package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
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

    // ROOT CAUSE FIX — "only income downloaded on full report"
    //
    // BUG: the previous version passed filterIncomes() and filterExpenses() as
    // INLINE ARGUMENTS to writeFullReportToExcel(). Java evaluates arguments
    // left-to-right before calling the method. So execution order was:
    //
    //   1. response.getOutputStream()   <- HTTP stream opens, status 200 committed
    //   2. filterIncomes(...)           <- incomes fetched OK
    //   3. filterExpenses(...)          <- throws (EAGER fetch bug, see ExpenseEntity)
    //   4. writeFullReportToExcel()     <- never reached
    //
    // Because the stream was opened at step 1, Spring's GlobalExceptionHandler
    // cannot send back a JSON error — the response is already committed.
    // The client receives a truncated .xlsx that opens in Excel showing only
    // the Incomes sheet with no error message shown to the user.
    //
    // FIX: fetch BOTH lists before touching the response stream.
    // If either query throws, it happens before step 1, so Spring CAN return
    // a proper JSON error response that the frontend can display as a toast.
    @GetMapping("/download/full")
    public void downloadFullReport(
            HttpServletResponse response,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false, defaultValue = "") String keyword
    ) throws IOException {
        Sort sort = Sort.by(Sort.Direction.DESC, "date");

        // Step 1: fetch both lists — any DB exception here returns a JSON error
        List<IncomeDTO>  incomes  = incomeService.filterIncomes(startDate, endDate, keyword, sort);
        List<ExpenseDTO> expenses = expenseService.filterExpenses(startDate, endDate, keyword, sort);

        // Step 2: both succeeded — now safe to open the binary stream
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