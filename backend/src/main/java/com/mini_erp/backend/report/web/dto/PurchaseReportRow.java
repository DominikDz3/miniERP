package com.mini_erp.backend.report.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseReportRow(
        LocalDateTime period,
        Long ordersCount,
        BigDecimal totalNet,
        BigDecimal totalGross)
{}

