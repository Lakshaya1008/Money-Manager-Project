package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/incomes")
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<IncomeDTO> addIncome(@RequestBody IncomeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeService.addIncome(dto));
    }

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getIncomes() {
        return ResponseEntity.ok(incomeService.getCurrentMonthIncomesForCurrentUser());
    }

    // NEW — edit an existing income record
    // Only fields provided in the request body are updated (partial update).
    // Returns the updated income so the frontend can refresh the list without a full reload.
    @PutMapping("/{id}")
    public ResponseEntity<IncomeDTO> updateIncome(@PathVariable Long id, @RequestBody IncomeDTO dto) {
        return ResponseEntity.ok(incomeService.updateIncome(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }
}