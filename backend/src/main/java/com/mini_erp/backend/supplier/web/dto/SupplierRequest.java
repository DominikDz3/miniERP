package com.mini_erp.backend.supplier.web.dto;

import jakarta.validation.constraints.*;

public record SupplierRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "NIP musi mieć dokładnie 10 cyfr")  String nip,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "\\+?[0-9\\s-]{9,15}", message = "Nieprawidłowy numer telefonu") String phone,
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Pattern(regexp = "\\d{2}-\\d{3}", message = "Kod pocztowy w formacie 00-000") String postalCode,
        @Size(max = 60) String country
) {}