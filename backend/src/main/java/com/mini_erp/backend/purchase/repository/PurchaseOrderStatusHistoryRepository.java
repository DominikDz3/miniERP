package com.mini_erp.backend.purchase.repository;

import com.mini_erp.backend.purchase.domain.PurchaseOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderStatusHistoryRepository extends JpaRepository<PurchaseOrderStatusHistory, Long> {
    List<PurchaseOrderStatusHistory> findByOrderIdOrderByChangedAtAsc(Long orderId);
}