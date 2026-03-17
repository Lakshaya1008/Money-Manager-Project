package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDTO> addExpense(@RequestBody ExpenseDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.addExpense(dto));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpenses() {
        return ResponseEntity.ok(expenseService.getCurrentMonthExpensesForCurrentUser());
    }

    // NEW — edit an existing expense record
    // Only fields provided in the request body are updated (partial update).
    // Returns the updated expense so the frontend can refresh the list without a full reload.
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}