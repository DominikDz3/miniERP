package com.mini_erp.backend.supplier.repository;

import com.mini_erp.backend.supplier.domain.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByNip(String nip);

    @Query("""
        select s from Supplier s
        where (:active is null or s.active = :active)
          and (:search is null
               or lower(s.name) like lower(concat('%', cast(:search as string), '%'))
               or lower(s.nip)  like lower(concat('%', cast(:search as string), '%')))
        """)
    Page<Supplier> search(@Param("search") String search,
                          @Param("active") Boolean active,
                          Pageable pageable);
}