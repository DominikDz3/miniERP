package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.shared.mappers.PayerAddressMapper;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.repository.PayerAddressRepository;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PayerAddressService {

    private final CustomerRepository customers;
    private final PayerAddressRepository payers;
    private final PayerAddressMapper mapper;

    public PayerAddressService(CustomerRepository customers,
                               PayerAddressRepository payers,
                               PayerAddressMapper mapper) {
        this.customers = customers;
        this.payers = payers;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long customerId) {
        Customer c = customer(customerId);
        return payers.findByCustomerIdAndActiveTrueOrderById(customerId).stream()
                .map(a -> mapper.toResponse(a, a.getId().equals(c.getDefaultPayerId())))
                .toList();
    }

    @Transactional
    public PayerAddress add(Long customerId, AddressRequest req) {
        PayerAddress a = mapper.toEntity(req);
        a.setCustomerId(customerId);
        a.setCountry(req.country() == null || req.country().isBlank()
                ? "Polska" : req.country());
        return payers.save(a);
    }

    @Transactional
    public AddressResponse addAndRespond(Long customerId, AddressRequest req) {
        Customer c = customer(customerId);
        PayerAddress a = add(customerId, req);
        if (c.getDefaultPayerId() == null) {
            c.setDefaultPayerId(a.getId());
            customers.save(c);
        }
        return mapper.toResponse(a, a.getId().equals(c.getDefaultPayerId()));
    }

    @Transactional
    public AddressResponse update(Long customerId, Long addressId, AddressRequest req) {
        Customer c = customer(customerId);
        PayerAddress old = findActiveOwned(customerId, addressId);

        PayerAddress created = add(customerId, req);
        old.setActive(false);
        payers.save(old);

        if (old.getId().equals(c.getDefaultPayerId())) {
            c.setDefaultPayerId(created.getId());
            customers.save(c);
        }
        return mapper.toResponse(created, created.getId().equals(c.getDefaultPayerId()));
    }

    @Transactional
    public void remove(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        PayerAddress a = findActiveOwned(customerId, addressId);
        if (payers.countByCustomerIdAndActiveTrue(customerId) == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres płatnika");
        }
        a.setActive(false);
        payers.save(a);

        if (a.getId().equals(c.getDefaultPayerId())) {
            PayerAddress next = payers.findByCustomerIdAndActiveTrueOrderById(customerId).get(0);
            c.setDefaultPayerId(next.getId());
            customers.save(c);
        }
    }

    @Transactional
    public void setDefault(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        findActiveOwned(customerId, addressId);
        c.setDefaultPayerId(addressId);
        customers.save(c);
    }

    private PayerAddress findActiveOwned(Long customerId, Long addressId) {
        return payers.findById(addressId)
                .filter(p -> p.getCustomerId().equals(customerId))
                .filter(p -> p.isActive())
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu płatnika: " + addressId));
    }

    private Customer customer(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }
}