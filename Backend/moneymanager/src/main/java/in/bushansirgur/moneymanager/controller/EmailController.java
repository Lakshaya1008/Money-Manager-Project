package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.service.*;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

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
    public ResponseEntity<Void> emailIncomeExcel() throws IOException, MessagingException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        excelService.writeIncomesToExcel(baos, incomeService.getCurrentMonthIncomesForCurrentUser());
        emailService.sendEmailWithAttachment(profile.getEmail(),
                "Your Income Excel Report",
                "Please find attached your income report",
                baos.toByteArray(),
                "income.xlsx");
        return ResponseEntity.ok(null);
    }

    @GetMapping("/expense-excel")
    public ResponseEntity<Void> emailExpenseExcel() throws IOException, MessagingException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        excelService.writeExpensesToExcel(baos, expenseService.getCurrentMonthExpensesForCurrentUser());
        emailService.sendEmailWithAttachment(
                profile.getEmail(),
                "Your Expense Excel Report",
                "Please find attached your expense report.",
                baos.toByteArray(),
                "expenses.xlsx");
        return ResponseEntity.ok(null);
    }

    @GetMapping("/test")
    public ResponseEntity<String> sendTestEmail() {
        try {
            // You can change this to any email you want to test
            String to = "93d520002@smtp-brevo.com";
            String subject = "Test Email from Money Manager";
            String body = "This is a test email to verify your email configuration.";
            emailService.sendEmail(to, subject, body);
            return ResponseEntity.ok("Test email sent successfully to: " + to);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send test email: " + e.getMessage());
        }
    }
}
