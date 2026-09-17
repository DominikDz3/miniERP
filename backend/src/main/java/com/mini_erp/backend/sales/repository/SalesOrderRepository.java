package com.mini_erp.backend.sales.repository;

import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    @Query("""
        select o from SalesOrder o
        where (:customerId is null or o.customer.id = :customerId)
          and (:status     is null or o.status = :status)
          and (cast(:from as timestamp) is null or o.createdAt >= :from)
          and (cast(:to   as timestamp) is null or o.createdAt <= :to)
        """)
    Page<SalesOrder> search(@Param("customerId") Long customerId,
                            @Param("status") SalesOrderStatus status,
                            @Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to,
                            Pageable pageable);
}