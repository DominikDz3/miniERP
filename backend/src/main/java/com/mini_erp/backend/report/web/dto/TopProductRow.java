package com.mini_erp.backend.report.web.dto;

import java.math.BigDecimal;

public record TopProductRow(
        Long productId,
        String sku,
        String productName,
        Long totalQuantity,
        BigDecimal totalNet)
{}

