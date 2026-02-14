package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final ExcelService excelService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final EmailService emailService;
    private final ProfileService profileService;

    @GetMapping("/income-excel")
    public ResponseEntity<Map<String, Object>> emailIncomeExcel() throws IOException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        excelService.writeIncomesToExcel(baos, incomeService.getCurrentMonthIncomesForCurrentUser());
        emailService.sendEmailWithAttachment(profile.getEmail(),
                "Your Income Excel Report",
                "Please find attached your income report",
                baos.toByteArray(),
                "income.xlsx");
        return ResponseEntity.ok(buildSuccessResponse("Income report sent successfully to " + profile.getEmail()));
    }

    @GetMapping("/expense-excel")
    public ResponseEntity<Map<String, Object>> emailExpenseExcel() throws IOException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        excelService.writeExpensesToExcel(baos, expenseService.getCurrentMonthExpensesForCurrentUser());
        emailService.sendEmailWithAttachment(
                profile.getEmail(),
                "Your Expense Excel Report",
                "Please find attached your expense report.",
                baos.toByteArray(),
                "expenses.xlsx");
        return ResponseEntity.ok(buildSuccessResponse("Expense report sent successfully to " + profile.getEmail()));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> sendTestEmail() {
        ProfileEntity profile = profileService.getCurrentProfile();
        String subject = "Test Email from Money Manager";
        String body = "This is a test email to verify your email configuration is working correctly.";
        emailService.sendEmail(profile.getEmail(), subject, body);
        return ResponseEntity.ok(buildSuccessResponse("Test email sent successfully to " + profile.getEmail()));
    }

    private Map<String, Object> buildSuccessResponse(String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", 200);
        response.put("message", message);
        return response;
    }
}
