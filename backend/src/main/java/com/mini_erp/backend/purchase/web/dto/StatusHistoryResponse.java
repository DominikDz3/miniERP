package com.mini_erp.backend.purchase.web.dto;

import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;

import java.time.LocalDateTime;

public record StatusHistoryResponse(
        Long id,
        PurchaseOrderStatus fromStatus,
        PurchaseOrderStatus toStatus,
        String changedBy,
        LocalDateTime changedAt
) {}