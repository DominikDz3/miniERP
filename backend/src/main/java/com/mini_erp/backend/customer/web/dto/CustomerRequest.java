package com.mini_erp.backend.customer.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 15) String nip,
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 10) String postalCode,
        @Size(max = 60) String country,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(max = 30) String phone
) {}