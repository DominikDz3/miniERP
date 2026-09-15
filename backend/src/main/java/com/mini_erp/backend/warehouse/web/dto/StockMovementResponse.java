package com.mini_erp.backend.warehouse.web.dto;

import com.mini_erp.backend.warehouse.domain.StockMovementType;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        Long productId,
        StockMovementType type,
        Integer quantity,
        Long warehouseId,
        Long targetWarehouseId,
        String performedBy,
        LocalDateTime createdAt
) {}