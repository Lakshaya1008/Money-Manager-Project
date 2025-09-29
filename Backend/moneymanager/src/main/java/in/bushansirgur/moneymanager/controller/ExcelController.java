package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.service.ExcelService;
import in.bushansirgur.moneymanager.service.ExpenseService;
import in.bushansirgur.moneymanager.service.IncomeService;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

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
}
