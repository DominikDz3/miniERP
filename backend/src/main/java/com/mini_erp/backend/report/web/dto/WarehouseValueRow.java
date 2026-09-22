package com.mini_erp.backend.report.web.dto;
import java.math.BigDecimal;
public record WarehouseValueRow(
        Long warehouseId,
        String warehouseName,
        BigDecimal value)
{}