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

    @Column(nullable = false)
    private Long productId;

    @Column(length = 200)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockMovementType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long warehouseId;

    @Column(length = 150)
    private String warehouseName;

    private Long targetWarehouseId;

    @Column(length = 150)
    private String targetWarehouseName;

    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(length = 20)
    private String sourceType;

    private Long sourceId;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
