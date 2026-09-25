package com.mini_erp.backend.shared.mappers;

import com.mini_erp.backend.audit.domain.AuditLog;
import com.mini_erp.backend.audit.web.dto.AuditLogResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    AuditLogResponse toResponse(AuditLog log);
}