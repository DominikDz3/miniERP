package com.mini_erp.backend.auth.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, name = "username", unique = true, length = 50)
    private String username;

    @Column(nullable = false, name = "password", length = 100)
    private String password;

    @Column(nullable = false, name = "full_name", length = 120)
    private String full_name;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name= "role_id", nullable = false)
    private Role role;
}
