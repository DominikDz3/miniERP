package com.mini_erp.backend.catalog.web.dto;

import com.mini_erp.backend.catalog.domain.VatRate;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        Long categoryId,
        String categoryName,
        Long warehouseId,
        String warehouseName,
        BigDecimal purchasePrice,
        BigDecimal salePrice,
        VatRate vatRate,
        String unit,
        Integer stock,
        Integer minStock,
        boolean active
) {
}
