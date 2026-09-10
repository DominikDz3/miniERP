package com.mini_erp.backend.supplier.web.dto;

import jakarta.validation.constraints.*;

public record SupplierRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 15)  String nip,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(max = 30)  String phone,
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 10)  String postalCode,
        @Size(max = 60) String country
) {}