package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.shared.mappers.CustomerMapper;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customers;
    private final CustomerMapper mapper;
    private final PayerAddressService payerService;
    private final ReceiverAddressService receiverService;
    private final AuditService auditService;

    public CustomerService(CustomerRepository customers,
                           CustomerMapper mapper,
                           PayerAddressService payerService,
                           ReceiverAddressService receiverService,
                           AuditService auditService) {
        this.customers = customers;
        this.mapper = mapper;
        this.payerService = payerService;
        this.receiverService = receiverService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String search, Boolean active, Pageable pageable) {
        return customers.search(search, active, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest req) {
        if (req.nip() != null && customers.existsByNip(req.nip())) {
            throw new IllegalArgumentException("NIP już istnieje: " + req.nip());
        }
        for (AddressRequest ar : req.receiverAddresses()) {
            if (ar.phone() == null || ar.phone().isBlank()) {
                throw new IllegalArgumentException("Adres odbiorcy wymaga numeru telefonu");
            }
        }

        Customer c = customers.save(mapper.toEntity(req));
        auditService.log(AuditAction.CREATE, AuditEntity.CUSTOMER, c.getId(), "Utworzono klienta: " + c.getName());

        PayerAddress firstPayer = null;
        for (AddressRequest ar : req.payerAddresses()) {
            PayerAddress a = payerService.add(c.getId(), ar);
            if (firstPayer == null) firstPayer = a;
        }
        ReceiverAddress firstReceiver = null;
        for (AddressRequest ar : req.receiverAddresses()) {
            ReceiverAddress a = receiverService.add(c.getId(), ar);
            if (firstReceiver == null) firstReceiver = a;
        }

        c.setDefaultPayerId(firstPayer.getId());
        c.setDefaultReceiverId(firstReceiver.getId());
        return mapper.toResponse(customers.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {   // scalars only
        Customer c = findOrThrow(id);
        mapper.updateScalars(req, c);
        Customer saved = customers.save(c);
        auditService.logJson(AuditAction.UPDATE, AuditEntity.CUSTOMER, saved.getId(), "Zaktualizowano klienta", req);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void activate(Long id) {
        Customer c = findOrThrow(id);
        c.setActive(true);
        customers.save(c);
        auditService.log(AuditAction.ACTIVATE, AuditEntity.CUSTOMER, id, "Aktywowano klienta: " + c.getName());
    }

    @Transactional
    public void deactivate(Long id) {
        Customer c = findOrThrow(id);
        c.setActive(false);
        customers.save(c);
        auditService.log(AuditAction.DEACTIVATE, AuditEntity.CUSTOMER, id, "Dezaktywowano klienta: " + c.getName());   }

    private Customer findOrThrow(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }
}