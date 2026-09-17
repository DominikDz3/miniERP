package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.PriceHistoryRepository;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.web.dto.PriceHistoryResponse;
import com.mini_erp.backend.catalog.web.dto.ProductRequest;
import com.mini_erp.backend.catalog.web.dto.ProductResponse;
import com.mini_erp.backend.catalog.web.dto.StockItemsRequest;
import com.mini_erp.backend.shared.exception.NotFoundException;
import com.mini_erp.backend.warehouse.domain.StockMovement;
import com.mini_erp.backend.warehouse.domain.StockMovementType;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.repository.StockMovementRepository;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final PriceHistoryRepository priceHistory;
    private final WarehouseRepository warehouses;
    private final StockMovementRepository stockMovements;

    public ProductService(ProductRepository products,
                          CategoryRepository categories,
                          PriceHistoryRepository priceHistory,
                          WarehouseRepository warehouses,
                          StockMovementRepository stockMovements) {
        this.products = products;
        this.categories = categories;
        this.priceHistory = priceHistory;
        this.warehouses = warehouses;
        this.stockMovements = stockMovements;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Boolean active, Long categoryId, Long warehouseId, Pageable pageable) {
        String normalized = (search == null || search.isBlank()) ? null : search.trim();
        return products.search(normalized, active, categoryId, warehouseId, pageable).map(this::toResponse);
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
        if (products.existsBySkuAndWarehouseId(req.sku(), req.warehouseId())) {
            throw new IllegalArgumentException("Produkt o takim SKU już istnieje w tym magazynie: " + req.sku());
        }

        Category category = findCategoryOrThrow(req.categoryId());
        Warehouse warehouse = findWarehouseOrThrow(req.warehouseId());

        Product p = new Product();
        apply(p, req, category, warehouse);
        return toResponse(products.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = findOrThrow(id);
        Category category = findCategoryOrThrow(req.categoryId());
        Warehouse warehouse = findWarehouseOrThrow(req.warehouseId());
        apply(p, req, category, warehouse);
        return toResponse(products.save(p));
    }

    @Transactional
    public void receive(List<StockItemsRequest.Item> items) {
        for (StockItemsRequest.Item item : items) {
            Product p = findOrThrow(item.productId());
            p.setStock(p.getStock() + item.quantity());
            logMovement(p, StockMovementType.PRZYJECIE, item.quantity(), null, null, null, null);
        }
    }

    @Transactional
    public void issue(List<StockItemsRequest.Item> items) {
        for (StockItemsRequest.Item item : items) {
            Product p = findOrThrow(item.productId());
            int newStock = p.getStock() - item.quantity();
            if (newStock < 0) {
                throw new IllegalArgumentException(
                        "Za mało towaru: " + p.getName() + ". Dostępne " + p.getStock() + ", próba wydania " + item.quantity());
            }
            p.setStock(newStock);
            logMovement(p, StockMovementType.WYDANIE, item.quantity(), null, null, null,null);
        }
    }

    @Transactional
    public ProductResponse transfer(Long sourceProductId, int quantity, Long targetWarehouseId) {
        Product source = findOrThrow(sourceProductId);
        Warehouse targetWarehouse = findWarehouseOrThrow(targetWarehouseId);

        if (source.getWarehouse().getId().equals(targetWarehouseId)) {
            throw new IllegalArgumentException("Magazyn docelowy jest taki sam jak źródłowy");
        }

        // take product from source
        int newSourceStock = source.getStock() - quantity;
        if(newSourceStock < 0) {
            throw new IllegalArgumentException("Za mało towaru: dostępne " + source.getStock() + ", próba przesunięcia " + quantity);
        }
        source.setStock(newSourceStock);
        products.save(source);

        // find sku in target warehouse
        Product target = products.findBySkuAndWarehouseId(source.getSku(), targetWarehouseId)
                .orElse(null);

        // if target warehouse does not have product, create new
        if(target == null) {
            target = new Product();
            target.setSku(source.getSku());
            target.setName(source.getName());
            target.setDescription(source.getDescription());
            target.setCategory(source.getCategory());
            target.setWarehouse(targetWarehouse);
            target.setPurchasePrice(source.getPurchasePrice());
            target.setSalePrice(source.getSalePrice());
            target.setVatRate(source.getVatRate());
            target.setUnit(source.getUnit());
            target.setMinStock(source.getMinStock());
            target.setStock(quantity);
            target.setActive(true);
        } else {
            target.setStock(target.getStock() + quantity);
        }
        products.save(target);

        logMovement(source, StockMovementType.PRZESUNIECIE, quantity, targetWarehouseId, targetWarehouse.getName(), null, null);

        return toResponse(source);
    }

    @Transactional
    public void activate(Long id) {
        Product p = findOrThrow(id);
        p.setActive(true);
        products.save(p);
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

    private Warehouse findWarehouseOrThrow(Long id) {
        return warehouses.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono magazynu" + id));
    }

    @Transactional
    public void issueForOrder(Long productId, int quantity, String sourceType, Long sourceId) {
        Product p = findOrThrow(productId);
        int newStock = p.getStock() - quantity;
        if (newStock < 0) {
            throw new IllegalArgumentException(
                    "Za mało towaru: " + p.getName() + ". Dostępne " + p.getStock() + ", próba wydania " + quantity);
        }
        p.setStock(newStock);
        logMovement(p, StockMovementType.WYDANIE, quantity, null, null, sourceType, sourceId);
    }

    private void logMovement(Product p,
                             StockMovementType type,
                             int quantity,
                             Long targetWarehouseId,
                             String targetWarehouseName,
                             String sourceType,
                             Long sourceId) {
        StockMovement m = new StockMovement();
        m.setProductId(p.getId());
        m.setType(type);
        m.setQuantity(quantity);
        m.setWarehouseId(p.getWarehouse().getId());
        m.setTargetWarehouseId(targetWarehouseId);
        m.setProductName(p.getName());
        m.setWarehouseName(p.getWarehouse().getName());
        m.setTargetWarehouseName(targetWarehouseName);
        m.setSourceType(sourceType);
        m.setSourceId(sourceId);
        m.setPerformedBy(currentUsername());
        stockMovements.save(m);
    }

    private void apply(Product p, ProductRequest req, Category category, Warehouse warehouse) {
        p.setSku(req.sku());
        p.setName(req.name());
        p.setDescription(req.description());
        p.setCategory(category);
        p.setWarehouse(warehouse);
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
         p.getWarehouse().getId(),
         p.getWarehouse().getName(),
         p.getPurchasePrice(),
         p.getSalePrice(),
         p.getVatRate(),
         p.getUnit(),
         p.getStock(),
         p.getMinStock(),
         p.isActive()
        );
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
