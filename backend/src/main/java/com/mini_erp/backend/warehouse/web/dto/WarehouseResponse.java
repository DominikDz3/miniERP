package com.mini_erp.backend.warehouse.web.dto;

public record WarehouseResponse(
        Long id,
        String name,
        String phone,
        String street,
        String city,
        String postalCode,
        String country,
        boolean active
) {}