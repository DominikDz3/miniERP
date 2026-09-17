package com.mini_erp.backend.catalog.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record StockItemsRequest(
        @NotEmpty(message = "Lista pozycji nie może być pusta")
        @Valid
        List<Item> items
) {
    public record Item(
            @NotNull Long productId,
            @NotNull @Positive Integer quantity
    ) {}
}