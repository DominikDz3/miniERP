package com.mini_erp.backend.customer.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerUpdateRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 15) String nip,
        @NotBlank @Email @Size(max = 150) String email
) {}