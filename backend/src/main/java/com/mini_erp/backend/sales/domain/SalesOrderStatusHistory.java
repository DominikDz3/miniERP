package com.mini_erp.backend.sales.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sales_order_status_history")
@Getter @Setter
public class SalesOrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SalesOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus toStatus;

    @Column(nullable = false, length = 100)
    private String changedBy;

    @Column(insertable = false, updatable = false)
    private LocalDateTime changedAt;
}