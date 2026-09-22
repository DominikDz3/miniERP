package com.mini_erp.backend.report.web.dto;

import java.math.BigDecimal;

public record TopCustomerRow(
        Long customerId,
        String customerName,
        Long ordersCount,
        BigDecimal totalGross)
{}

