package com.mini_erp.backend.customer.web.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CustomerResponse(
        Long id,
        String name,
        String nip,
        String email,
        boolean active,
        LocalDateTime createdAt,
        List<AddressResponse> payerAddresses,
        List<AddressResponse> receiverAddresses
) {}