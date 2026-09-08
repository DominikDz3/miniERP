package com.mini_erp.backend.customer.web.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String name,
        String nip,
        String email,
        boolean active,
        LocalDateTime createdAt,
        Long defaultPayerId,
        Long defaultReceiverId
) {}