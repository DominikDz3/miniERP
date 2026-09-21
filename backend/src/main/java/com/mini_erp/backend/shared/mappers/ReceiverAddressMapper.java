package com.mini_erp.backend.customer.mapper;

import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiverAddressMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    ReceiverAddress toEntity(AddressRequest req);

    @Mapping(target = "isDefault", source = "isDefault")
    AddressResponse toResponse(ReceiverAddress a, boolean isDefault);
}