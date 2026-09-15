package com.mini_erp.backend.warehouse.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "low_Stock_products")
@Getter @Setter
public class LowStockProduct {

    @Id
    @Column(name = "product_id")
    private Long productId;

    private String sku;

    @Column(name = "product_name")
    private String productName;

    private Integer stock;

    @Column(name = "min_stock")
    private Integer minStock;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "warehouse_name")
    private String warehouseName;
}
