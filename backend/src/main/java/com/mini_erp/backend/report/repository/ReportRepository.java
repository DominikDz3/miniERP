package com.mini_erp.backend.report.repository;

import com.mini_erp.backend.report.web.dto.*;
import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRepository extends JpaRepository<SalesOrder, Long> {

    @Query(value = "select * from sp_sales_report(:from, :to, :granularity)", nativeQuery = true)
    List<Object[]> salesReport(@Param("from") LocalDateTime from,
                               @Param("to") LocalDateTime to,
                               @Param("granularity") String granularity);

    @Query(value = """
        select date_trunc(:granularity, o.created_at),
               count(*), sum(o.total_net), sum(o.total_gross)
        from purchase_orders o
        where o.status = 'RECEIVED'
          and o.created_at >= :from and o.created_at <= :to
        group by 1
        order by 1
        """, nativeQuery = true)
    List<Object[]> purchaseReport(@Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to,
                                  @Param("granularity") String granularity);

    @Query("""
        select new com.mini_erp.backend.report.web.dto.TopProductRow(
            i.productId, i.sku, i.productName,
            sum(i.quantity), sum(i.unitPrice * i.quantity))
        from SalesOrderItem i
        where i.orderId in (select o.id from SalesOrder o
                            where o.status = :status
                              and o.createdAt >= :from and o.createdAt <= :to)
        group by i.productId, i.sku, i.productName
        order by sum(i.quantity) desc
        """)
    List<TopProductRow> topProducts(@Param("status") SalesOrderStatus status,
                                    @Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

    @Query("""
        select new com.mini_erp.backend.report.web.dto.TopCustomerRow(
            o.customer.id, o.customer.name, count(o), sum(o.totalGross))
        from SalesOrder o
        where o.status = :status
          and o.createdAt >= :from and o.createdAt <= :to
        group by o.customer.id, o.customer.name
        order by sum(o.totalGross) desc
        """)
    List<TopCustomerRow> topCustomers(@Param("status") SalesOrderStatus status,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    @Query("""
        select new com.mini_erp.backend.report.web.dto.MarginRow(
            i.productId, i.sku, i.productName,
            sum(i.unitPrice * i.quantity),
            sum(i.purchasePrice * i.quantity),
            sum((i.unitPrice - i.purchasePrice) * i.quantity))
        from SalesOrderItem i
        where i.purchasePrice is not null
          and i.orderId in (select o.id from SalesOrder o
                            where o.status = :status
                              and o.createdAt >= :from and o.createdAt <= :to)
        group by i.productId, i.sku, i.productName
        order by sum((i.unitPrice - i.purchasePrice) * i.quantity) desc
        """)
    List<MarginRow> margin(@Param("status") SalesOrderStatus status,
                           @Param("from") LocalDateTime from,
                           @Param("to") LocalDateTime to);

    @Query("""
        select new com.mini_erp.backend.report.web.dto.WarehouseStockRow(
            p.id, p.sku, p.name, p.warehouse.name, p.stock,
            p.stock * p.purchasePrice)
        from Product p
        where p.active = true
        order by p.warehouse.name, p.name
        """)
    List<WarehouseStockRow> stockLevels();

    @Query("""
        select new com.mini_erp.backend.report.web.dto.WarehouseValueRow(
            p.warehouse.id, p.warehouse.name, coalesce(sum(p.stock * p.purchasePrice), 0))
        from Product p
        where p.active = true
        group by p.warehouse.id, p.warehouse.name
        order by p.warehouse.name
        """)
    List<WarehouseValueRow> warehouseValue();
}