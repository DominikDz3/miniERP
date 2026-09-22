package com.mini_erp.backend.report.service;

import com.mini_erp.backend.report.repository.ReportRepository;
import com.mini_erp.backend.report.web.dto.*;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.shared.util.DateRange;
import com.mini_erp.backend.warehouse.domain.LowStockProduct;
import com.mini_erp.backend.warehouse.repository.LowStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
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

    public List<SalesReportRow> salesReport(LocalDate from, LocalDate to, String granularity) {
        return reports.salesReport(DateRange.from(from), DateRange.to(to), granularity).stream()
                .map(r -> new SalesReportRow(
                        ((Timestamp) r[0]).toLocalDateTime(),
                        ((Number) r[1]).longValue(),
                        (BigDecimal) r[2],
                        (BigDecimal) r[3]))
                .toList();
    }

    public List<PurchaseReportRow> purchaseReport(LocalDate from, LocalDate to, String granularity) {
        return reports.purchaseReport(DateRange.from(from), DateRange.to(to), granularity).stream()
                .map(r -> new PurchaseReportRow(
                        ((Timestamp) r[0]).toLocalDateTime(),
                        ((Number) r[1]).longValue(),
                        (BigDecimal) r[2],
                        (BigDecimal) r[3]))
                .toList();
    }

    public List<TopProductRow> topProducts(LocalDate from, LocalDate to) {
        return reports.topProducts(SalesOrderStatus.COMPLETED, DateRange.from(from), DateRange.to(to));
    }

    public List<TopCustomerRow> topCustomers(LocalDate from, LocalDate to) {
        return reports.topCustomers(SalesOrderStatus.COMPLETED, DateRange.from(from), DateRange.to(to));
    }

    public List<MarginRow> margin(LocalDate from, LocalDate to) {
        return reports.margin(SalesOrderStatus.COMPLETED, DateRange.from(from), DateRange.to(to));
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