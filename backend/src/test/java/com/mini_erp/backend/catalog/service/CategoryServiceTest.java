package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.web.dto.CategoryRequest;
import com.mini_erp.backend.catalog.web.dto.CategoryResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categories;
    @InjectMocks CategoryService service;

    // A duplicate category name must be rejected and nothing should be persisted
    @Test
    void create_whenNameAlreadyExists_throwsAndDoesNotSave() {
        when(categories.existsByName("Elektronika")).thenReturn(true);

        assertThatThrownBy(() -> service.create(new CategoryRequest("Elektronika")))
                .isInstanceOf(IllegalArgumentException.class);
        verify(categories, never()).save(any());
    }

    // Happy path: a new category is persisted and mapped to a response DTO
    @Test
    void create_whenNameIsFree_savesAndReturnsResponse() {
        // given: the name is free; save assigns an id
        when(categories.existsByName("Elektronika")).thenReturn(false);
        when(categories.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        // when
        CategoryResponse res = service.create(new CategoryRequest("Elektronika"));

        // then
        assertThat(res.id()).isEqualTo(1L);
        assertThat(res.name()).isEqualTo("Elektronika");
        assertThat(res.active()).isTrue();
    }

    // Updating an existing category changes its name
    @Test
    void update_whenCategoryExists_changesName() {
        // given: an existing category
        Category existing = new Category();
        existing.setId(1L);
        existing.setName("Stara");
        existing.setActive(true);
        when(categories.findById(1L)).thenReturn(Optional.of(existing));
        when(categories.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        // when
        CategoryResponse res = service.update(1L, new CategoryRequest("Nowa"));

        // then
        assertThat(res.name()).isEqualTo("Nowa");
    }

    // Deactivation (soft-delete)
    @Test
    void deactivate_setsActiveToFalse_insteadOfDeleting() {
        Category c = new Category();
        c.setId(5L);
        c.setActive(true);
        when(categories.findById(5L)).thenReturn(Optional.of(c));

        service.deactivate(5L);

        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categories).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    // Deactivating a missing category yields a 404-style NotFoundException
    @Test
    void deactivate_whenCategoryNotFound_throwsNotFound() {
        when(categories.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deactivate(5L))
                .isInstanceOf(NotFoundException.class);
    }
}