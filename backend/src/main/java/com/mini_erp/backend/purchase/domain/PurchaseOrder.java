package com.mini_erp.backend.purchase.domain;

import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter @Setter
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseOrderStatus status = PurchaseOrderStatus.NEW;

    @Column(name = "total_net", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalNet = BigDecimal.ZERO;

    @Column(name = "total_vat", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalVat = BigDecimal.ZERO;

    @Column(name = "total_gross", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalGross = BigDecimal.ZERO;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}