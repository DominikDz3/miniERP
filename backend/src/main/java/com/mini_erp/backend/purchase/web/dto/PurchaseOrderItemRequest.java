package com.mini_erp.backend.purchase.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PurchaseOrderItemRequest(
        @NotNull Long productId,
        @NotNull @Positive Integer quantity
) {}