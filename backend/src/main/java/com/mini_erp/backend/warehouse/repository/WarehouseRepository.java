package com.mini_erp.backend.warehouse.repository;

import com.mini_erp.backend.warehouse.domain.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    boolean existsByName(String name);

    @Query("""
        select w from Warehouse w
        where (:active is null or w.active = :active)
          and (:search is null
               or lower(w.name) like lower(concat('%', cast(:search as string), '%')))
        """)
    Page<Warehouse> search(@Param("search") String search,
                           @Param("active") Boolean active,
                           Pageable pageable);
}