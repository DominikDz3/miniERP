package com.mini_erp.backend.sales.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SalesOrderItemRequest(
        @NotNull Long productId,
        @NotNull @Positive Integer quantity
) {}