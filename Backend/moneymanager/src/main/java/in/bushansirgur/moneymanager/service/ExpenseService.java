package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.ExpenseDTO;
import in.bushansirgur.moneymanager.entity.CategoryEntity;
import in.bushansirgur.moneymanager.entity.ExpenseEntity;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.exception.UnauthorizedException;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.repository.CategoryRepository;
import in.bushansirgur.moneymanager.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ProfileService profileService;

    @Transactional
    public ExpenseDTO addExpense(ExpenseDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();

        if (dto.getName() == null || dto.getName().trim().isEmpty())
            throw new ValidationException("name", "Expense name is required");
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new ValidationException("amount", "Amount must be greater than zero");
        if (dto.getCategoryId() == null)
            throw new ValidationException("categoryId", "Category ID is required. Please select a category for this expense.");

        if (dto.getDate() == null) dto.setDate(LocalDateTime.now());

        CategoryEntity category = categoryRepository.findByIdAndProfileId(dto.getCategoryId(), profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category with ID " + dto.getCategoryId() + " not found. Please create this category first or use a valid category ID from your categories list."));

        if (category.getType() != null && !category.getType().equalsIgnoreCase("EXPENSE"))
            throw new ValidationException("categoryId",
                    "Category '" + category.getName() + "' is not an expense category. Please select a category with type 'EXPENSE'.");

        ExpenseEntity newExpense = toEntity(dto, profile, category);
        newExpense = expenseRepository.save(newExpense);
        return toDTO(newExpense);
    }

    // ── EXCEL BUG ROOT CAUSE FIX ─────────────────────────────────────────────
    //
    // WITHOUT @Transactional the Hibernate session lifecycle is:
    //
    //   profileService.getCurrentProfile()  → session opens, ProfileEntity loaded, SESSION CLOSES
    //   expenseRepository.findBy...()        → new session opens, ExpenseEntity list fetched
    //                                          LEFT JOIN FETCH loads categories inline ← good
    //                                          SESSION CLOSES
    //   list.stream().map(this::toDTO)       → NO SESSION
    //     entity.getCategory().getId()       → LAZY proxy init attempted outside session
    //     entity.getCategory().getName()     → LazyInitializationException (or silent null)
    //
    // The toDTO() call accesses category.id and category.name through LAZY proxies.
    // Even though the JPQL uses LEFT JOIN FETCH, Hibernate 6 with open-in-view=false
    // closes the session before toDTO() runs. The proxy is initialised (data is there)
    // but the session is gone, so any further proxy access in the same call can fail.
    //
    // @Transactional keeps ONE session open for the entire method duration:
    //   - ProfileEntity lookup
    //   - Repository query (JOIN FETCH loads categories)
    //   - toDTO() mapping (proxies are still within the open session)
    //   - Session closes AFTER the method returns fully-mapped DTOs
    //
    // This is also why filterIncomes() works (IncomeEntity was already LAZY and
    // its query patterns didn't trigger the same proxy timing issue) while
    // filterExpenses() silently returned an empty or truncated list.
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getCurrentMonthExpensesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDate now = LocalDate.now();
        LocalDateTime startDate = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDate = now.withDayOfMonth(now.lengthOfMonth()).atTime(23, 59, 59);
        return expenseRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public void deleteExpense(Long expenseId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        ExpenseEntity entity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));
        if (!entity.getProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("delete", "expense");
        expenseRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getLatest5ExpensesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        return expenseRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenseForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = expenseRepository.findTotalExpenseByProfileId(profile.getId());
        return total != null ? total : BigDecimal.ZERO;
    }

    // @Transactional(readOnly = true) is the critical fix here.
    // filterExpenses() is called by ExcelController.downloadFullReport().
    // Without the transaction, category proxy access in toDTO() fails
    // silently or throws, producing the "only income downloaded" symptom.
    @Transactional(readOnly = true)
    public List<ExpenseDTO> filterExpenses(LocalDateTime startDate, LocalDateTime endDate, String keyword, Sort sort) {
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(2000, 1, 1, 0, 0, 0);
        LocalDateTime end   = endDate   != null ? endDate   : LocalDateTime.now().plusYears(10);
        String kw = keyword != null ? keyword : "";
        return expenseRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
                        profile.getId(), start, end, kw, sort)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getExpensesForUserOnDate(Long profileId, LocalDate date) {
        return expenseRepository.findByProfileIdAndDate(profileId, date)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getExpensesForUserOnDateRange(Long profileId, LocalDateTime start, LocalDateTime end) {
        return expenseRepository.findByProfileIdAndDateBetween(profileId, start, end)
                .stream().map(this::toDTO).toList();
    }

    private ExpenseEntity toEntity(ExpenseDTO dto, ProfileEntity profile, CategoryEntity category) {
        return ExpenseEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .profile(profile)
                .category(category)
                .build();
    }

    private ExpenseDTO toDTO(ExpenseEntity entity) {
        return ExpenseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    @Transactional
    public ExpenseDTO updateExpense(Long expenseId, ExpenseDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();

        ExpenseEntity existing = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        if (!existing.getProfile().getId().equals(profile.getId())) {
            throw new UnauthorizedException("update", "expense");
        }

        if (dto.getName() != null && dto.getName().trim().isEmpty()) {
            throw new ValidationException("name", "Expense name cannot be empty");
        }
        if (dto.getAmount() != null && dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("amount", "Amount must be greater than zero");
        }

        if (dto.getName() != null) {
            existing.setName(dto.getName().trim());
        }
        if (dto.getAmount() != null) {
            existing.setAmount(dto.getAmount());
        }
        if (dto.getDate() != null) {
            existing.setDate(dto.getDate());
        }
        if (dto.getIcon() != null) {
            existing.setIcon(dto.getIcon());
        }

        if (dto.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findByIdAndProfileId(dto.getCategoryId(), profile.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category with ID " + dto.getCategoryId() + " not found."));

            if (category.getType() != null && !category.getType().equalsIgnoreCase("EXPENSE")) {
                throw new ValidationException("categoryId",
                        "Category '" + category.getName() + "' is not an expense category.");
            }
            existing.setCategory(category);
        }

        existing = expenseRepository.save(existing);
        return toDTO(existing);
    }
}