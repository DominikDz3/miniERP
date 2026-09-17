package com.mini_erp.backend.catalog.service;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.mapper.ProductMapper;
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
    private final ProductMapper mapper;

    public ProductService(ProductRepository products,
                          CategoryRepository categories,
                          PriceHistoryRepository priceHistory,
                          WarehouseRepository warehouses,
                          StockMovementRepository stockMovements,
                          ProductMapper mapper) {
        this.products = products;
        this.categories = categories;
        this.priceHistory = priceHistory;
        this.warehouses = warehouses;
        this.stockMovements = stockMovements;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Boolean active, Long categoryId, Long warehouseId, Pageable pageable) {
        String normalized = (search == null || search.isBlank()) ? null : search.trim();
        return products.search(normalized, active, categoryId, warehouseId, pageable).map(mapper::toResponse);
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
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (products.existsBySkuAndWarehouseId(req.sku(), req.warehouseId())) {
            throw new IllegalArgumentException("Produkt o takim SKU już istnieje w tym magazynie: " + req.sku());
        }

        Product p = mapper.toEntity(req);
        p.setCategory(findCategoryOrThrow(req.categoryId()));
        p.setWarehouse(findWarehouseOrThrow(req.warehouseId()));
        return mapper.toResponse(products.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = findOrThrow(id);
        mapper.update(req, p);
        p.setCategory(findCategoryOrThrow(req.categoryId()));
        p.setWarehouse(findWarehouseOrThrow(req.warehouseId()));
        return mapper.toResponse(products.save(p));
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
            target = mapper.copy(source);
            target.setWarehouse(targetWarehouse);
            target.setStock(quantity);
        } else {
            target.setStock(target.getStock() + quantity);
        }
        products.save(target);

        logMovement(source, StockMovementType.PRZESUNIECIE, quantity, targetWarehouseId, targetWarehouse.getName(), null, null);

        return mapper.toResponse(source);
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

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
