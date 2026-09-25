package com.mini_erp.backend.audit.repository;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
import com.mini_erp.backend.audit.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
        select a from AuditLog a
        where (:action is null or a.action = :action)
          and (:entityType is null or a.entityType = :entityType)
          and (cast(:from as timestamp) is null or a.createdAt >= :from)
          and (cast(:to as timestamp) is null or a.createdAt <= :to)
        order by a.createdAt desc
        """)
    Page<AuditLog> search(@Param("action") AuditAction action,
                          @Param("entityType") AuditEntity entityType,
                          @Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to,
                          Pageable pageable);
}