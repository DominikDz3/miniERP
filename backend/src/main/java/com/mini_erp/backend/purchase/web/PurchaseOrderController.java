package com.mini_erp.backend.purchase.web;

import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;
import com.mini_erp.backend.purchase.service.PurchaseOrderService;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderItemResponse;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderRequest;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderResponse;
import com.mini_erp.backend.purchase.web.dto.StatusHistoryResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public Page<PurchaseOrderResponse> list(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @ParameterObject Pageable pageable) {
        return service.list(supplierId, status, from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public PurchaseOrderResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public List<PurchaseOrderItemResponse> getItems(@PathVariable Long id) {
        return service.getItems(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public List<StatusHistoryResponse> getHistory(@PathVariable Long id) {
        return service.getHistory(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PURCHASE_WRITE')")
    public PurchaseOrderResponse create(@Valid @RequestBody PurchaseOrderRequest req) {
        return service.create(req);
    }

    @PostMapping("/{id}/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PURCHASE_WRITE')")
    public void order(@PathVariable Long id) { service.order(id); }

    @PostMapping("/{id}/receive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PURCHASE_WRITE')")
    public void receive(@PathVariable Long id) { service.receive(id); }

    @PostMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PURCHASE_WRITE')")
    public void cancel(@PathVariable Long id) { service.cancel(id); }
}