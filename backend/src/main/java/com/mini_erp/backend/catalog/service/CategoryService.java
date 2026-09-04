package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.web.dto.CategoryRequest;
import com.mini_erp.backend.catalog.web.dto.CategoryResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(Boolean active, Pageable pageable) {
        Page<Category> page = (active == null)
                ? categories.findAll(pageable)
                : categories.findByActive(active, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if(categories.existsByName(req.name())) {
            throw new IllegalArgumentException("Kategoria już istnieje");
        }
        Category c = new Category();
        c.setName(req.name());
        return toResponse(categories.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = findOrThrow(id);
        c.setName(req.name());
        return toResponse(categories.save(c));
    }

    @Transactional
    public void deactivate(Long id) {
        Category c = findOrThrow(id);
        c.setActive(false);
        categories.save(c);
    }

    // helpers

    public Category findOrThrow(Long id) {
        Category c = categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono kategorii: " + id));
        if(!c.isActive()) {
            throw new IllegalArgumentException("Kategoria jest nieaktywna");
        }
        return c;
    }

    public CategoryResponse toResponse(Category c) {
        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.isActive()
        );
    }
}