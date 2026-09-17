package com.mini_erp.backend.sales.repository;

import com.mini_erp.backend.sales.domain.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {

    List<SalesOrderItem> findByOrderIdOrderById(Long orderId);
}