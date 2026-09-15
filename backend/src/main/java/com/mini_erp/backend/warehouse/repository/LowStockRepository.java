package com.mini_erp.backend.warehouse.repository;

import com.mini_erp.backend.warehouse.domain.LowStockProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LowStockRepository extends JpaRepository<LowStockProduct, Long> {

    List<LowStockProduct> findByWarehouseId(Long warehouseId);
}