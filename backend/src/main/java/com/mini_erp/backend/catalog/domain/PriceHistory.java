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

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "old_purchase_price", precision = 19, scale = 4)
    private BigDecimal oldPurchasePrice;

    @Column(name = "new_purchase_price", precision = 19, scale = 4)
    private BigDecimal newPurchasePrice;

    @Column(name = "old_sale_price", precision = 19, scale = 4)
    private BigDecimal oldSalePrice;

    @Column(name = "new_sale_price", precision = 19, scale = 4)
    private BigDecimal newSalePrice;

    @Column(name = "changed_at", insertable = false, updatable = false)
    private LocalDateTime changedAt;
}