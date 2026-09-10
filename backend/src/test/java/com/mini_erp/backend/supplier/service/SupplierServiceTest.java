package com.mini_erp.backend.supplier.service;

import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.mapper.SupplierMapper;
import com.mini_erp.backend.supplier.repository.SupplierRepository;
import com.mini_erp.backend.supplier.web.dto.*;
import com.mini_erp.backend.shared.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock SupplierRepository suppliers;
    final SupplierMapper mapper = Mappers.getMapper(SupplierMapper.class);
    SupplierService service;

    @BeforeEach
    void setUp() {
        service = new SupplierService(suppliers, mapper);
    }

    private SupplierRequest request() {
        return new SupplierRequest(
                "Hurtownia XYZ", "1234567890", "biuro@xyz.pl", "500600700",
                "ul. Handlowa 3", "Rzeszów", "35-001", null);
    }

    // create

    @Test
    void create_throwsWhenNipAlreadyExists() {
        // given
        when(suppliers.existsByNip("1234567890")).thenReturn(true);
        // when / then
        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1234567890");
        verify(suppliers, never()).save(any());
    }

    @Test
    void create_defaultsCountryWhenNull() {
        // given
        when(suppliers.existsByNip(any())).thenReturn(false);
        when(suppliers.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));
        // when
        SupplierResponse res = service.create(request());
        // then
        assertThat(res.country()).isEqualTo("Polska");
    }

    @Test
    void create_savesAndReturnsResponse() {
        // given
        when(suppliers.existsByNip(any())).thenReturn(false);
        when(suppliers.save(any(Supplier.class))).thenAnswer(inv -> {
            Supplier s = inv.getArgument(0);
            s.setId(7L);
            return s;
        });
        // when
        SupplierResponse res = service.create(request());
        // then
        assertThat(res.id()).isEqualTo(7L);
        assertThat(res.name()).isEqualTo("Hurtownia XYZ");
        assertThat(res.active()).isTrue();
    }

    @Test
    void create_keepsCountryWhenProvided() {
        // given
        when(suppliers.existsByNip(any())).thenReturn(false);
        when(suppliers.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));
        SupplierRequest withCountry = new SupplierRequest(
                "Zagr. sp.", "9998887776", "eu@x.com", "48500600700",
                "Main St 1", "Berlin", "10115", "Niemcy");
        // when
        SupplierResponse res = service.create(withCountry);
        // then
        assertThat(res.country()).isEqualTo("Niemcy");
    }

    // get

    @Test
    void get_throwsWhenNotFound() {
        // given
        when(suppliers.findById(99L)).thenReturn(Optional.empty());
        // when / then
        assertThatThrownBy(() -> service.get(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    // update

    @Test
    void update_throwsWhenNotFound() {
        // given
        when(suppliers.findById(99L)).thenReturn(Optional.empty());
        // when / then
        assertThatThrownBy(() -> service.update(99L, request()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_appliesScalars() {
        // given
        Supplier existing = new Supplier();
        existing.setId(7L);
        existing.setName("Stara");
        existing.setCountry("Polska");
        when(suppliers.findById(7L)).thenReturn(Optional.of(existing));
        // when
        SupplierResponse res = service.update(7L,
                new SupplierRequest("Nowa", "1112223334", "n@x.pl", "500",
                        "ul. Nowa 2", "Kraków", "30-001", null));
        // then
        assertThat(res.name()).isEqualTo("Nowa");
    }

    // deactivate

    @Test
    void deactivate_setsActiveToFalse() {
        // given
        Supplier existing = new Supplier();
        existing.setActive(true);
        when(suppliers.findById(7L)).thenReturn(Optional.of(existing));
        // when
        service.deactivate(7L);
        // then
        assertThat(existing.isActive()).isFalse();
    }

    @Test
    void deactivate_throwsWhenNotFound() {
        // given
        when(suppliers.findById(99L)).thenReturn(Optional.empty());
        // when / then
        assertThatThrownBy(() -> service.deactivate(99L))
                .isInstanceOf(NotFoundException.class);
    }
}