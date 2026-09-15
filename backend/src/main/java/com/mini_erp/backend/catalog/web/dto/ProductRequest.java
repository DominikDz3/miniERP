package com.mini_erp.backend.catalog.web.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest (
        @NotBlank @Size(max = 64) String sku,
        @NotBlank @Size(max = 200) String name,
        String description,
        @NotNull Long categoryId,
        @NotNull Long warehouseId,
        @NotNull @PositiveOrZero BigDecimal purchasePrice,
        @NotNull @PositiveOrZero BigDecimal salePrice,
        @NotNull @PositiveOrZero BigDecimal vatRate,
        @NotBlank @Size(max = 20) String unit,
        @NotNull @PositiveOrZero Integer stock,
        @NotNull @PositiveOrZero Integer minStock
) { }
