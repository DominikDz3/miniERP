package com.mini_erp.backend.customer.repository;

import com.mini_erp.backend.customer.domain.ReceiverAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReceiverAddressRepository extends JpaRepository<ReceiverAddress, Long> {
    List<ReceiverAddress> findByCustomerIdOrderById(Long customerId);
    long countByCustomerId(Long customerId);
}