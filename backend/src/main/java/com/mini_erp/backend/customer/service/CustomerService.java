package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.repository.CustomerRepository;
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

    public CustomerService(CustomerRepository customers) {
        this.customers = customers;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String search, Boolean active, Pageable pageable) {
        return customers.search(search, active, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest req) {
        if (req.nip() != null && customers.existsByNip(req.nip())) {
            throw new IllegalArgumentException("NIP już istnieje: " + req.nip());
        }
        Customer c = new Customer();
        apply(c, req);
        return toResponse(customers.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = findOrThrow(id);
        apply(c, req);
        return toResponse(customers.save(c));
    }

    @Transactional
    public void deactivate(Long id) {
        Customer c = findOrThrow(id);
        c.setActive(false);
        customers.save(c);
    }

    // helpers

    private Customer findOrThrow(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }

    private void apply(Customer c, CustomerRequest req) {
        c.setName(req.name());
        c.setNip(req.nip());
        c.setStreet(req.street());
        c.setCity(req.city());
        c.setPostalCode(req.postalCode());
        c.setCountry(req.country() == null ? "Polska" : req.country());
        c.setEmail(req.email());
        c.setPhone(req.phone());
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(
                c.getId(), c.getName(), c.getNip(),
                c.getStreet(), c.getCity(), c.getPostalCode(), c.getCountry(),
                c.getEmail(), c.getPhone(), c.isActive(), c.getCreatedAt()
        );
    }
}
