package com.mini_erp.backend.purchase.web.dto;

import com.mini_erp.backend.catalog.domain.VatRate;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        Integer quantity,
        BigDecimal purchasePrice,
        VatRate vatRate,
        BigDecimal lineNet
) {}