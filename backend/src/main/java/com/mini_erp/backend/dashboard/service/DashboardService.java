package com.mini_erp.backend.dashboard.service;

import com.mini_erp.backend.dashboard.repository.DashboardRepository;
import com.mini_erp.backend.dashboard.web.dto.DashboardSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardRepository repo;

    public DashboardService(DashboardRepository repo) {
        this.repo = repo;
    }

    public DashboardSummary summary() {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        return new DashboardSummary(
                repo.countActiveCustomers(),
                repo.countActiveProducts(),
                repo.countActiveOrders(),
                repo.salesValue(monthStart, now),
                repo.purchasesValue(monthStart, now),
                repo.warehouseValue(),
                repo.countLowStock());
    }
}