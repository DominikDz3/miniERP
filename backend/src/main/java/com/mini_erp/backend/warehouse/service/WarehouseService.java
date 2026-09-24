package com.mini_erp.backend.warehouse.service;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
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
        auditService.log(AuditAction.CREATE, AuditEntity.WAREHOUSE, saved.getId(), "Utworzono magazyn: " + saved.getName());
        return mapper.toResponse(saved);
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest req) {
        Warehouse w = findOrThrow(id);
        mapper.update(req, w);
        applyCountryDefault(w);
        auditService.logJson(AuditAction.UPDATE, AuditEntity.WAREHOUSE, id, "Zaktualizowano magazyn", req);
        return mapper.toResponse(w);
    }

    @Transactional
    public void activate(Long id) {
        Warehouse w = findOrThrow(id);
        w.setActive(true);
        warehouses.save(w);
        auditService.log(AuditAction.ACTIVATE, AuditEntity.WAREHOUSE, id, "Aktywowano magazyn: " + w.getName());
    }

    @Transactional
    public void deactivate(Long id) {
        Warehouse w = findOrThrow(id);

        if (products.existsByWarehouseIdAndActiveTrue(id)) {
            throw new IllegalArgumentException(
                    "Nie można dezaktywować magazynu z aktywnymi produktami. Najpierw przenieś lub dezaktywuj towar");
        }
        w.setActive(false);
        auditService.log(AuditAction.DEACTIVATE, AuditEntity.WAREHOUSE, id, "Dezaktywowano magazyn: " + w.getName());    }

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