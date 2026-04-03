package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class ExcelService {

    // e.g. "03 Apr 2026"
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private String formatDate(LocalDateTime dt) {
        return dt != null ? dt.format(DATE_FMT) : "N/A";
    }

    public void writeIncomesToExcel(OutputStream httpStream, List<IncomeDTO> incomes) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Incomes");
            buildHeaderRow(sheet, "S.No", "Name", "Category", "Amount", "Date");
            IntStream.range(0, incomes.size()).forEach(i -> {
                IncomeDTO income = incomes.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(income.getName() != null ? income.getName() : "N/A");
                row.createCell(2).setCellValue(income.getCategoryName() != null ? income.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(income.getAmount() != null ? income.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(formatDate(income.getDate()));
            });
            workbook.write(baos);
        }
        httpStream.write(baos.toByteArray());
        httpStream.flush();
    }

    public void writeExpensesToExcel(OutputStream httpStream, List<ExpenseDTO> expenses) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses");
            buildHeaderRow(sheet, "S.No", "Name", "Category", "Amount", "Date");
            IntStream.range(0, expenses.size()).forEach(i -> {
                ExpenseDTO expense = expenses.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(expense.getName() != null ? expense.getName() : "N/A");
                row.createCell(2).setCellValue(expense.getCategoryName() != null ? expense.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(expense.getAmount() != null ? expense.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(formatDate(expense.getDate()));
            });
            workbook.write(baos);
        }
        httpStream.write(baos.toByteArray());
        httpStream.flush();
    }

    public void writeFullReportToExcel(OutputStream httpStream, List<IncomeDTO> incomes, List<ExpenseDTO> expenses) throws IOException {

        // Combine incomes and expenses into a single list of rows, sorted by date descending
        record TransactionRow(LocalDateTime date, String type, String name, String category, double amount) {}

        List<TransactionRow> rows = new ArrayList<>();

        for (IncomeDTO income : incomes) {
            rows.add(new TransactionRow(
                    income.getDate(),
                    "Income",
                    income.getName() != null ? income.getName() : "N/A",
                    income.getCategoryName() != null ? income.getCategoryName() : "N/A",
                    income.getAmount() != null ? income.getAmount().doubleValue() : 0
            ));
        }

        for (ExpenseDTO expense : expenses) {
            rows.add(new TransactionRow(
                    expense.getDate(),
                    "Expense",
                    expense.getName() != null ? expense.getName() : "N/A",
                    expense.getCategoryName() != null ? expense.getCategoryName() : "N/A",
                    expense.getAmount() != null ? expense.getAmount().doubleValue() : 0
            ));
        }

        // Sort by date descending (newest first), nulls last
        rows.sort(Comparator.comparing(TransactionRow::date,
                Comparator.nullsLast(Comparator.reverseOrder())));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("All Transactions");
            buildHeaderRow(sheet, "S.No", "Type", "Name", "Category", "Amount", "Date");

            for (int i = 0; i < rows.size(); i++) {
                TransactionRow tx = rows.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(tx.type());
                row.createCell(2).setCellValue(tx.name());
                row.createCell(3).setCellValue(tx.category());
                row.createCell(4).setCellValue(tx.amount());
                row.createCell(5).setCellValue(formatDate(tx.date()));
            }

            workbook.write(baos);
        }
        httpStream.write(baos.toByteArray());
        httpStream.flush();
    }

    private void buildHeaderRow(Sheet sheet, String... headers) {
        Row header = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            header.createCell(i).setCellValue(headers[i]);
        }
    }
}