package com.mini_erp.backend.warehouse.repository;

import com.mini_erp.backend.warehouse.domain.StockMovement;
import com.mini_erp.backend.warehouse.domain.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    @Query("""
        select m from StockMovement m
        where (:productId is null or m.productId = :productId)
          and (:warehouseId is null or m.warehouseId = :warehouseId)
          and (:type is null or m.type = :type)
          and (cast(:from as timestamp) is null or m.createdAt >= :from)
          and (cast(:to as timestamp) is null or m.createdAt <= :to)
        """)
    Page<StockMovement> search(@Param("productId") Long productId,
                               @Param("warehouseId") Long warehouseId,
                               @Param("type") StockMovementType type,
                               @Param("from") LocalDateTime from,
                               @Param("to") LocalDateTime to,
                               Pageable pageable);
}