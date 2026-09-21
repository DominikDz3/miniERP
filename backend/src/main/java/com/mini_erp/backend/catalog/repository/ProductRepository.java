package com.mini_erp.backend.catalog.repository;

import com.mini_erp.backend.catalog.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySkuAndWarehouseId(String sku, Long warehouseId);
    Optional<Product> findBySkuAndWarehouseId(String sku, Long warehouseId);
    boolean existsByWarehouseIdAndActiveTrue(Long warehouseId);
    List<Product> findByWarehouseId(Long warehouseId);

    @Query("""
    select p from Product p
    where (:search is null or
           lower(p.name) like lower(concat('%', cast(:search as string), '%')) or
           lower(p.sku)  like lower(concat('%', cast(:search as string), '%')))
      and (:active is null or p.active = :active)
      and (:categoryId is null or p.category.id = :categoryId)
      and (:warehouseId is null or p.warehouse.id = :warehouseId)
    """)
    Page<Product> search(@Param("search") String search,
                         @Param("active") Boolean active,
                         @Param("categoryId") Long categoryId,
                         @Param("warehouseId") Long warehouseId,
                         Pageable pageable);
}
