package com.mini_erp.backend.report.web.dto;

import java.math.BigDecimal;

public record WarehouseStockRow(
        Long productId,
        String sku,
        String productName,
        String warehouseName,
        Integer stock,
        BigDecimal stockValue)
{}

