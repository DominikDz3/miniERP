package com.mini_erp.backend.dashboard.web.dto;

import java.math.BigDecimal;

public record DashboardSummary(
        long customersCount,
        long productsCount,
        long activeOrdersCount,
        BigDecimal salesValueThisMonth,
        BigDecimal purchasesValueThisMonth,
        BigDecimal warehouseValue,
        long lowStockCount
) {}