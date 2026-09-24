package com.mini_erp.backend.warehouse.service;

import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.shared.mappers.WarehouseMapper;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
import com.mini_erp.backend.warehouse.web.dto.*;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouses;
    private final WarehouseMapper mapper;
    private final ProductRepository products;
    private final AuditService auditService;

    public WarehouseService(WarehouseRepository warehouses, WarehouseMapper mapper, ProductRepository products, AuditService auditService) {
        this.warehouses = warehouses;
        this.mapper = mapper;
        this.products = products;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<WarehouseResponse> list(String search, Boolean active, Pageable pageable) {
        return warehouses.search(search, active, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public WarehouseResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest req) {
        if (warehouses.existsByName(req.name())) {
            throw new IllegalArgumentException("Magazyn o takiej nazwie już istnieje: " + req.name());
        }
        Warehouse w = mapper.toEntity(req);
        applyCountryDefault(w);
        Warehouse saved = warehouses.save(w);
        auditService.log("CREATE", "WAREHOUSE", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest req) {
        Warehouse w = findOrThrow(id);
        mapper.update(req, w);
        applyCountryDefault(w);
        auditService.log("UPDATE", "WAREHOUSE", id);
        return mapper.toResponse(w);
    }

    @Transactional
    public void activate(Long id) {
        findOrThrow(id).setActive(true);
        auditService.log("ACTIVATE", "WAREHOUSE", id);
    }

    @Transactional
    public void deactivate(Long id) {
        Warehouse w = findOrThrow(id);

        if (products.existsByWarehouseIdAndActiveTrue(id)) {
            throw new IllegalArgumentException(
                    "Nie można dezaktywować magazynu z aktywnymi produktami. Najpierw przenieś lub dezaktywuj towar");
        }
        w.setActive(false);
        auditService.log("DEACTIVATE", "WAREHOUSE", id);
    }

    private Warehouse findOrThrow(Long id) {
        return warehouses.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono magazynu: " + id));
    }

    private void applyCountryDefault(Warehouse w) {
        if (w.getCountry() == null || w.getCountry().isBlank()) {
            w.setCountry("Polska");
        }
    }
}