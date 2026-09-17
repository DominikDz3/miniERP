package com.mini_erp.backend.warehouse.web.dto;

import com.mini_erp.backend.warehouse.domain.StockMovementType;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        String productName,
        StockMovementType type,
        Integer quantity,
        String warehouseName,
        String targetWarehouseName,
        String performedBy,
        LocalDateTime createdAt
) {}