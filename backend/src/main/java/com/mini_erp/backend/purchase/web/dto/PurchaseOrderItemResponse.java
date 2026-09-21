package com.mini_erp.backend.purchase.web.dto;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        Integer quantity,
        BigDecimal purchasePrice,
        BigDecimal vatRate,
        BigDecimal lineNet
) {}