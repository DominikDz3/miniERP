package com.mini_erp.backend.warehouse.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Getter @Setter
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockMovementType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "target_warehouse_id")
    private Long targetWarehouseId;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
