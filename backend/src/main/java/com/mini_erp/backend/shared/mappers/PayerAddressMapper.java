package com.mini_erp.backend.customer.mapper;

import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PayerAddressMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    PayerAddress toEntity(AddressRequest req);

    @Mapping(target = "phone", ignore = true)          // payer has no phone
    @Mapping(target = "isDefault", source = "isDefault")
    AddressResponse toResponse(PayerAddress a, boolean isDefault);
}