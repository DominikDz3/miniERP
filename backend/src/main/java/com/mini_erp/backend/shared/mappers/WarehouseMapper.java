package com.mini_erp.backend.warehouse.mapper;

import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.web.dto.WarehouseRequest;
import com.mini_erp.backend.warehouse.web.dto.WarehouseResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    WarehouseResponse toResponse(Warehouse w);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    Warehouse toEntity(WarehouseRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    void update(WarehouseRequest req, @MappingTarget Warehouse w);
}