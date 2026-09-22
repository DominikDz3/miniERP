package com.mini_erp.backend.report.web.dto;

import java.math.BigDecimal;

public record MarginRow(
        Long productId,
        String sku,
        String productName,
        BigDecimal revenue,
        BigDecimal cost,
        BigDecimal margin)
{}

