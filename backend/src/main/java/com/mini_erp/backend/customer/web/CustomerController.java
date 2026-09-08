package com.mini_erp.backend.customer.web;

import com.mini_erp.backend.customer.service.CustomerService;
import com.mini_erp.backend.customer.web.dto.AddressRequest;
import com.mini_erp.backend.customer.web.dto.AddressResponse;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public Page<CustomerResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return service.list(search, active, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public CustomerResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        service.deactivate(id);
    }

    // payer addresses

    @PostMapping("/{id}/payer-addresses")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addPayer(@PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return service.addPayer(id, req);
    }

    @DeleteMapping("/{id}/payer-addresses/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removePayer(@PathVariable Long id, @PathVariable Long addressId) {
        service.removePayer(id, addressId);
    }

    // receiver addresses

    @PostMapping("/{id}/receiver-addresses")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addReceiver(@PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return service.addReceiver(id, req);
    }

    @DeleteMapping("/{id}/receiver-addresses/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeReceiver(@PathVariable Long id, @PathVariable Long addressId) {
        service.removeReceiver(id, addressId);
    }
}