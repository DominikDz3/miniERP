package com.mini_erp.backend.customer.web;

import com.mini_erp.backend.customer.service.CustomerService;
import com.mini_erp.backend.customer.service.PayerAddressService;
import com.mini_erp.backend.customer.service.ReceiverAddressService;
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

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final PayerAddressService payerService;
    private final ReceiverAddressService receiverService;

    public CustomerController(CustomerService customerService,
                              PayerAddressService payerService,
                              ReceiverAddressService receiverService) {
        this.customerService = customerService;
        this.payerService = payerService;
        this.receiverService = receiverService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public Page<CustomerResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return customerService.list(search, active, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public CustomerResponse get(@PathVariable Long id) {
        return customerService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest req) {
        return customerService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return customerService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) { customerService.deactivate(id); }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable Long id) { customerService.activate(id); }

    // payer addresses

    @GetMapping("/{id}/payer-addresses")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public List<AddressResponse> listPayers(@PathVariable Long id) {
        return payerService.list(id);
    }

    @PostMapping("/{id}/payer-addresses")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addPayer(@PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return payerService.addAndRespond(id, req);
    }

    @DeleteMapping("/{id}/payer-addresses/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removePayer(@PathVariable Long id, @PathVariable Long addressId) {
        payerService.remove(id, addressId);
    }

    @PatchMapping("/{id}/default-payer/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    public CustomerResponse setDefaultPayer(@PathVariable Long id, @PathVariable Long addressId) {
        payerService.setDefault(id, addressId);
        return customerService.get(id);
    }

    // receiver addresses

    @GetMapping("/{id}/receiver-addresses")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public List<AddressResponse> listReceivers(@PathVariable Long id) {
        return receiverService.list(id);
    }

    @PostMapping("/{id}/receiver-addresses")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addReceiver(@PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return receiverService.addAndRespond(id, req);
    }

    @DeleteMapping("/{id}/receiver-addresses/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeReceiver(@PathVariable Long id, @PathVariable Long addressId) {
        receiverService.remove(id, addressId);
    }

    @PatchMapping("/{id}/default-receiver/{addressId}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE')")
    public CustomerResponse setDefaultReceiver(@PathVariable Long id, @PathVariable Long addressId) {
        receiverService.setDefault(id, addressId);
        return customerService.get(id);
    }
}