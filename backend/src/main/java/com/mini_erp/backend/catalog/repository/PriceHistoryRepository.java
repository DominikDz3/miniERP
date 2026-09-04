package com.mini_erp.backend.catalog.repository;

import com.mini_erp.backend.catalog.domain.PriceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    Page<PriceHistory> findByProductIdOrderByChangedAtDesc(Long productId, Pageable pageable);
}