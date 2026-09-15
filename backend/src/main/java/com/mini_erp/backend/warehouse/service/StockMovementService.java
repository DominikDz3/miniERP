package com.mini_erp.backend.warehouse.service;

import com.mini_erp.backend.warehouse.domain.StockMovementType;
import com.mini_erp.backend.warehouse.repository.StockMovementRepository;
import com.mini_erp.backend.warehouse.web.dto.StockMovementResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class StockMovementService {

    private final StockMovementRepository movements;

    public StockMovementService(StockMovementRepository movements) {
        this.movements = movements;
    }

    public Page<StockMovementResponse> list(Long productId,
                                            Long warehouseId,
                                            StockMovementType type,
                                            LocalDateTime from,
                                            LocalDateTime to,
                                            Pageable pageable) {
        return movements.search(productId, warehouseId, type, from, to, pageable)
                .map(m -> new StockMovementResponse(
                   m.getId(),
                   m.getProductId(),
                   m.getType(),
                   m.getQuantity(),
                   m.getWarehouseId(),
                   m.getTargetWarehouseId(),
                   m.getPerformedBy(),
                   m.getCreatedAt()
                ));
    }

}
