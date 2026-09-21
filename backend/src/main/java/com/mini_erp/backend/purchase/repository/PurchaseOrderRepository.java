package com.mini_erp.backend.purchase.repository;

import com.mini_erp.backend.purchase.domain.PurchaseOrder;
import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("""
        select o from PurchaseOrder o
        where (:supplierId is null or o.supplier.id = :supplierId)
          and (:status     is null or o.status = :status)
          and (cast(:from as timestamp) is null or o.createdAt >= :from)
          and (cast(:to   as timestamp) is null or o.createdAt <= :to)
        """)
    Page<PurchaseOrder> search(@Param("supplierId") Long supplierId,
                               @Param("status") PurchaseOrderStatus status,
                               @Param("from") LocalDateTime from,
                               @Param("to") LocalDateTime to,
                               Pageable pageable);
}