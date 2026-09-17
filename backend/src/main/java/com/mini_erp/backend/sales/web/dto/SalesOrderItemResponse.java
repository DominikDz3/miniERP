package com.mini_erp.backend.sales.web.dto;

import java.math.BigDecimal;

public record SalesOrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal vatRate,
        BigDecimal lineNet
) {}