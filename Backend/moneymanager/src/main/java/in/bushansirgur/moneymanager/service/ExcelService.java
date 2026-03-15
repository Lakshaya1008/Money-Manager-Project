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
import java.util.List;
import java.util.stream.IntStream;

@Service
public class ExcelService {

    // ROOT CAUSE OF "only income downloaded" — Apache POI 5.x bug with HTTP streams:
    //
    // XSSFWorkbook.write(OutputStream) in POI 5.x calls OPCPackage.close() internally
    // after writing. When the target stream is the HTTP response stream
    // (HttpServletResponse.getOutputStream()), this close() signals EOF to the
    // servlet container before the full xlsx zip is flushed. The browser receives
    // a truncated file. For writeFullReportToExcel this means the Incomes sheet is
    // written, then POI closes mid-stream, the Expenses sheet bytes are lost, and
    // Excel opens the file showing only Sheet 1 (Incomes).
    //
    // FIX: write the workbook to an in-memory ByteArrayOutputStream first.
    // POI can open/close its internal zip on baos freely — no impact on HTTP.
    // Then copy all bytes to the HTTP stream in one atomic write.
    // This pattern is applied to all three methods for consistency.

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
                row.createCell(2).setCellValue(income.getCategoryId() != null ? income.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(income.getAmount() != null ? income.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(income.getDate() != null ? income.getDate().toString() : "N/A");
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
                row.createCell(2).setCellValue(expense.getCategoryId() != null ? expense.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(expense.getAmount() != null ? expense.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(expense.getDate() != null ? expense.getDate().toString() : "N/A");
            });
            workbook.write(baos);
        }
        httpStream.write(baos.toByteArray());
        httpStream.flush();
    }

    public void writeFullReportToExcel(OutputStream httpStream, List<IncomeDTO> incomes, List<ExpenseDTO> expenses) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {

            // Sheet 1: Incomes
            Sheet incomeSheet = workbook.createSheet("Incomes");
            buildHeaderRow(incomeSheet, "S.No", "Name", "Category", "Amount", "Date");
            IntStream.range(0, incomes.size()).forEach(i -> {
                IncomeDTO income = incomes.get(i);
                Row row = incomeSheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(income.getName() != null ? income.getName() : "N/A");
                row.createCell(2).setCellValue(income.getCategoryId() != null ? income.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(income.getAmount() != null ? income.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(income.getDate() != null ? income.getDate().toString() : "N/A");
            });

            // Sheet 2: Expenses
            Sheet expenseSheet = workbook.createSheet("Expenses");
            buildHeaderRow(expenseSheet, "S.No", "Name", "Category", "Amount", "Date");
            IntStream.range(0, expenses.size()).forEach(i -> {
                ExpenseDTO expense = expenses.get(i);
                Row row = expenseSheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(expense.getName() != null ? expense.getName() : "N/A");
                row.createCell(2).setCellValue(expense.getCategoryId() != null ? expense.getCategoryName() : "N/A");
                row.createCell(3).setCellValue(expense.getAmount() != null ? expense.getAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(expense.getDate() != null ? expense.getDate().toString() : "N/A");
            });

            // POI writes both sheets into baos and closes its internal zip — baos is unaffected
            workbook.write(baos);
        }
        // Both sheets fully buffered — write everything to HTTP stream in one shot
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