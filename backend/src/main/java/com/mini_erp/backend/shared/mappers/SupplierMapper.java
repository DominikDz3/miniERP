package com.mini_erp.backend.shared.mappers;

import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.web.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Supplier toEntity(SupplierRequest req);

    SupplierResponse toResponse(Supplier s);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void update(SupplierRequest req, @MappingTarget Supplier s);
}