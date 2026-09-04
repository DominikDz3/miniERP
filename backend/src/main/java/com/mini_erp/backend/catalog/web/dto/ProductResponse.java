package com.mini_erp.backend.catalog.web.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        Long categoryId,
        String categoryName,
        BigDecimal purchasePrice,
        BigDecimal salePrice,
        BigDecimal vatRate,
        String unit,
        Integer stock,
        Integer minStock,
        boolean active
) {
}
