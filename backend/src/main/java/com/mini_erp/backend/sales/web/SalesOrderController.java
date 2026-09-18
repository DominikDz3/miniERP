package com.mini_erp.backend.sales.web;

import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.sales.service.SalesOrderService;
import com.mini_erp.backend.sales.web.dto.SalesOrderItemResponse;
import com.mini_erp.backend.sales.web.dto.SalesOrderRequest;
import com.mini_erp.backend.sales.web.dto.SalesOrderResponse;
import com.mini_erp.backend.sales.web.dto.StatusHistoryResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService service;

    public SalesOrderController(SalesOrderService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_READ')")
    public Page<SalesOrderResponse> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) SalesOrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @ParameterObject Pageable pageable) {
        return service.list(customerId, status, from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_READ')")
    public SalesOrderResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAuthority('SALES_READ')")
    public List<SalesOrderItemResponse> getItems(@PathVariable Long id) {
        return service.getItems(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public SalesOrderResponse create(@Valid @RequestBody SalesOrderRequest req) {
        return service.create(req);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public void confirm(@PathVariable Long id) { service.confirm(id); }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public void process(@PathVariable Long id) { service.process(id); }

    @PostMapping("/{id}/ready")
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public void ready(@PathVariable Long id) { service.ready(id); }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public void complete(@PathVariable Long id) { service.complete(id); }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('SALES_WRITE')")
    public void cancel(@PathVariable Long id) { service.cancel(id); }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAuthority('SALES_READ')")
    public List<StatusHistoryResponse> getHistory(@PathVariable Long id) {
        return service.getHistory(id);
    }
}