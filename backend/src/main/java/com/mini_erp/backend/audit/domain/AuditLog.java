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

    @Column(nullable = false, length = 30)
    private String action;

    @Column(length = 30)
    private String entityType;

    private Long entityId;

    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;
}