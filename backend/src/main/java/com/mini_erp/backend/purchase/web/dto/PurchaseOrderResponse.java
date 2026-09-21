package com.mini_erp.backend.purchase.web.dto;

import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseOrderResponse(
        Long id,
        Long supplierId,
        String supplierName,
        Long warehouseId,
        String warehouseName,
        PurchaseOrderStatus status,
        BigDecimal totalNet,
        BigDecimal totalVat,
        BigDecimal totalGross,
        String createdBy,
        LocalDateTime createdAt
) {}