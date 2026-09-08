package com.mini_erp.backend.customer.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<PayerAddress> payerAddresses = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<ReceiverAddress> receiverAddresses = new ArrayList<>();

    public void addPayer(PayerAddress a) {
        a.setCustomer(this);
        payerAddresses.add(a);
    }

    public void addReceiver(ReceiverAddress a) {
        a.setCustomer(this);
        receiverAddresses.add(a);
    }
}