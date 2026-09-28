package com.mini_erp.backend.shared.mappers;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import com.mini_erp.backend.customer.web.dto.CustomerUpdateRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "defaultPayerId", ignore = true)
    @Mapping(target = "defaultReceiverId", ignore = true)
    Customer toEntity(CustomerRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "defaultPayerId", ignore = true)
    @Mapping(target = "defaultReceiverId", ignore = true)
    void updateScalars(CustomerUpdateRequest req, @MappingTarget Customer c);

    CustomerResponse toResponse(Customer c);
}