package com.mini_erp.backend.customer.service;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.web.dto.CustomerRequest;
import com.mini_erp.backend.customer.web.dto.CustomerResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock CustomerRepository customers;
    @InjectMocks CustomerService service;

    private CustomerRequest request() {
        return new CustomerRequest(
                "Firma Kowalski", "1234567890",
                "ul. Główna 1", "Warszawa", "00-001", "Polska",
                "kontakt@firma.pl", "600100200");
    }

    private Customer entity() {
        Customer c = new Customer();
        c.setId(10L);
        c.setName("Firma Kowalski");
        c.setNip("1234567890");
        c.setStreet("ul. Główna 1");
        c.setCity("Warszawa");
        c.setPostalCode("00-001");
        c.setCountry("Polska");
        c.setEmail("kontakt@firma.pl");
        c.setPhone("600100200");
        c.setActive(true);
        return c;
    }

    // create

    // A duplicate NIP must be rejected and nothing should be persisted
    @Test
    void create_throwsWhenNipAlreadyExists() {
        when(customers.existsByNip("1234567890")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1234567890");

        verify(customers, never()).save(any());
    }

    // A null NIP skips the uniqueness check entirely (individuals without NIP)
    @Test
    void create_savesWhenNipIsNull() {
        // given
        CustomerRequest req = new CustomerRequest(
                "Jan Nowak", null,
                "ul. Boczna 2", "Kraków", "30-002", "Polska",
                "jan@nowak.pl", null);
        when(customers.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(11L);
            return c;
        });

        // when
        CustomerResponse res = service.create(req);

        // then
        verify(customers, never()).existsByNip(any());
        assertThat(res.id()).isEqualTo(11L);
        assertThat(res.nip()).isNull();
    }

    // A missing country falls back to the default instead of persisting null
    @Test
    void create_defaultsCountryWhenNull() {
        // given
        CustomerRequest req = new CustomerRequest(
                "Firma Bez Kraju", "9998887776",
                "ul. Krótka 3", "Gdańsk", "80-003", null,
                "biuro@firma.pl", null);
        when(customers.existsByNip("9998887776")).thenReturn(false);
        when(customers.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        // when
        CustomerResponse res = service.create(req);

        // then
        assertThat(res.country()).isEqualTo("Polska");
    }

    @Test
    void create_savesCustomerAndReturnsResponse() {
        when(customers.existsByNip("1234567890")).thenReturn(false);
        when(customers.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        CustomerResponse res = service.create(request());

        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.name()).isEqualTo("Firma Kowalski");
        assertThat(res.city()).isEqualTo("Warszawa");
        assertThat(res.postalCode()).isEqualTo("00-001");
        assertThat(res.email()).isEqualTo("kontakt@firma.pl");
        assertThat(res.active()).isTrue();
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
        assertThat(res.city()).isEqualTo("Warszawa");
    }

    //  update

    @Test
    void update_throwsWhenNotFound() {
        when(customers.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, request()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");

        verify(customers, never()).save(any());
    }

    @Test
    void update_appliesChangesAndReturnsResponse() {
        // given
        Customer existing = entity();
        when(customers.findById(10L)).thenReturn(Optional.of(existing));
        when(customers.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerRequest req = new CustomerRequest(
                "Firma Kowalski Sp. z o.o.", "1234567890",
                "ul. Nowa 5", "Poznań", "60-005", "Polska",
                "nowy@firma.pl", "600100200");

        // when
        CustomerResponse res = service.update(10L, req);

        // then
        assertThat(res.name()).isEqualTo("Firma Kowalski Sp. z o.o.");
        assertThat(res.street()).isEqualTo("ul. Nowa 5");
        assertThat(res.city()).isEqualTo("Poznań");
        assertThat(res.email()).isEqualTo("nowy@firma.pl");
    }

    // deactivate

    // Deactivation (soft-delete)
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