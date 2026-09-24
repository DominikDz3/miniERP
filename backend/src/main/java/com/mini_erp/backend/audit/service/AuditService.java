package com.mini_erp.backend.audit.service;

import com.mini_erp.backend.audit.domain.AuditLog;
import com.mini_erp.backend.audit.repository.AuditLogRepository;
import com.mini_erp.backend.audit.web.dto.AuditLogResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public Page<AuditLogResponse> list(String action, String entityType,
                                       LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return repo.search(action, entityType, from, to, pageable)
                .map(a -> new AuditLogResponse(
                        a.getId(), a.getAction(), a.getEntityType(),
                        a.getEntityId(), a.getPerformedBy(), a.getCreatedAt()));
    }

    public void log(String action, String entityType, Long entityId, String username) {
        AuditLog a = new AuditLog();
        a.setAction(action);
        a.setEntityType(entityType);
        a.setEntityId(entityId);
        a.setPerformedBy(username);
        repo.save(a);
    }

    public void log(String action, String entityType, Long entityId) {
        log(action, entityType, entityId, currentUsername());
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "system";
    }
}