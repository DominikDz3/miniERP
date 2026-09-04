package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.PriceHistoryRepository;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.web.dto.PriceHistoryResponse;
import com.mini_erp.backend.catalog.web.dto.ProductRequest;
import com.mini_erp.backend.catalog.web.dto.ProductResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class ProductService {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final PriceHistoryRepository priceHistory;

    public ProductService(ProductRepository products, CategoryRepository categories, PriceHistoryRepository priceHistory) {
        this.products = products;
        this.categories = categories;
        this.priceHistory = priceHistory;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Boolean active, Long categoryId, Pageable pageable) {
        String normalized = (search == null || search.isBlank()) ? null : search.trim();
        return products.search(normalized, active, categoryId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PriceHistoryResponse> priceHistory(Long productId, Pageable pageable) {
        if (!products.existsById(productId)) {
            throw new NotFoundException("Nie znaleziono produktu: " + productId);
        }
        return priceHistory.findByProductIdOrderByChangedAtDesc(productId, pageable)
                .map(h -> new PriceHistoryResponse(
                        h.getId(),
                        h.getOldPurchasePrice(), h.getNewPurchasePrice(),
                        h.getOldSalePrice(), h.getNewSalePrice(),
                        h.getChangedAt()));
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (products.existsBySku(req.sku())) {
            throw new IllegalArgumentException("Produkt o takim SKU już istnieje" + req.sku());
        }

        Category category = findCategoryOrThrow(req.categoryId());

        Product p = new Product();
        apply(p, req, category);
        return toResponse(products.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = findOrThrow(id);
        Category category = findCategoryOrThrow(req.categoryId());
        apply(p, req, category);
        return toResponse(products.save(p));
    }

    @Transactional
    public void deactivate(Long id) {
        Product p = findOrThrow(id);
        p.setActive(false);
        products.save(p);
    }

    // helpers

    private Product findOrThrow(Long id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono produktu: " + id));
    }

    private Category findCategoryOrThrow(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono kategorii" + id));
    }

    private void apply(Product p, ProductRequest req, Category category) {
        p.setSku(req.sku());
        p.setName(req.name());
        p.setDescription(req.description());
        p.setCategory(category);
        p.setPurchasePrice(req.purchasePrice());
        p.setSalePrice(req.salePrice());
        p.setVatRate(req.vatRate());
        p.setUnit(req.unit());
        p.setStock(req.stock());
        p.setMinStock(req.minStock());
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
         p.getId(),
         p.getSku(),
         p.getName(),
         p.getDescription(),
         p.getCategory().getId(),
         p.getCategory().getName(),
         p.getPurchasePrice(),
         p.getSalePrice(),
         p.getVatRate(),
         p.getUnit(),
         p.getMinStock(),
         p.getStock(),
         p.isActive()
        );
    }
}
