package com.mini_erp.backend.customer.mapper;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "payerAddresses", ignore = true)
    @Mapping(target = "receiverAddresses", ignore = true)
    Customer toEntity(CustomerRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "payerAddresses", ignore = true)
    @Mapping(target = "receiverAddresses", ignore = true)
    void updateScalars(CustomerRequest req, @MappingTarget Customer c);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "default", source = "isDefault")
    PayerAddress toPayer(AddressRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "default", source = "isDefault")
    ReceiverAddress toReceiver(AddressRequest req);

    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "isDefault", source = "default")
    AddressResponse toPayerResponse(PayerAddress a);

    @Mapping(target = "isDefault", source = "default")
    AddressResponse toReceiverResponse(ReceiverAddress a);

    CustomerResponse toResponse(Customer c);
}