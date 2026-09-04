package com.mini_erp.backend.catalog.repository;

import com.mini_erp.backend.catalog.domain.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);

    Page<Category> findByActive(boolean active, Pageable pageable);
}
