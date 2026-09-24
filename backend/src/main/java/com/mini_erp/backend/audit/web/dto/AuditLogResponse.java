package com.mini_erp.backend.audit.web.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String action,
        String entityType,
        Long entityId,
        String performedBy,
        LocalDateTime createdAt
) {}