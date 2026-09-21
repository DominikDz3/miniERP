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
    private Long productId;

    private String sku;

    private String productName;

    private Integer stock;

    private Integer minStock;

    private Long warehouseId;

    private String warehouseName;
}
