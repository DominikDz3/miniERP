package com.mini_erp.backend.catalog.domain;

import jakarta.persistence.*;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
@Getter
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(precision = 19, scale = 4)
    private BigDecimal oldPurchasePrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal newPurchasePrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal oldSalePrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal newSalePrice;

    @Column(insertable = false, updatable = false)
    private LocalDateTime changedAt;
}