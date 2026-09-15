package com.mini_erp.backend.warehouse.service;

import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.mapper.WarehouseMapper;
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

    public WarehouseService(WarehouseRepository warehouses, WarehouseMapper mapper) {
        this.warehouses = warehouses;
        this.mapper = mapper;
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
        return mapper.toResponse(warehouses.save(w));
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest req) {
        Warehouse w = findOrThrow(id);
        mapper.update(req, w);
        applyCountryDefault(w);
        return mapper.toResponse(w);
    }

    @Transactional
    public void activate(Long id) {
        findOrThrow(id).setActive(true);
    }

    @Transactional
    public void deactivate(Long id) {
        findOrThrow(id).setActive(false);
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