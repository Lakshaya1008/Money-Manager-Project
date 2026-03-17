package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.IncomeDTO;
import in.bushansirgur.moneymanager.entity.CategoryEntity;
import in.bushansirgur.moneymanager.entity.IncomeEntity;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.exception.UnauthorizedException;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.repository.CategoryRepository;
import in.bushansirgur.moneymanager.repository.IncomeRepository;
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
public class IncomeService {

    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileService profileService;

    @Transactional
    public IncomeDTO addIncome(IncomeDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();

        if (dto.getName() == null || dto.getName().trim().isEmpty())
            throw new ValidationException("name", "Income name is required");
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new ValidationException("amount", "Amount must be greater than zero");
        if (dto.getCategoryId() == null)
            throw new ValidationException("categoryId", "Category ID is required. Please select a category for this income.");

        if (dto.getDate() == null) dto.setDate(LocalDateTime.now());

        CategoryEntity category = categoryRepository.findByIdAndProfileId(dto.getCategoryId(), profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category with ID " + dto.getCategoryId() + " not found."));

        if (category.getType() != null && !category.getType().equalsIgnoreCase("INCOME"))
            throw new ValidationException("categoryId",
                    "Category '" + category.getName() + "' is not an income category.");

        IncomeEntity newIncome = toEntity(dto, profile, category);
        newIncome = incomeRepository.save(newIncome);
        return toDTO(newIncome);
    }

    @Transactional
    public IncomeDTO updateIncome(Long incomeId, IncomeDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();

        IncomeEntity existing = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", incomeId));

        if (!existing.getProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("update", "income");

        if (dto.getName() != null && dto.getName().trim().isEmpty())
            throw new ValidationException("name", "Income name cannot be empty");
        if (dto.getAmount() != null && dto.getAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new ValidationException("amount", "Amount must be greater than zero");

        if (dto.getName() != null) existing.setName(dto.getName().trim());
        if (dto.getAmount() != null) existing.setAmount(dto.getAmount());
        if (dto.getDate() != null) existing.setDate(dto.getDate());
        if (dto.getIcon() != null) existing.setIcon(dto.getIcon());

        if (dto.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findByIdAndProfileId(dto.getCategoryId(), profile.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category with ID " + dto.getCategoryId() + " not found."));
            if (category.getType() != null && !category.getType().equalsIgnoreCase("INCOME"))
                throw new ValidationException("categoryId",
                        "Category '" + category.getName() + "' is not an income category.");
            existing.setCategory(category);
        }

        existing = incomeRepository.save(existing);
        return toDTO(existing);
    }

    @Transactional(readOnly = true)
    public List<IncomeDTO> getCurrentMonthIncomesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDate now = LocalDate.now();
        LocalDateTime startDate = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDate = now.withDayOfMonth(now.lengthOfMonth()).atTime(23, 59, 59);
        return incomeRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public void deleteIncome(Long incomeId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        IncomeEntity entity = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", incomeId));
        if (!entity.getProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("delete", "income");
        incomeRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public List<IncomeDTO> getLatest5IncomesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        return incomeRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalIncomeForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = incomeRepository.findTotalExpenseByProfileId(profile.getId());
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public List<IncomeDTO> filterIncomes(LocalDateTime startDate, LocalDateTime endDate, String keyword, Sort sort) {
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(2000, 1, 1, 0, 0, 0);
        LocalDateTime end   = endDate   != null ? endDate   : LocalDateTime.now().plusYears(10);
        String kw = keyword != null ? keyword : "";
        return incomeRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
                        profile.getId(), start, end, kw, sort)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<IncomeDTO> getIncomesForUserOnDateRange(Long profileId, LocalDateTime start, LocalDateTime end) {
        return incomeRepository.findByProfileIdAndDateBetween(profileId, start, end)
                .stream().map(this::toDTO).toList();
    }

    private IncomeEntity toEntity(IncomeDTO dto, ProfileEntity profile, CategoryEntity category) {
        return IncomeEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .profile(profile)
                .category(category)
                .build();
    }

    private IncomeDTO toDTO(IncomeEntity entity) {
        return IncomeDTO.builder()
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
}