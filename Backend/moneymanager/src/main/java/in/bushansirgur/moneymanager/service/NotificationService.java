package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final ExcelService excelService;

    @Value("${money.manager.frontend.url}")
    private String frontendUrl;

    // ── Job 1: 10 PM reminder ─────────────────────────────────────────────────
    // Simple nudge email — no data, no attachment.
    // Just a link back to the app to remind the user to log today's transactions.
    @Scheduled(cron = "0 0 22 * * *", zone = "Asia/Kolkata")
    public void sendDailyReminder() {
        log.info("Job started: sendDailyReminder()");
        List<ProfileEntity> profiles = profileRepository.findByIsActiveTrue();

        for (ProfileEntity profile : profiles) {
            try {
                String body = "Hi " + profile.getFullName() + ",<br><br>"
                        + "This is a friendly reminder to log your income and expenses for today.<br><br>"
                        + "<a href=" + frontendUrl + " style='display:inline-block;padding:10px 20px;"
                        + "background-color:#7c3aed;color:#fff;text-decoration:none;border-radius:5px;"
                        + "font-weight:bold;'>Open Money Manager</a>"
                        + "<br><br>Best regards,<br>Money Manager Team";
                emailService.sendEmail(profile.getEmail(),
                        "Daily reminder: Log your income & expenses", body);
            } catch (Exception e) {
                log.warn("Failed to send reminder to {}: {}", profile.getEmail(), e.getMessage());
            }
        }
        log.info("Job completed: sendDailyReminder()");
    }

    // ── Job 2: 11 PM full daily report with Excel attachment ──────────────────
    // Sends a combined HTML summary of today's income AND expenses.
    // Attaches a full_report_yyyy-MM-dd.xlsx with two sheets (Incomes + Expenses).
    // Only fires for users who recorded at least one transaction today.
    @Scheduled(cron = "0 0 23 * * *", zone = "Asia/Kolkata")
    public void sendDailyFullReport() {
        log.info("Job started: sendDailyFullReport()");
        List<ProfileEntity> profiles = profileRepository.findByIsActiveTrue();

        LocalDate today       = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay   = today.atTime(23, 59, 59);
        String dateLabel = today.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String fileDate  = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        for (ProfileEntity profile : profiles) {
            try {
                // Fetch by profileId directly — scheduler has no security context
                List<IncomeDTO>  todaysIncomes  = incomeService.getIncomesForUserOnDateRange(
                        profile.getId(), startOfDay, endOfDay);
                List<ExpenseDTO> todaysExpenses = expenseService.getExpensesForUserOnDateRange(
                        profile.getId(), startOfDay, endOfDay);

                // Nothing recorded today — skip silently
                if (todaysIncomes.isEmpty() && todaysExpenses.isEmpty()) {
                    continue;
                }

                // ── HTML email body ───────────────────────────────────────────
                StringBuilder body = new StringBuilder();
                body.append("Hi ").append(profile.getFullName()).append(",<br><br>")
                        .append("Here is your complete financial summary for <strong>")
                        .append(dateLabel).append("</strong>.<br><br>");

                // Income table
                if (!todaysIncomes.isEmpty()) {
                    BigDecimal totalIncome = todaysIncomes.stream()
                            .map(IncomeDTO::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    body.append("<h3 style='color:#16a34a;margin-bottom:8px;'>&#128176; Income</h3>")
                            .append("<table style='border-collapse:collapse;width:100%;margin-bottom:20px;'>")
                            .append("<tr style='background-color:#f0fdf4;'>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>S.No</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Name</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Category</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Amount (&#8377;)</th>")
                            .append("</tr>");
                    int i = 1;
                    for (IncomeDTO inc : todaysIncomes) {
                        body.append("<tr>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(i++).append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(inc.getName()).append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>")
                                .append(inc.getCategoryName() != null ? inc.getCategoryName() : "N/A").append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(inc.getAmount()).append("</td>")
                                .append("</tr>");
                    }
                    body.append("<tr style='background-color:#f0fdf4;font-weight:bold;'>")
                            .append("<td colspan='3' style='border:1px solid #ddd;padding:8px;text-align:right;'>Total Income</td>")
                            .append("<td style='border:1px solid #ddd;padding:8px;'>&#8377;").append(totalIncome).append("</td>")
                            .append("</tr></table>");
                } else {
                    body.append("<p style='color:#6b7280;margin-bottom:16px;'>No income recorded today.</p>");
                }

                // Expense table
                if (!todaysExpenses.isEmpty()) {
                    BigDecimal totalExpense = todaysExpenses.stream()
                            .map(ExpenseDTO::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    body.append("<h3 style='color:#dc2626;margin-bottom:8px;'>&#128184; Expenses</h3>")
                            .append("<table style='border-collapse:collapse;width:100%;margin-bottom:20px;'>")
                            .append("<tr style='background-color:#fef2f2;'>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>S.No</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Name</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Category</th>")
                            .append("<th style='border:1px solid #ddd;padding:8px;'>Amount (&#8377;)</th>")
                            .append("</tr>");
                    int j = 1;
                    for (ExpenseDTO exp : todaysExpenses) {
                        body.append("<tr>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(j++).append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(exp.getName()).append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>")
                                .append(exp.getCategoryName() != null ? exp.getCategoryName() : "N/A").append("</td>")
                                .append("<td style='border:1px solid #ddd;padding:8px;'>").append(exp.getAmount()).append("</td>")
                                .append("</tr>");
                    }
                    body.append("<tr style='background-color:#fef2f2;font-weight:bold;'>")
                            .append("<td colspan='3' style='border:1px solid #ddd;padding:8px;text-align:right;'>Total Expenses</td>")
                            .append("<td style='border:1px solid #ddd;padding:8px;'>&#8377;").append(totalExpense).append("</td>")
                            .append("</tr></table>");
                } else {
                    body.append("<p style='color:#6b7280;margin-bottom:16px;'>No expenses recorded today.</p>");
                }

                body.append("<p style='color:#6b7280;font-size:13px;'>")
                        .append("The full report is attached as an Excel file with separate Income and Expense sheets.")
                        .append("</p><br>Best regards,<br>Money Manager Team");

                // ── Excel attachment (two sheets: Incomes + Expenses) ─────────
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                excelService.writeFullReportToExcel(baos, todaysIncomes, todaysExpenses);

                emailService.sendEmailWithAttachment(
                        profile.getEmail(),
                        "Daily Report — " + dateLabel,
                        body.toString(),
                        baos.toByteArray(),
                        "daily_report_" + fileDate + ".xlsx"
                );

                log.info("Daily full report sent to {}", profile.getEmail());

            } catch (Exception e) {
                // One user failing must not stop other users from getting their report
                log.warn("Failed to send daily report to {}: {}", profile.getEmail(), e.getMessage());
            }
        }
        log.info("Job completed: sendDailyFullReport()");
    }
}