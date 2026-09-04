package com.mini_erp.backend.customer.web.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id, String name, String nip,
        String street, String city, String postalCode, String country,
        String email, String phone, boolean active, LocalDateTime createdAt
) {}