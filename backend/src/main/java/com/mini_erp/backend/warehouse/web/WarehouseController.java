package com.mini_erp.backend.warehouse.web;

import com.mini_erp.backend.warehouse.domain.LowStockProduct;
import com.mini_erp.backend.warehouse.repository.LowStockRepository;
import com.mini_erp.backend.warehouse.service.WarehouseService;
import com.mini_erp.backend.warehouse.web.dto.*;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final LowStockRepository lowStockRepository;

    public WarehouseController(WarehouseService warehouseService, LowStockRepository lowStockRepository) {
        this.warehouseService = warehouseService;
        this.lowStockRepository = lowStockRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('WAREHOUSE_READ')")
    public Page<WarehouseResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return warehouseService.list(search, active, pageable);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('WAREHOUSE_READ')")
    public List<LowStockProduct> lowStock(@RequestParam(required = false) Long warehouseId) {
        if (warehouseId == null) {
            return lowStockRepository.findAll();
        }
        return lowStockRepository.findByWarehouseId(warehouseId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('WAREHOUSE_READ')")
    public WarehouseResponse get(@PathVariable Long id) { return warehouseService.get(id); }

    @PostMapping
    @PreAuthorize("hasAuthority('WAREHOUSE_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public WarehouseResponse create(@Valid @RequestBody WarehouseRequest req) { return warehouseService.create(req); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WAREHOUSE_WRITE')")
    public WarehouseResponse update(@PathVariable Long id, @Valid @RequestBody WarehouseRequest req) {
        return warehouseService.update(id, req);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('WAREHOUSE_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable Long id) { warehouseService.activate(id); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WAREHOUSE_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) { warehouseService.deactivate(id); }
}