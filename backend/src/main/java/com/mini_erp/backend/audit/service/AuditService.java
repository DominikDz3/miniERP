package com.mini_erp.backend.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
import com.mini_erp.backend.audit.domain.AuditLog;
import com.mini_erp.backend.audit.repository.AuditLogRepository;
import com.mini_erp.backend.audit.web.dto.AuditLogResponse;
import com.mini_erp.backend.shared.mappers.AuditLogMapper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository repo;
    private final AuditLogMapper mapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditService(AuditLogRepository repo, AuditLogMapper mapper) {

        this.repo = repo;
        this.mapper = mapper;
    }

    public Page<AuditLogResponse> list(AuditAction action, AuditEntity entityType,
                                       LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return repo.search(action, entityType, from, to, pageable).map(mapper::toResponse);
    }

    public void log(AuditAction action, AuditEntity entityType, Long entityId, String details, String username) {
        AuditLog a = new AuditLog();
        a.setAction(action);
        a.setEntityType(entityType);
        a.setEntityId(entityId);
        a.setDetails(details);
        a.setPerformedBy(username);
        repo.save(a);
    }

    public void log(AuditAction action, AuditEntity entityType, Long entityId, String details) {
        log(action, entityType, entityId, details, currentUsername());
    }

    public void logJson(AuditAction action, AuditEntity entityType, Long entityId, String description, Object payload) {
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            json = "(nie udało się zserializować danych)";
        }
        log(action, entityType, entityId, description + " : " + json);
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "system";
    }
}