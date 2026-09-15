package com.mini_erp.backend.warehouse.web.dto;

import jakarta.validation.constraints.*;

public record WarehouseRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Pattern(regexp = "\\+?[0-9\\s-]{9,15}", message = "Nieprawidłowy numer telefonu") String phone,
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Pattern(regexp = "\\d{2}-\\d{3}", message = "Kod pocztowy w formacie 00-000") String postalCode,
        @Size(max = 60) String country
) {}