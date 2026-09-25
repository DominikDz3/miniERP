package com.mini_erp.backend.customer.service;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock CustomerRepository customers;
    @Spy CustomerMapper mapper = Mappers.getMapper(CustomerMapper.class);
    @Mock PayerAddressService payerService;
    @Mock ReceiverAddressService receiverService;
    @InjectMocks CustomerService service;
    @Mock AuditService auditService;

    private AddressRequest payerAddr() {
        return new AddressRequest("ul. Główna 1", "Warszawa", "00-001", "Polska", null);
    }

    private AddressRequest receiverAddr() {
        return new AddressRequest("ul. Odbiór 2", "Kraków", "30-002", "Polska", "600100200");
    }

    private CustomerRequest request() {
        return new CustomerRequest(
                "Firma Kowalski", "1234567890", "kontakt@firma.pl",
                List.of(payerAddr()), List.of(receiverAddr()));
    }

    private Customer entity() {
        Customer c = new Customer();
        c.setId(10L);
        c.setName("Firma Kowalski");
        c.setNip("1234567890");
        c.setEmail("kontakt@firma.pl");
        c.setActive(true);
        return c;
    }

    // create
    @Test
    void create_throwsWhenNipAlreadyExists() {
        when(customers.existsByNip("1234567890")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1234567890");

        verify(customers, never()).save(any());
    }

    @Test
    void create_savesCustomerAndReturnsResponse() {
        when(customers.existsByNip("1234567890")).thenReturn(false);
        when(customers.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            if (c.getId() == null) c.setId(10L);
            return c;
        });
        PayerAddress pa = new PayerAddress();
        pa.setId(100L);
        ReceiverAddress ra = new ReceiverAddress();
        ra.setId(200L);
        when(payerService.add(eq(10L), any())).thenReturn(pa);
        when(receiverService.add(eq(10L), any())).thenReturn(ra);

        CustomerResponse res = service.create(request());

        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.name()).isEqualTo("Firma Kowalski");
        assertThat(res.defaultPayerId()).isEqualTo(100L);
        assertThat(res.defaultReceiverId()).isEqualTo(200L);
        assertThat(res.active()).isTrue();
    }

    @Test
    void create_throwsWhenReceiverAddressHasNoPhone() {
        AddressRequest noPhone = new AddressRequest("ul. X 1", "Miasto", "00-000", "Polska", null);
        CustomerRequest req = new CustomerRequest(
                "Firma", "1234567890", "a@b.pl",
                List.of(payerAddr()), List.of(noPhone));

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("telefon");

        verify(customers, never()).save(any());
    }

    // get

    @Test
    void get_throwsWhenNotFound() {
        when(customers.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void get_returnsResponseWhenFound() {
        when(customers.findById(10L)).thenReturn(Optional.of(entity()));

        CustomerResponse res = service.get(10L);

        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.name()).isEqualTo("Firma Kowalski");
    }

    // update (scalars only)

    @Test
    void update_throwsWhenNotFound() {
        when(customers.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, request()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");

        verify(customers, never()).save(any());
    }

    @Test
    void update_appliesScalarsAndReturnsResponse() {
        Customer existing = entity();
        when(customers.findById(10L)).thenReturn(Optional.of(existing));
        when(customers.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerRequest req = new CustomerRequest(
                "Firma Kowalski Sp. z o.o.", "1234567890", "nowy@firma.pl",
                List.of(payerAddr()), List.of(receiverAddr()));

        CustomerResponse res = service.update(10L, req);

        assertThat(res.name()).isEqualTo("Firma Kowalski Sp. z o.o.");
        assertThat(res.email()).isEqualTo("nowy@firma.pl");
    }

    // deactivate

    @Test
    void deactivate_setsActiveToFalse() {
        Customer existing = entity();
        when(customers.findById(10L)).thenReturn(Optional.of(existing));
        when(customers.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        service.deactivate(10L);

        assertThat(existing.isActive()).isFalse();
        verify(customers).save(existing);
    }

    @Test
    void deactivate_throwsWhenNotFound() {
        when(customers.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deactivate(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }
}