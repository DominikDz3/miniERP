package com.mini_erp.backend.dashboard.web;

import com.mini_erp.backend.dashboard.service.DashboardService;
import com.mini_erp.backend.dashboard.web.dto.DashboardSummary;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public DashboardSummary summary() {
        return service.summary();
    }
}