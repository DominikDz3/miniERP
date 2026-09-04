package com.mini_erp.backend.catalog.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PriceHistoryResponse(
        Long id,
        BigDecimal oldPurchasePrice,
        BigDecimal newPurchasePrice,
        BigDecimal oldSalePrice,
        BigDecimal newSalePrice,
        Instant changedAt
) {}