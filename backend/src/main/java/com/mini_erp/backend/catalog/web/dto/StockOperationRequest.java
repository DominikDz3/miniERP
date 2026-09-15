package com.mini_erp.backend.catalog.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockOperationRequest(
        @NotNull @Positive Integer quantity
) {
}
