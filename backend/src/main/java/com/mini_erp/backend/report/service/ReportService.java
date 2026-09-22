package com.mini_erp.backend.report.service;

import com.mini_erp.backend.report.repository.ReportRepository;
import com.mini_erp.backend.report.web.dto.*;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.warehouse.domain.LowStockProduct;
import com.mini_erp.backend.warehouse.repository.LowStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reports;
    private final LowStockRepository lowStock;

    public ReportService(ReportRepository reports, LowStockRepository lowStock) {
        this.reports = reports;
        this.lowStock = lowStock;
    }

    public List<SalesReportRow> salesReport(LocalDateTime from, LocalDateTime to, String granularity) {
        return reports.salesReport(from, to, granularity).stream()
                .map(r -> new SalesReportRow(
                        ((Timestamp) r[0]).toLocalDateTime(),
                        ((Number) r[1]).longValue(),
                        (BigDecimal) r[2],
                        (BigDecimal) r[3]))
                .toList();
    }

    public List<PurchaseReportRow> purchaseReport(LocalDateTime from, LocalDateTime to, String granularity) {
        return reports.purchaseReport(from, to, granularity).stream()
                .map(r -> new PurchaseReportRow(
                        ((Timestamp) r[0]).toLocalDateTime(),
                        ((Number) r[1]).longValue(),
                        (BigDecimal) r[2],
                        (BigDecimal) r[3]))
                .toList();
    }

    public List<TopProductRow> topProducts(LocalDateTime from, LocalDateTime to) {
        return reports.topProducts(SalesOrderStatus.COMPLETED, from, to);
    }

    public List<TopCustomerRow> topCustomers(LocalDateTime from, LocalDateTime to) {
        return reports.topCustomers(SalesOrderStatus.COMPLETED, from, to);
    }

    public List<MarginRow> margin(LocalDateTime from, LocalDateTime to) {
        return reports.margin(SalesOrderStatus.COMPLETED, from, to);
    }

    public List<WarehouseStockRow> stockLevels() {
        return reports.stockLevels();
    }

    public List<WarehouseValueRow> warehouseValue() {
        return reports.warehouseValue();
    }

    public List<LowStockProduct> belowMinimum() {
        return lowStock.findAll();
    }
}