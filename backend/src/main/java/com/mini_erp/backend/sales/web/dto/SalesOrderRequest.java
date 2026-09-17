package com.mini_erp.backend.sales.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SalesOrderRequest(
        @NotNull Long customerId,
        @NotEmpty @Valid List<SalesOrderItemRequest> items   // min. 1 pozycja
) {}