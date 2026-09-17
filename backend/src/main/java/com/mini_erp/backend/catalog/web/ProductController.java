package com.mini_erp.backend.catalog.web;

import com.mini_erp.backend.catalog.service.ProductService;
import com.mini_erp.backend.catalog.web.dto.*;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_READ')")
    public Page<ProductResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long warehouseId,
            @ParameterObject Pageable pageable) {
        return productService.list(search, active, categoryId, warehouseId, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_READ')")
    public ProductResponse get(@PathVariable Long id) {
        return productService.get(id);
    }

    @GetMapping("/{id}/price-history")
    @PreAuthorize("hasAuthority('PRODUCT_READ')")
    public Page<PriceHistoryResponse> priceHistory(@PathVariable Long id, @ParameterObject Pageable pageable) {
        return productService.priceHistory(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @PostMapping("/receive")
    @PreAuthorize("hasAuthority('WAREHOUSE_OPERATE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void receive(@Valid @RequestBody StockItemsRequest request) {
        productService.receive(request.items());
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAuthority('WAREHOUSE_OPERATE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void issue(@Valid @RequestBody StockItemsRequest request) {
        productService.issue(request.items());
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAuthority('WAREHOUSE_OPERATE')")
    public ProductResponse transfer(@PathVariable Long id, @Valid @RequestBody TransferRequest request) {
        return productService.transfer(id, request.quantity(), request.targetWarehouseId());
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable Long id) {
        productService.activate(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        productService.deactivate(id);
    }
}