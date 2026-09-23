package com.mini_erp.backend.dashboard.repository;

import com.mini_erp.backend.sales.domain.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface DashboardRepository extends JpaRepository<SalesOrder, Long> {

    @Query("select count(c) from Customer c where c.active = true")
    long countActiveCustomers();

    @Query("select count(p) from Product p where p.active = true")
    long countActiveProducts();

    // active orders
    @Query("""
        select count(o) from SalesOrder o
        where o.status not in (com.mini_erp.backend.sales.domain.SalesOrderStatus.COMPLETED,
                               com.mini_erp.backend.sales.domain.SalesOrderStatus.CANCELLED)
        """)
    long countActiveOrders();

    // sales value in period
    @Query("""
        select coalesce(sum(o.totalGross), 0) from SalesOrder o
        where o.status = com.mini_erp.backend.sales.domain.SalesOrderStatus.COMPLETED
          and o.createdAt >= :from and o.createdAt <= :to
        """)
    BigDecimal salesValue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // purchase value in period
    @Query("""
        select coalesce(sum(o.totalGross), 0) from PurchaseOrder o
        where o.status = com.mini_erp.backend.purchase.domain.PurchaseOrderStatus.RECEIVED
          and o.createdAt >= :from and o.createdAt <= :to
        """)
    BigDecimal purchasesValue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // warehouse value
    @Query("select coalesce(sum(p.stock * p.purchasePrice), 0) from Product p where p.active = true")
    BigDecimal warehouseValue();

    // products below minimum
    @Query(value = "select count(*) from low_Stock_products", nativeQuery = true)
    long countLowStock();
}