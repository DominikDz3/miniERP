package com.mini_erp.backend.sales.web.dto;

import com.mini_erp.backend.sales.domain.SalesOrderStatus;

import java.time.LocalDateTime;

public record StatusHistoryResponse(
        Long id,
        SalesOrderStatus fromStatus,
        SalesOrderStatus toStatus,
        String changedBy,
        LocalDateTime changedAt
) {}