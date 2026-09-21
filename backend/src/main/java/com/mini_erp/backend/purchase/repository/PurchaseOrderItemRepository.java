package com.mini_erp.backend.purchase.repository;

import com.mini_erp.backend.purchase.domain.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    List<PurchaseOrderItem> findByOrderIdOrderById(Long orderId);
}