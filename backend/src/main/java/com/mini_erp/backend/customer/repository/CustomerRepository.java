package com.mini_erp.backend.customer.repository;

import com.mini_erp.backend.customer.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByNip(String nip);

    @Query("""
        select c from Customer c
        where (:search is null
               or lower(c.name) like lower(concat('%', cast(:search as string), '%'))
               or c.nip like concat('%', cast(:search as string), '%'))
          and (:active is null or c.active = :active)
        """)
    Page<Customer> search(@Param("search") String search,
                          @Param("active") Boolean active,
                          Pageable pageable);
}