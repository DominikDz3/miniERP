package com.mini_erp.backend.report.web;

import com.mini_erp.backend.report.service.ReportService;
import com.mini_erp.backend.report.web.dto.*;
import com.mini_erp.backend.warehouse.domain.LowStockProduct;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAuthority('REPORT_READ')")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/sales")
    public List<SalesReportRow> sales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "day") String granularity) {
        return service.salesReport(from, to, granularity);
    }

    @GetMapping("/purchases")
    public List<PurchaseReportRow> purchases(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "day") String granularity) {
        return service.purchaseReport(from, to, granularity);
    }

    @GetMapping("/top-products")
    public List<TopProductRow> topProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return service.topProducts(from, to);
    }

    @GetMapping("/top-customers")
    public List<TopCustomerRow> topCustomers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return service.topCustomers(from, to);
    }

    @GetMapping("/margin")
    public List<MarginRow> margin(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return service.margin(from, to);
    }

    @GetMapping("/stock-levels")
    public List<WarehouseStockRow> stockLevels() {
        return service.stockLevels();
    }

    @GetMapping("/warehouse-value")
    public List<WarehouseValueRow> warehouseValue() {
        return service.warehouseValue();
    }
    @GetMapping("/below-minimum")
    public List<LowStockProduct> belowMinimum() {
        return service.belowMinimum();
    }
}