package com.mini_erp.backend.supplier.service;

import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.mapper.SupplierMapper;
import com.mini_erp.backend.supplier.repository.SupplierRepository;
import com.mini_erp.backend.supplier.web.dto.*;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupplierService {

    private final SupplierRepository suppliers;
    private final SupplierMapper mapper;

    public SupplierService(SupplierRepository suppliers, SupplierMapper mapper) {
        this.suppliers = suppliers;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponse> list(String search, Boolean active, Pageable pageable) {
        return suppliers.search(search, active, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SupplierResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        if (suppliers.existsByNip(req.nip())) {
            throw new IllegalArgumentException("NIP już istnieje: " + req.nip());
        }
        Supplier s = mapper.toEntity(req);
        applyCountryDefault(s);
        return mapper.toResponse(suppliers.save(s));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = findOrThrow(id);
        mapper.update(req, s);
        applyCountryDefault(s);
        return mapper.toResponse(s);
    }

    @Transactional
    public void activate(Long id) {
        Supplier s = findOrThrow(id);
        s.setActive(true);
        suppliers.save(s);
    }

    @Transactional
    public void deactivate(Long id) {
        findOrThrow(id).setActive(false);
    }

    private Supplier findOrThrow(Long id) {
        return suppliers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono dostawcy: " + id));
    }

    private void applyCountryDefault(Supplier s) {
        if (s.getCountry() == null || s.getCountry().isBlank()) {
            s.setCountry("Polska");
        }
    }
}