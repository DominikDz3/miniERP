package com.mini_erp.backend.audit.web;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.audit.web.dto.AuditLogResponse;
import com.mini_erp.backend.shared.util.DateRange;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasAuthority('AUDIT_READ')")
public class AuditController {

    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    @GetMapping
    public Page<AuditLogResponse> list(
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditEntity entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @ParameterObject Pageable pageable) {
        return service.list(action, entityType, DateRange.from(from), DateRange.to(to), pageable);
    }
}