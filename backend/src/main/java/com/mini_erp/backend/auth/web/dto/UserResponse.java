package com.mini_erp.backend.auth.web.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String roleName,
        boolean enabled,
        Instant createdAt
) {}