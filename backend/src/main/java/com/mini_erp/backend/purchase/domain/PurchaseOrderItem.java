package com.mini_erp.backend.purchase.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
@Getter @Setter
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false, length = 64)
    private String sku;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal purchasePrice;

    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate;
}