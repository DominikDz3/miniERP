package com.mini_erp.backend.supplier.web.dto;

import java.time.LocalDateTime;

public record SupplierResponse(
        Long id,
        String name,
        String nip,
        String email,
        String phone,
        String street,
        String city,
        String postalCode,
        String country,
        boolean active, LocalDateTime createdAt
) {}