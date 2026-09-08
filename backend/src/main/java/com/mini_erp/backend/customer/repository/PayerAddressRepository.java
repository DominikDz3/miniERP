package com.mini_erp.backend.customer.repository;

import com.mini_erp.backend.customer.domain.PayerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PayerAddressRepository extends JpaRepository<PayerAddress, Long> {
    List<PayerAddress> findByCustomerIdOrderById(Long customerId);
    long countByCustomerId(Long customerId);
}