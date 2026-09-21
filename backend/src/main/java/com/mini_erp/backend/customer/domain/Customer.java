package com.mini_erp.backend.customer.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 15)
    private String nip;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false)
    private boolean active = true;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;

    private Long defaultPayerId;

    private Long defaultReceiverId;
}