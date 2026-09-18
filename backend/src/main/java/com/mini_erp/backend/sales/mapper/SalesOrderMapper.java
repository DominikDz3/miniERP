package com.mini_erp.backend.sales.mapper;

import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderItem;
import com.mini_erp.backend.sales.web.dto.SalesOrderItemResponse;
import com.mini_erp.backend.sales.web.dto.SalesOrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface SalesOrderMapper {

    @Mapping(target = "customerId", source = "order.customer.id")
    @Mapping(target = "customerName", source = "order.customer.name")
    @Mapping(target = "receiverAddressId", source = "order.receiverAddressId")
    @Mapping(target = "receiverAddress", source = "receiverAddress")
    SalesOrderResponse toResponse(SalesOrder order, String receiverAddress);

    @Mapping(target = "lineNet", expression = "java(lineNet(item))")
    SalesOrderItemResponse toItemResponse(SalesOrderItem item);

    default BigDecimal lineNet(SalesOrderItem item) {
        return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }
}