package com.mini_erp.backend.sales.domain;

import com.mini_erp.backend.customer.domain.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_orders")
@Getter @Setter
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "receiver_address_id", nullable = false)
    private Long receiverAddressId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus status = SalesOrderStatus.NEW;

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