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
        return receivers.findByCustomerIdOrderById(customerId).stream()
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
    public void remove(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        ReceiverAddress a = receivers.findById(addressId)
                .filter(r -> r.getCustomerId().equals(customerId))
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu odbiorcy: " + addressId));
        if (receivers.countByCustomerId(customerId) == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres odbiorcy");
        }
        boolean wasDefault = a.getId().equals(c.getDefaultReceiverId());
        if (wasDefault) {
            c.setDefaultReceiverId(null);
            customers.saveAndFlush(c);
        }
        receivers.delete(a);
        if (wasDefault) {
            c.setDefaultReceiverId(receivers.findByCustomerIdOrderById(customerId).get(0).getId());
            customers.save(c);
        }
    }

    @Transactional
    public void setDefault(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        boolean owns = receivers.findById(addressId)
                .map(r -> r.getCustomerId().equals(customerId)).orElse(false);
        if (!owns) throw new NotFoundException("Adres odbiorcy nie należy do klienta: " + addressId);
        c.setDefaultReceiverId(addressId);
        customers.save(c);
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