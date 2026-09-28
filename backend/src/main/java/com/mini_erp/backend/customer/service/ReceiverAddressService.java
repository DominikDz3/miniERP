package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.shared.mappers.ReceiverAddressMapper;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.repository.ReceiverAddressRepository;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReceiverAddressService {

    private final CustomerRepository customers;
    private final ReceiverAddressRepository receivers;
    private final ReceiverAddressMapper mapper;

    public ReceiverAddressService(CustomerRepository customers,
                                  ReceiverAddressRepository receivers,
                                  ReceiverAddressMapper mapper) {
        this.customers = customers;
        this.receivers = receivers;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long customerId) {
        Customer c = customer(customerId);
        return receivers.findByCustomerIdAndActiveTrueOrderById(customerId).stream()
                .map(a -> mapper.toResponse(a, a.getId().equals(c.getDefaultReceiverId())))
                .toList();
    }

    @Transactional
    public ReceiverAddress add(Long customerId, AddressRequest req) {
        requirePhone(req);
        ReceiverAddress a = mapper.toEntity(req);
        a.setCustomerId(customerId);
        a.setCountry(req.country() == null || req.country().isBlank()
                ? "Polska" : req.country());
        return receivers.save(a);
    }

    @Transactional
    public AddressResponse addAndRespond(Long customerId, AddressRequest req) {
        Customer c = customer(customerId);
        ReceiverAddress a = add(customerId, req);
        if (c.getDefaultReceiverId() == null) {
            c.setDefaultReceiverId(a.getId());
            customers.save(c);
        }
        return mapper.toResponse(a, a.getId().equals(c.getDefaultReceiverId()));
    }

    @Transactional
    public AddressResponse update(Long customerId, Long addressId, AddressRequest req) {
        Customer c = customer(customerId);
        ReceiverAddress old = findActiveOwned(customerId, addressId);

        ReceiverAddress created = add(customerId, req);
        old.setActive(false);
        receivers.save(old);

        if (old.getId().equals(c.getDefaultReceiverId())) {
            c.setDefaultReceiverId(created.getId());
            customers.save(c);
        }
        return mapper.toResponse(created, created.getId().equals(c.getDefaultReceiverId()));
    }

    @Transactional
    public void remove(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        ReceiverAddress a = findActiveOwned(customerId, addressId);
        if (receivers.countByCustomerIdAndActiveTrue(customerId) == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres odbiorcy");
        }
        a.setActive(false);
        receivers.save(a);

        if (a.getId().equals(c.getDefaultReceiverId())) {
            ReceiverAddress next = receivers.findByCustomerIdAndActiveTrueOrderById(customerId).get(0);
            c.setDefaultReceiverId(next.getId());
            customers.save(c);
        }
    }

    @Transactional
    public void setDefault(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        findActiveOwned(customerId, addressId);
        c.setDefaultReceiverId(addressId);
        customers.save(c);
    }

    private ReceiverAddress findActiveOwned(Long customerId, Long addressId) {
        return receivers.findById(addressId)
                .filter(r -> r.getCustomerId().equals(customerId))
                .filter(r -> r.isActive())
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu odbiorcy: " + addressId));
    }

    private void requirePhone(AddressRequest req) {
        if (req.phone() == null || req.phone().isBlank()) {
            throw new IllegalArgumentException("Adres odbiorcy wymaga numeru telefonu");
        }
    }

    private Customer customer(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }
}