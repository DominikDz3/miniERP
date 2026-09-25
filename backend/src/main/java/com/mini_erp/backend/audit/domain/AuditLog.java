package com.mini_erp.backend.audit.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter @Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", length = 30)
    private AuditEntity entityType;

    private Long entityId;

    @Column(columnDefinition = "text")
    private String details;

    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;
}