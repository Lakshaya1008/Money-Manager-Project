package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.CategoryDTO;
import in.bushansirgur.moneymanager.entity.CategoryEntity;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.exception.DuplicateResourceException;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ProfileService profileService;
    private final CategoryRepository categoryRepository;

    //save category
    public CategoryDTO saveCategory(CategoryDTO categoryDTO) {
        ProfileEntity profile = profileService.getCurrentProfile();

        // Validate required fields
        if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
            throw new ValidationException("name", "Category name is required");
        }
        if (categoryDTO.getType() == null || categoryDTO.getType().trim().isEmpty()) {
            throw new ValidationException("type", "Category type is required. Valid types are: INCOME, EXPENSE");
        }

        // Validate type value
        String type = categoryDTO.getType().toUpperCase();
        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new ValidationException("type", "Invalid category type '" + categoryDTO.getType() + "'. Valid types are: INCOME, EXPENSE");
        }

        // Check for duplicate category name for this user
        if (categoryRepository.existsByNameAndProfileId(categoryDTO.getName(), profile.getId())) {
            throw new DuplicateResourceException("Category", "name", categoryDTO.getName());
        }

        CategoryEntity newCategory = toEntity(categoryDTO, profile);
        newCategory = categoryRepository.save(newCategory);
        return toDTO(newCategory);
    }

    //get categories for current user
    public List<CategoryDTO> getCategoriesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> categories = categoryRepository.findByProfileId(profile.getId());
        return categories.stream().map(this::toDTO).toList();
    }

    //get categories by type for current user
    public List<CategoryDTO> getCategoriesByTypeForCurrentUser(String type) {
        ProfileEntity profile = profileService.getCurrentProfile();

        // Validate type
        if (type == null || type.trim().isEmpty()) {
            throw new ValidationException("type", "Category type parameter is required");
        }

        String upperType = type.toUpperCase();
        if (!upperType.equals("INCOME") && !upperType.equals("EXPENSE")) {
            throw new ValidationException("type", "Invalid category type '" + type + "'. Valid types are: INCOME, EXPENSE");
        }

        List<CategoryEntity> entities = categoryRepository.findByTypeAndProfileId(upperType, profile.getId());
        return entities.stream().map(this::toDTO).toList();
    }

    public CategoryDTO updateCategory(Long categoryId, CategoryDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existingCategory = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        // Validate name if provided
        if (dto.getName() != null && dto.getName().trim().isEmpty()) {
            throw new ValidationException("name", "Category name cannot be empty");
        }

        // Check if new name already exists (excluding current category)
        if (dto.getName() != null && !dto.getName().equals(existingCategory.getName())) {
            if (categoryRepository.existsByNameAndProfileId(dto.getName(), profile.getId())) {
                throw new DuplicateResourceException("Category", "name", dto.getName());
            }
        }

        if (dto.getName() != null) {
            existingCategory.setName(dto.getName());
        }
        if (dto.getIcon() != null) {
            existingCategory.setIcon(dto.getIcon());
        }

        existingCategory = categoryRepository.save(existingCategory);
        return toDTO(existingCategory);
    }

    //delete category
    public void deleteCategory(Long categoryId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existingCategory = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        categoryRepository.delete(existingCategory);
    }

    //helper methods
    private CategoryEntity toEntity(CategoryDTO categoryDTO, ProfileEntity profile) {
        return CategoryEntity.builder()
                .name(categoryDTO.getName())
                .icon(categoryDTO.getIcon())
                .profile(profile)
                .type(categoryDTO.getType())
                .build();
    }

    private CategoryDTO toDTO(CategoryEntity entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .profileId(entity.getProfile() != null ?  entity.getProfile().getId(): null)
                .name(entity.getName())
                .icon(entity.getIcon())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .type(entity.getType())
                .build();

    }
}
