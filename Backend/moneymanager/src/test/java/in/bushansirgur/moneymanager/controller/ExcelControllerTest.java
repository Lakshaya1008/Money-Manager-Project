package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.service.ExcelService;
import in.bushansirgur.moneymanager.service.ExpenseService;
import in.bushansirgur.moneymanager.service.IncomeService;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.data.domain.Sort;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ExcelControllerTest {

    @Test
    void downloadFullReport_fetchesIncomeAndExpensesBeforeOpeningResponseStream() throws Exception {
        ExcelService excelService = mock(ExcelService.class);
        IncomeService incomeService = mock(IncomeService.class);
        ExpenseService expenseService = mock(ExpenseService.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        ServletOutputStream outputStream = new TestServletOutputStream();
        ExcelController controller = new ExcelController(excelService, incomeService, expenseService);

        List<IncomeDTO> incomes = List.of(
                IncomeDTO.builder().name("Salary").amount(new BigDecimal("1000.00")).date(LocalDateTime.now()).build()
        );
        List<ExpenseDTO> expenses = List.of(
                ExpenseDTO.builder().name("Food").amount(new BigDecimal("100.00")).date(LocalDateTime.now()).build()
        );
        Sort sort = Sort.by(Sort.Direction.DESC, "date");

        when(incomeService.filterIncomes(null, null, "", sort)).thenReturn(incomes);
        when(expenseService.filterExpenses(null, null, "", sort)).thenReturn(expenses);
        when(response.getOutputStream()).thenReturn(outputStream);

        controller.downloadFullReport(response, null, null, "");

        InOrder inOrder = inOrder(incomeService, expenseService, response, excelService);
        inOrder.verify(incomeService).filterIncomes(null, null, "", sort);
        inOrder.verify(expenseService).filterExpenses(null, null, "", sort);
        inOrder.verify(response).setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        inOrder.verify(response).setHeader(eq("Content-Disposition"), eq("attachment; filename=full_report_all_to_today.xlsx"));
        inOrder.verify(response).getOutputStream();
        inOrder.verify(excelService).writeFullReportToExcel(outputStream, incomes, expenses);
    }

    @Test
    void downloadFullReport_doesNotOpenResponseStreamWhenExpenseFetchFails() throws Exception {
        ExcelService excelService = mock(ExcelService.class);
        IncomeService incomeService = mock(IncomeService.class);
        ExpenseService expenseService = mock(ExpenseService.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        ExcelController controller = new ExcelController(excelService, incomeService, expenseService);

        Sort sort = Sort.by(Sort.Direction.DESC, "date");
        when(incomeService.filterIncomes(null, null, "", sort)).thenReturn(List.of());
        when(expenseService.filterExpenses(null, null, "", sort)).thenThrow(new RuntimeException("DB failure"));

        assertThrows(RuntimeException.class, () -> controller.downloadFullReport(response, null, null, ""));

        verify(response, never()).getOutputStream();
        verifyNoInteractions(excelService);
    }

    private static final class TestServletOutputStream extends ServletOutputStream {
        private final ByteArrayOutputStream delegate = new ByteArrayOutputStream();

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
        }

        @Override
        public void write(int b) throws IOException {
            delegate.write(b);
        }
    }
}
