package com.mini_erp.backend.catalog.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PriceHistoryResponse(
        Long id,
        BigDecimal oldPurchasePrice,
        BigDecimal newPurchasePrice,
        BigDecimal oldSalePrice,
        BigDecimal newSalePrice,
        LocalDateTime changedAt
) {}