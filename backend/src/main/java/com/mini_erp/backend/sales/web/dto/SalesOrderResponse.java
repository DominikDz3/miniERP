package com.mini_erp.backend.sales.web.dto;

import com.mini_erp.backend.sales.domain.SalesOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SalesOrderResponse(
        Long id,
        Long customerId,
        String customerName,
        Long receiverAddressId,
        String receiverAddress,
        SalesOrderStatus status,
        BigDecimal totalNet,
        BigDecimal totalVat,
        BigDecimal totalGross,
        String createdBy,
        LocalDateTime createdAt
) {}