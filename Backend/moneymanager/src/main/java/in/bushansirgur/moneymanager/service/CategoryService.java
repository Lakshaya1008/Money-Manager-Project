package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.CategoryDTO;
import in.bushansirgur.moneymanager.entity.CategoryEntity;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.exception.DuplicateResourceException;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ProfileService profileService;
    private final CategoryRepository categoryRepository;

    public CategoryDTO saveCategory(CategoryDTO categoryDTO) {
        ProfileEntity profile = profileService.getCurrentProfile();

        if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty())
            throw new ValidationException("name", "Category name is required");
        if (categoryDTO.getType() == null || categoryDTO.getType().trim().isEmpty())
            throw new ValidationException("type", "Category type is required. Valid types are: INCOME, EXPENSE");

        String type = categoryDTO.getType().toUpperCase();
        if (!type.equals("INCOME") && !type.equals("EXPENSE"))
            throw new ValidationException("type",
                    "Invalid category type '" + categoryDTO.getType() + "'. Valid types are: INCOME, EXPENSE");

        if (categoryRepository.existsByNameAndProfileId(categoryDTO.getName(), profile.getId()))
            throw new DuplicateResourceException("Category", "name", categoryDTO.getName());

        CategoryEntity newCategory = toEntity(categoryDTO, profile);
        newCategory = categoryRepository.save(newCategory);
        return toDTO(newCategory);
    }

    public List<CategoryDTO> getCategoriesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> categories = categoryRepository.findByProfileId(profile.getId());
        return categories.stream().map(this::toDTO).toList();
    }

    public List<CategoryDTO> getCategoriesByTypeForCurrentUser(String type) {
        ProfileEntity profile = profileService.getCurrentProfile();

        if (type == null || type.trim().isEmpty())
            throw new ValidationException("type", "Category type parameter is required");

        String upperType = type.toUpperCase();
        if (!upperType.equals("INCOME") && !upperType.equals("EXPENSE"))
            throw new ValidationException("type",
                    "Invalid category type '" + type + "'. Valid types are: INCOME, EXPENSE");

        List<CategoryEntity> entities = categoryRepository.findByTypeAndProfileId(upperType, profile.getId());
        return entities.stream().map(this::toDTO).toList();
    }

    public CategoryDTO updateCategory(Long categoryId, CategoryDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existing = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        if (dto.getName() != null && dto.getName().trim().isEmpty())
            throw new ValidationException("name", "Category name cannot be empty");

        if (dto.getName() != null && !dto.getName().equals(existing.getName())) {
            if (categoryRepository.existsByNameAndProfileId(dto.getName(), profile.getId()))
                throw new DuplicateResourceException("Category", "name", dto.getName());
        }

        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getIcon() != null) existing.setIcon(dto.getIcon());

        existing = categoryRepository.save(existing);
        return toDTO(existing);
    }

    /**
     * FIX: Catch DataIntegrityViolationException when category has linked
     * income/expense records, instead of letting it propagate as a 500.
     */
    public void deleteCategory(Long categoryId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existing = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        try {
            categoryRepository.delete(existing);
        } catch (DataIntegrityViolationException e) {
            throw new ValidationException("categoryId",
                    "Cannot delete category '" + existing.getName()
                            + "' because it has linked income or expense records. "
                            + "Please delete those records first.");
        }
    }

    // ─── Helper methods ───────────────────────────────────────────────────────

    private CategoryEntity toEntity(CategoryDTO dto, ProfileEntity profile) {
        return CategoryEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .profile(profile)
                .type(dto.getType().toUpperCase())
                .build();
    }

    private CategoryDTO toDTO(CategoryEntity entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .profileId(entity.getProfile() != null ? entity.getProfile().getId() : null)
                .name(entity.getName())
                .icon(entity.getIcon())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}