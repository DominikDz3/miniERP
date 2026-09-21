package com.mini_erp.backend.sales.web.dto;

import com.mini_erp.backend.catalog.domain.VatRate;

import java.math.BigDecimal;

public record SalesOrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        VatRate vatRate,
        BigDecimal lineNet
) {}