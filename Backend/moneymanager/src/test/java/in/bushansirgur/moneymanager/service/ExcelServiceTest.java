package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExcelServiceTest {

    private final ExcelService excelService = new ExcelService();

    @Test
    void writeFullReportToExcel_createsTwoSheetsWithIncomeAndExpenseRows() throws Exception {
        List<IncomeDTO> incomes = List.of(
                IncomeDTO.builder()
                        .name("Salary")
                        .categoryId(1L)
                        .categoryName("Job")
                        .amount(new BigDecimal("5000.00"))
                        .date(LocalDateTime.of(2026, 2, 1, 9, 0))
                        .build()
        );
        List<ExpenseDTO> expenses = List.of(
                ExpenseDTO.builder()
                        .name("Rent")
                        .categoryId(2L)
                        .categoryName("Housing")
                        .amount(new BigDecimal("1500.00"))
                        .date(LocalDateTime.of(2026, 2, 5, 8, 30))
                        .build()
        );

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        excelService.writeFullReportToExcel(output, incomes, expenses);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(output.toByteArray()))) {
            assertEquals(2, workbook.getNumberOfSheets());
            assertEquals("Incomes", workbook.getSheetAt(0).getSheetName());
            assertEquals("Expenses", workbook.getSheetAt(1).getSheetName());
            assertEquals("Salary", workbook.getSheet("Incomes").getRow(1).getCell(1).getStringCellValue());
            assertEquals("Rent", workbook.getSheet("Expenses").getRow(1).getCell(1).getStringCellValue());
        }
    }

    @Test
    void writeFullReportToExcel_keepsBothSheetsEvenWhenListsAreEmpty() throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        excelService.writeFullReportToExcel(output, List.of(), List.of());

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(output.toByteArray()))) {
            assertEquals(2, workbook.getNumberOfSheets());
            assertEquals("Incomes", workbook.getSheetAt(0).getSheetName());
            assertEquals("Expenses", workbook.getSheetAt(1).getSheetName());
            assertEquals(1, workbook.getSheet("Incomes").getPhysicalNumberOfRows());
            assertEquals(1, workbook.getSheet("Expenses").getPhysicalNumberOfRows());
        }
    }
}

