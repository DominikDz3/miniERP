package com.mini_erp.backend.shared.mappers;

import com.mini_erp.backend.purchase.domain.PurchaseOrder;
import com.mini_erp.backend.purchase.domain.PurchaseOrderItem;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderItemResponse;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface PurchaseOrderMapper {

    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.name")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    PurchaseOrderResponse toResponse(PurchaseOrder order);

    @Mapping(target = "lineNet", expression = "java(lineNet(item))")
    PurchaseOrderItemResponse toItemResponse(PurchaseOrderItem item);

    default BigDecimal lineNet(PurchaseOrderItem item) {
        return item.getPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }
}