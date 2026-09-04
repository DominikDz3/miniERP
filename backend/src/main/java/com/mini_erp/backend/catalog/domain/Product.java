package com.mini_erp.backend.catalog.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter @Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal purchasePrice;

    @Column(name = "sale_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal salePrice;

    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "min_stock", nullable = false)
    private Integer minStock = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Version
    private Long version;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
