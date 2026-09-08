package com.mini_erp.backend.customer.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 10)  String postalCode,
        @Size(max = 60) String country,
        @Size(max = 30) String phone
) {}