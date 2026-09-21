package com.mini_erp.backend.catalog.domain;

import com.mini_erp.backend.warehouse.domain.Warehouse;
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

    @Column(nullable = false, length = 64)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal purchasePrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal salePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VatRate vatRate;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer minStock = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Version
    private Long version;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
