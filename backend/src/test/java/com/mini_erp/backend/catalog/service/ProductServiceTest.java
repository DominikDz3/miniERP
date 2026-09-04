package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.repository.PriceHistoryRepository;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.web.dto.ProductRequest;
import com.mini_erp.backend.catalog.web.dto.ProductResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository products;
    @Mock CategoryRepository categories;
    @Mock PriceHistoryRepository priceHistory;
    @InjectMocks ProductService service;

    private Category category() {
        Category c = new Category();
        c.setId(1L);
        c.setName("Elektronika");
        c.setActive(true);
        return c;
    }

    private ProductRequest request() {
        return new ProductRequest(
                "SKU-1", "Wiertarka", "opis", 1L,
                new BigDecimal("100.00"), new BigDecimal("150.00"),
                new BigDecimal("23.00"), "szt", 5, 1);
    }

    // create

    // A duplicate SKU must be rejected and nothing should be persisted
    @Test
    void create_whenSkuAlreadyExists_throwsAndDoesNotSave() {
        // given: a product with this SKU already exists
        when(products.existsBySku("SKU-1")).thenReturn(true);

        // when / then: creation fails, save is never called
        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SKU-1");
        verify(products, never()).save(any());
    }

    // Happy path: a valid request is persisted and mapped to a response DTO
    @Test
    void create_whenValid_savesAndReturnsResponse() {
        // given: SKU is free and the category exists; save assigns an id
        when(products.existsBySku("SKU-1")).thenReturn(false);
        when(categories.findById(1L)).thenReturn(Optional.of(category()));
        when(products.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        // when
        ProductResponse res = service.create(request());

        // then: the response carries the persisted product with a flattened category
        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.sku()).isEqualTo("SKU-1");
        assertThat(res.categoryId()).isEqualTo(1L);
        assertThat(res.categoryName()).isEqualTo("Elektronika");
        assertThat(res.active()).isTrue();
    }

    // A product cannot be created against a non-existent category
    @Test
    void create_whenCategoryNotFound_throwsAndDoesNotSave() {
        // given: SKU is free but the referenced category does not exist
        when(products.existsBySku("SKU-1")).thenReturn(false);
        when(categories.findById(1L)).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(NotFoundException.class);
        verify(products, never()).save(any());
    }

    // get

    // Fetching a missing product yields a 404-style NotFoundException
    @Test
    void get_whenProductNotFound_throwsNotFound() {
        when(products.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L))
                .isInstanceOf(NotFoundException.class);
    }

    // deactivate (soft-delete)

    // Deactivation is a soft-delete: it flips the active flag, it does not remove the row
    @Test
    void deactivate_setsActiveToFalse_insteadOfDeleting() {
        // given: an active product
        Product p = new Product();
        p.setId(10L);
        p.setActive(true);
        when(products.findById(10L)).thenReturn(Optional.of(p));

        // when
        service.deactivate(10L);

        // then: the saved product is marked inactive
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(products).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    // list / search

    // A blank search term is normalized to null so it acts as "no filter"
    @Test
    void list_whenSearchIsBlank_passesNullToRepository() {
        when(products.search(isNull(), eq(true), isNull(), any()))
                .thenReturn(Page.empty());

        service.list("   ", true, null, PageRequest.of(0, 20));

        verify(products).search(isNull(), eq(true), isNull(), any());
    }

    // Search term and filters are forwarded to the repository unchanged
    @Test
    void list_whenFiltersProvided_forwardsThemToRepository() {
        when(products.search(eq("wiert"), eq(true), eq(1L), any()))
                .thenReturn(Page.empty());

        service.list("wiert", true, 1L, PageRequest.of(0, 20));

        verify(products).search(eq("wiert"), eq(true), eq(1L), any());
    }

    // --- price history ---

    // Asking for the price history of a missing product fails before touching the history repo
    @Test
    void priceHistory_whenProductNotFound_throwsAndDoesNotQueryHistory() {
        when(products.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.priceHistory(99L, PageRequest.of(0, 20)))
                .isInstanceOf(NotFoundException.class);
        verify(priceHistory, never()).findByProductIdOrderByChangedAtDesc(anyLong(), any());
    }

    // For an existing product, the service delegates to the history repository
    @Test
    void priceHistory_whenProductExists_queriesHistoryRepository() {
        when(products.existsById(10L)).thenReturn(true);
        when(priceHistory.findByProductIdOrderByChangedAtDesc(eq(10L), any()))
                .thenReturn(Page.empty());

        service.priceHistory(10L, PageRequest.of(0, 20));

        verify(priceHistory).findByProductIdOrderByChangedAtDesc(eq(10L), any());
    }
}