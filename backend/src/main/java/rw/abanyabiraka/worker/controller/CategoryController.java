package rw.abanyabiraka.worker.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.abanyabiraka.worker.dto.CategoryRequest;
import rw.abanyabiraka.worker.dto.CategoryResponse;
import rw.abanyabiraka.worker.dto.ProfessionRequest;
import rw.abanyabiraka.worker.dto.ProfessionResponse;
import rw.abanyabiraka.worker.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(categoryService.listCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategory(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/professions")
    public ResponseEntity<List<ProfessionResponse>> listAllProfessions() {
        return ResponseEntity.ok(categoryService.listProfessions(null));
    }

    @GetMapping("/{categoryId}/professions")
    public ResponseEntity<List<ProfessionResponse>> listProfessionsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.listProfessions(categoryId));
    }

    @PostMapping("/professions")
    public ResponseEntity<ProfessionResponse> createProfession(@Valid @RequestBody ProfessionRequest request) {
        return ResponseEntity.ok(categoryService.createProfession(request));
    }

    @PutMapping("/professions/{id}")
    public ResponseEntity<ProfessionResponse> updateProfession(
            @PathVariable Long id, @Valid @RequestBody ProfessionRequest request) {
        return ResponseEntity.ok(categoryService.updateProfession(id, request));
    }

    @DeleteMapping("/professions/{id}")
    public ResponseEntity<Void> deleteProfession(@PathVariable Long id) {
        categoryService.deleteProfession(id);
        return ResponseEntity.noContent().build();
    }
}