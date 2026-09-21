package com.mini_erp.backend.purchase.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long supplierId,
        @NotNull Long warehouseId,
        @NotEmpty @Valid List<PurchaseOrderItemRequest> items
) {}