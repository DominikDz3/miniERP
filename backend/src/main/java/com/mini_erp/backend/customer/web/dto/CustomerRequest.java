package com.mini_erp.backend.customer.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CustomerRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 15) String nip,
        @NotBlank @Email @Size(max = 150) String email,
        @NotEmpty @Valid List<AddressRequest> payerAddresses,
        @NotEmpty @Valid List<AddressRequest> receiverAddresses
) {}