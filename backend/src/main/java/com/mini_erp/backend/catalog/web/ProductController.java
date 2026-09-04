package com.mini_erp.backend.catalog.web;

import com.mini_erp.backend.catalog.service.ProductService;
import com.mini_erp.backend.catalog.web.dto.PriceHistoryResponse;
import com.mini_erp.backend.catalog.web.dto.ProductRequest;
import com.mini_erp.backend.catalog.web.dto.ProductResponse;
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
            @RequestParam(required = false, defaultValue = "true") Boolean active,
            @RequestParam(required = false) Long categoryId,
            @ParameterObject Pageable pageable) {
        return productService.list(search, active, categoryId, pageable);
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        productService.deactivate(id);
    }
}