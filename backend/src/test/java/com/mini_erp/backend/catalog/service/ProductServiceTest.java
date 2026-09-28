package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.domain.VatRate;
import com.mini_erp.backend.shared.mappers.ProductMapper;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.repository.PriceHistoryRepository;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.web.dto.ProductRequest;
import com.mini_erp.backend.catalog.web.dto.ProductResponse;
import com.mini_erp.backend.catalog.web.dto.ProductUpdateRequest;
import com.mini_erp.backend.shared.exception.NotFoundException;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.repository.StockMovementRepository;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mapstruct.factory.Mappers;
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
    @Mock WarehouseRepository warehouses;
    @Mock StockMovementRepository stockMovements;
    @Spy ProductMapper mapper = Mappers.getMapper(ProductMapper.class);
    @InjectMocks ProductService service;
    @Mock AuditService auditService;

    private Category category() {
        Category c = new Category();
        c.setId(1L);
        c.setName("Elektronika");
        c.setActive(true);
        return c;
    }

    private Warehouse warehouse() {
        Warehouse w = new Warehouse();
        w.setId(2L);
        w.setName("Magazyn Główny");
        w.setActive(true);
        return w;
    }

    private ProductRequest request() {
        return new ProductRequest(
                "SKU-1", "Wiertarka", "opis", 1L, 2L,
                new BigDecimal("100.00"), new BigDecimal("150.00"),
                VatRate.VAT_23, "szt", 5, 1);
    }

    private ProductUpdateRequest updateRequest() {
        return new ProductUpdateRequest(
                "Wiertarka Pro", "nowy opis", 1L,
                new BigDecimal("120.00"), new BigDecimal("180.00"),
                VatRate.VAT_8, "szt", 2);
    }

    private Product existingProduct() {
        Product p = new Product();
        p.setId(10L);
        p.setSku("SKU-1");
        p.setName("Wiertarka");
        p.setCategory(category());
        p.setWarehouse(warehouse());
        p.setPurchasePrice(new BigDecimal("100.00"));
        p.setSalePrice(new BigDecimal("150.00"));
        p.setVatRate(VatRate.VAT_23);
        p.setUnit("szt");
        p.setStock(5);
        p.setMinStock(1);
        return p;
    }

    // create
    @Test
    void create_whenSkuExistsInWarehouse_throwsAndDoesNotSave() {
        when(products.existsBySkuAndWarehouseId("SKU-1", 2L)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SKU-1");
        verify(products, never()).save(any());
    }

    @Test
    void create_whenValid_savesAndReturnsResponse() {
        when(products.existsBySkuAndWarehouseId("SKU-1", 2L)).thenReturn(false);
        when(categories.findById(1L)).thenReturn(Optional.of(category()));
        when(warehouses.findById(2L)).thenReturn(Optional.of(warehouse()));
        when(products.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductResponse res = service.create(request());

        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.sku()).isEqualTo("SKU-1");
        assertThat(res.categoryId()).isEqualTo(1L);
        assertThat(res.categoryName()).isEqualTo("Elektronika");
        assertThat(res.warehouseId()).isEqualTo(2L);
        assertThat(res.warehouseName()).isEqualTo("Magazyn Główny");
        assertThat(res.active()).isTrue();
    }

    @Test
    void create_whenCategoryNotFound_throwsAndDoesNotSave() {
        when(products.existsBySkuAndWarehouseId("SKU-1", 2L)).thenReturn(false);
        when(categories.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(NotFoundException.class);
        verify(products, never()).save(any());
    }

    // get
    @Test
    void get_whenProductNotFound_throwsNotFound() {
        when(products.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L))
                .isInstanceOf(NotFoundException.class);
    }

    // update
    @Test
    void update_whenProductNotFound_throwsAndDoesNotSave() {
        when(products.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, updateRequest()))
                .isInstanceOf(NotFoundException.class);
        verify(products, never()).save(any());
    }

    @Test
    void update_whenValid_changesCatalogDataAndKeepsSkuWarehouseAndStock() {
        when(products.findById(10L)).thenReturn(Optional.of(existingProduct()));
        when(categories.findById(1L)).thenReturn(Optional.of(category()));
        when(products.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse res = service.update(10L, updateRequest());

        assertThat(res.name()).isEqualTo("Wiertarka Pro");
        assertThat(res.salePrice()).isEqualByComparingTo("180.00");
        assertThat(res.vatRate()).isEqualTo(VatRate.VAT_8);
        assertThat(res.minStock()).isEqualTo(2);
        assertThat(res.sku()).isEqualTo("SKU-1");
        assertThat(res.warehouseId()).isEqualTo(2L);
        assertThat(res.stock()).isEqualTo(5);
    }

    @Test
    void update_whenCategoryNotFound_throwsAndDoesNotSave() {
        when(products.findById(10L)).thenReturn(Optional.of(existingProduct()));
        when(categories.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(10L, updateRequest()))
                .isInstanceOf(NotFoundException.class);
        verify(products, never()).save(any());
    }

    // deactivate (soft-delete)

    @Test
    void deactivate_setsActiveToFalse_insteadOfDeleting() {
        Product p = new Product();
        p.setId(10L);
        p.setActive(true);
        when(products.findById(10L)).thenReturn(Optional.of(p));

        service.deactivate(10L);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(products).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    // list / search

    @Test
    void list_whenSearchIsBlank_passesNullToRepository() {
        when(products.search(isNull(), eq(true), isNull(), isNull(), any()))
                .thenReturn(Page.empty());

        service.list("   ", true, null, null, PageRequest.of(0, 20));

        verify(products).search(isNull(), eq(true), isNull(), isNull(), any());
    }

    @Test
    void list_whenFiltersProvided_forwardsThemToRepository() {
        when(products.search(eq("wiert"), eq(true), eq(1L), eq(2L), any()))
                .thenReturn(Page.empty());

        service.list("wiert", true, 1L, 2L, PageRequest.of(0, 20));

        verify(products).search(eq("wiert"), eq(true), eq(1L), eq(2L), any());
    }

    // price history

    @Test
    void priceHistory_whenProductNotFound_throwsAndDoesNotQueryHistory() {
        when(products.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.priceHistory(99L, PageRequest.of(0, 20)))
                .isInstanceOf(NotFoundException.class);
        verify(priceHistory, never()).findByProductIdOrderByChangedAtDesc(anyLong(), any());
    }

    @Test
    void priceHistory_whenProductExists_queriesHistoryRepository() {
        when(products.existsById(10L)).thenReturn(true);
        when(priceHistory.findByProductIdOrderByChangedAtDesc(eq(10L), any()))
                .thenReturn(Page.empty());

        service.priceHistory(10L, PageRequest.of(0, 20));

        verify(priceHistory).findByProductIdOrderByChangedAtDesc(eq(10L), any());
    }
}