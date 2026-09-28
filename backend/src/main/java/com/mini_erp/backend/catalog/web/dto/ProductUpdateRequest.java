package com.mini_erp.backend.catalog.web.dto;

import com.mini_erp.backend.catalog.domain.VatRate;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        @NotBlank @Size(max = 200) String name,
        String description,
        @NotNull Long categoryId,
        @NotNull @PositiveOrZero BigDecimal purchasePrice,
        @NotNull @PositiveOrZero BigDecimal salePrice,
        @NotNull VatRate vatRate,
        @NotBlank @Size(max = 20) String unit,
        @NotNull @PositiveOrZero Integer minStock
) { }