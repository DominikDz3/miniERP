package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.mapper.PayerAddressMapper;
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
        return payers.findByCustomerIdOrderById(customerId).stream()
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
    public void remove(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        PayerAddress a = payers.findById(addressId)
                .filter(p -> p.getCustomerId().equals(customerId))
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu płatnika: " + addressId));
        if (payers.countByCustomerId(customerId) == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres płatnika");
        }
        boolean wasDefault = a.getId().equals(c.getDefaultPayerId());
        if (wasDefault) {
            c.setDefaultPayerId(null);
            customers.saveAndFlush(c);      // release FK before delete
        }
        payers.delete(a);
        if (wasDefault) {
            c.setDefaultPayerId(payers.findByCustomerIdOrderById(customerId).get(0).getId());
            customers.save(c);
        }
    }

    @Transactional
    public void setDefault(Long customerId, Long addressId) {
        Customer c = customer(customerId);
        boolean owns = payers.findById(addressId)
                .map(p -> p.getCustomerId().equals(customerId)).orElse(false);
        if (!owns) throw new NotFoundException("Adres płatnika nie należy do klienta: " + addressId);
        c.setDefaultPayerId(addressId);
        customers.save(c);
    }

    private Customer customer(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }
}