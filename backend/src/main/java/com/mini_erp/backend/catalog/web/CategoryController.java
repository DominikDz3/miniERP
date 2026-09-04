package com.mini_erp.backend.catalog.web;

import com.mini_erp.backend.catalog.service.CategoryService;
import com.mini_erp.backend.catalog.web.dto.CategoryRequest;
import com.mini_erp.backend.catalog.web.dto.CategoryResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_READ')")
    public Page<CategoryResponse> list(
            @RequestParam(required = false, defaultValue = "true")
            Boolean active, @ParameterObject Pageable pageable) {
        return categoryService.list(active, pageable);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        categoryService.deactivate(id);
    }
}


