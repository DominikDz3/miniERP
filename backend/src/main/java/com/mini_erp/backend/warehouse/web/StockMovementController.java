package com.mini_erp.backend.warehouse.web;

import com.mini_erp.backend.warehouse.domain.StockMovementType;
import com.mini_erp.backend.warehouse.service.StockMovementService;
import com.mini_erp.backend.warehouse.web.dto.StockMovementResponse;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('WAREHOUSE_READ')")
    public Page<StockMovementResponse> list(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) StockMovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return stockMovementService.list(productId, warehouseId, type, from, to, pageable);
    }
}