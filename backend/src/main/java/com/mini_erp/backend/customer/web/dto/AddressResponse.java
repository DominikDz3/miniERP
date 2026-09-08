package com.mini_erp.backend.customer.web.dto;

public record AddressResponse(
        Long id,
        String street,
        String city,
        String postalCode,
        String country,
        String phone,
        boolean isDefault
) {}