package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.mapper.CustomerMapper;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customers;
    private final CustomerMapper mapper;

    public CustomerService(CustomerRepository customers, CustomerMapper mapper) {
        this.customers = customers;
        this.mapper = mapper;
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
        validateReceiverPhones(req.receiverAddresses());

        Customer c = mapper.toEntity(req);
        attachAddresses(c, req);
        return mapper.toResponse(customers.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = findOrThrow(id);
        validateReceiverPhones(req.receiverAddresses());
        mapper.updateScalars(req, c);

        c.getPayerAddresses().clear();
        c.getReceiverAddresses().clear();
        attachAddresses(c, req);

        return mapper.toResponse(customers.save(c));
    }

    @Transactional
    public void deactivate(Long id) {
        Customer c = findOrThrow(id);
        c.setActive(false);
        customers.save(c);
    }

    @Transactional
    public AddressResponse addPayer(Long customerId, AddressRequest req) {
        Customer c = findOrThrow(customerId);
        PayerAddress a = mapper.toPayer(req);
        a.setCountry(req.country() == null ? "Polska" : req.country());

        if (req.isDefault()) {
            demoteCurrentPayerDefault(c);       // flush before inserting the new default
            a.setDefault(true);
        } else if (c.getPayerAddresses().isEmpty()) {
            a.setDefault(true);                 // first address becomes default
        }
        c.addPayer(a);
        customers.save(c);
        return mapper.toPayerResponse(a);
    }

    @Transactional
    public void removePayer(Long customerId, Long addressId) {
        Customer c = findOrThrow(customerId);
        PayerAddress a = c.getPayerAddresses().stream()
                .filter(p -> p.getId().equals(addressId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu płatnika: " + addressId));
        if (c.getPayerAddresses().size() == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres płatnika");
        }
        boolean wasDefault = a.isDefault();
        c.getPayerAddresses().remove(a);
        if (wasDefault) {
            c.getPayerAddresses().get(0).setDefault(true);
        }
        customers.save(c);
    }

    @Transactional
    public AddressResponse addReceiver(Long customerId, AddressRequest req) {
        if (req.phone() == null || req.phone().isBlank()) {
            throw new IllegalArgumentException("Adres odbiorcy wymaga numeru telefonu");
        }
        Customer c = findOrThrow(customerId);
        ReceiverAddress a = mapper.toReceiver(req);
        a.setCountry(req.country() == null ? "Polska" : req.country());

        if (req.isDefault()) {
            demoteCurrentReceiverDefault(c);
            a.setDefault(true);
        } else if (c.getReceiverAddresses().isEmpty()) {
            a.setDefault(true);
        }
        c.addReceiver(a);
        customers.save(c);
        return mapper.toReceiverResponse(a);
    }

    @Transactional
    public void removeReceiver(Long customerId, Long addressId) {
        Customer c = findOrThrow(customerId);
        ReceiverAddress a = c.getReceiverAddresses().stream()
                .filter(r -> r.getId().equals(addressId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu odbiorcy: " + addressId));
        if (c.getReceiverAddresses().size() == 1) {
            throw new IllegalArgumentException("Klient musi mieć co najmniej jeden adres odbiorcy");
        }
        boolean wasDefault = a.isDefault();
        c.getReceiverAddresses().remove(a);
        if (wasDefault) {
            c.getReceiverAddresses().get(0).setDefault(true);
        }
        customers.save(c);
    }

    // helpers

    private Customer findOrThrow(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }

    private void attachAddresses(Customer c, CustomerRequest req) {
        for (AddressRequest ar : req.payerAddresses()) {
            PayerAddress a = mapper.toPayer(ar);
            a.setCountry(ar.country() == null ? "Polska" : ar.country());
            c.addPayer(a);
        }
        for (AddressRequest ar : req.receiverAddresses()) {
            ReceiverAddress a = mapper.toReceiver(ar);
            a.setCountry(ar.country() == null ? "Polska" : ar.country());
            c.addReceiver(a);
        }
        promoteFirstIfNoDefault(c.getPayerAddresses(), PayerAddress::isDefault, PayerAddress::setDefault);
        promoteFirstIfNoDefault(c.getReceiverAddresses(), ReceiverAddress::isDefault, ReceiverAddress::setDefault);
    }

    // The partial unique index forbids two defaults at once, and Hibernate inserts
    // before it updates — so unset the old default and flush before the new insert.
    private void demoteCurrentPayerDefault(Customer c) {
        c.getPayerAddresses().forEach(p -> p.setDefault(false));
        customers.saveAndFlush(c);
    }

    private void demoteCurrentReceiverDefault(Customer c) {
        c.getReceiverAddresses().forEach(r -> r.setDefault(false));
        customers.saveAndFlush(c);
    }

    // Receiver addresses must carry a phone
    private void validateReceiverPhones(List<AddressRequest> receivers) {
        boolean missing = receivers.stream()
                .anyMatch(a -> a.phone() == null || a.phone().isBlank());
        if (missing) {
            throw new IllegalArgumentException("Adres odbiorcy wymaga numeru telefonu");
        }
    }

    // If no address in the list is flagged default, promote the first one.
    private <T> void promoteFirstIfNoDefault(List<T> addresses,
                                             java.util.function.Predicate<T> isDefault,
                                             java.util.function.BiConsumer<T, Boolean> setDefault) {
        if (!addresses.isEmpty() && addresses.stream().noneMatch(isDefault)) {
            setDefault.accept(addresses.get(0), true);
        }
    }
}