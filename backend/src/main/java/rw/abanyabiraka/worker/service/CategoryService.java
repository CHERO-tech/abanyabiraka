package rw.abanyabiraka.worker.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.abanyabiraka.common.exception.AuthException;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.worker.dto.CategoryRequest;
import rw.abanyabiraka.worker.dto.CategoryResponse;
import rw.abanyabiraka.worker.dto.ProfessionRequest;
import rw.abanyabiraka.worker.dto.ProfessionResponse;
import rw.abanyabiraka.worker.entity.Category;
import rw.abanyabiraka.worker.entity.Profession;
import rw.abanyabiraka.worker.repository.CategoryRepository;
import rw.abanyabiraka.worker.repository.ProfessionRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProfessionRepository professionRepository;

    public CategoryService(CategoryRepository categoryRepository, ProfessionRepository professionRepository) {
        this.categoryRepository = categoryRepository;
        this.professionRepository = professionRepository;
    }

    // ---- Categories ----

    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    public CategoryResponse getCategory(Long id) {
        Category category = findCategory(id);
        return new CategoryResponse(category.getId(), category.getName());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AuthException(HttpStatus.CONFLICT, "A category with this name already exists");
        }
        Category category = new Category();
        category.setName(request.getName());
        categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        category.setName(request.getName());
        categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        categoryRepository.delete(category);
    }

    // ---- Professions ----

    public List<ProfessionResponse> listProfessions(Long categoryId) {
        List<Profession> professions = categoryId != null
                ? professionRepository.findByCategoryId(categoryId)
                : professionRepository.findAll();
        return professions.stream().map(this::toProfessionResponse).toList();
    }

    @Transactional
    public ProfessionResponse createProfession(ProfessionRequest request) {
        if (professionRepository.existsByName(request.getName())) {
            throw new AuthException(HttpStatus.CONFLICT, "A profession with this name already exists");
        }
        Category category = findCategory(request.getCategoryId());

        Profession profession = new Profession();
        profession.setName(request.getName());
        profession.setCategory(category);
        professionRepository.save(profession);
        return toProfessionResponse(profession);
    }

    @Transactional
    public ProfessionResponse updateProfession(Long id, ProfessionRequest request) {
        Profession profession = professionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Profession not found: " + id));
        Category category = findCategory(request.getCategoryId());

        profession.setName(request.getName());
        profession.setCategory(category);
        professionRepository.save(profession);
        return toProfessionResponse(profession);
    }

    @Transactional
    public void deleteProfession(Long id) {
        Profession profession = professionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Profession not found: " + id));
        professionRepository.delete(profession);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
    }

    private ProfessionResponse toProfessionResponse(Profession profession) {
        Category category = profession.getCategory();
        return new ProfessionResponse(
                profession.getId(),
                profession.getName(),
                category != null ? category.getId() : null,
                category != null ? category.getName() : null);
    }
}