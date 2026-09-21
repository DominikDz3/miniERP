package com.mini_erp.backend.sales.repository;

import com.mini_erp.backend.sales.domain.SalesOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesOrderStatusHistoryRepository extends JpaRepository<SalesOrderStatusHistory, Long> {
    List<SalesOrderStatusHistory> findByOrderIdOrderByChangedAtAsc(Long orderId);
}