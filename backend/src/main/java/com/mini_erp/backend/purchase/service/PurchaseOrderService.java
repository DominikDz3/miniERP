package com.mini_erp.backend.purchase.service;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.domain.AuditEntity;
import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.service.ProductService;
import com.mini_erp.backend.purchase.domain.PurchaseOrder;
import com.mini_erp.backend.purchase.domain.PurchaseOrderItem;
import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;
import com.mini_erp.backend.purchase.domain.PurchaseOrderStatusHistory;
import com.mini_erp.backend.shared.mappers.PurchaseOrderMapper;
import com.mini_erp.backend.purchase.repository.PurchaseOrderItemRepository;
import com.mini_erp.backend.purchase.repository.PurchaseOrderRepository;
import com.mini_erp.backend.purchase.repository.PurchaseOrderStatusHistoryRepository;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderItemRequest;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderItemResponse;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderRequest;
import com.mini_erp.backend.purchase.web.dto.PurchaseOrderResponse;
import com.mini_erp.backend.purchase.web.dto.StatusHistoryResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.repository.SupplierRepository;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository orders;
    private final PurchaseOrderItemRepository items;
    private final PurchaseOrderStatusHistoryRepository statusHistory;
    private final PurchaseOrderMapper mapper;
    private final SupplierRepository suppliers;
    private final WarehouseRepository warehouses;
    private final ProductRepository products;
    private final ProductService productService;
    private final AuditService auditService;

    public PurchaseOrderService(PurchaseOrderRepository orders,
                                PurchaseOrderItemRepository items,
                                PurchaseOrderStatusHistoryRepository statusHistory,
                                PurchaseOrderMapper mapper,
                                SupplierRepository suppliers,
                                WarehouseRepository warehouses,
                                ProductRepository products,
                                ProductService productService,
                                AuditService auditService) {
        this.orders = orders;
        this.items = items;
        this.statusHistory = statusHistory;
        this.mapper = mapper;
        this.suppliers = suppliers;
        this.warehouses = warehouses;
        this.products = products;
        this.productService = productService;
        this.auditService = auditService;
    }

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> ALLOWED = Map.of(
            PurchaseOrderStatus.NEW,      Set.of(PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.ORDERED,  Set.of(PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.RECEIVED, Set.of(),
            PurchaseOrderStatus.CANCELLED, Set.of()
    );

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> list(Long supplierId, PurchaseOrderStatus status,
                                            LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return orders.search(supplierId, status, from, to, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderItemResponse> getItems(Long id) {
        if (!orders.existsById(id)) {
            throw new NotFoundException("Nie znaleziono zamówienia zakupu: " + id);
        }
        return items.findByOrderIdOrderById(id).stream()
                .map(mapper::toItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistory(Long id) {
        if (!orders.existsById(id)) {
            throw new NotFoundException("Nie znaleziono zamówienia zakupu: " + id);
        }
        return statusHistory.findByOrderIdOrderByChangedAtAsc(id).stream()
                .map(h -> new StatusHistoryResponse(
                        h.getId(), h.getFromStatus(), h.getToStatus(), h.getChangedBy(), h.getChangedAt()))
                .toList();
    }

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest req) {
        Supplier supplier = findSupplierOrThrow(req.supplierId());
        Warehouse warehouse = findWarehouseOrThrow(req.warehouseId());

        PurchaseOrder order = new PurchaseOrder();
        order.setSupplier(supplier);
        order.setWarehouse(warehouse);
        order.setStatus(PurchaseOrderStatus.NEW);
        order.setCreatedBy(currentUsername());
        order = orders.save(order);

        for (PurchaseOrderItemRequest ir : req.items()) {
            Product p = findProductOrThrow(ir.productId());
            if (!p.getWarehouse().getId().equals(warehouse.getId())) {
                throw new IllegalArgumentException(
                        "Produkt " + p.getName() + " nie należy do magazynu " + warehouse.getName());
            }
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setOrderId(order.getId());
            item.setProductId(p.getId());
            item.setSku(p.getSku());
            item.setProductName(p.getName());
            item.setPurchasePrice(p.getPurchasePrice());
            item.setVatRate(p.getVatRate());
            item.setQuantity(ir.quantity());
            items.save(item);
        }

        recomputeTotals(order);
        logStatusChange(order.getId(), null, PurchaseOrderStatus.NEW);
        auditService.log(AuditAction.CREATE, AuditEntity.PURCHASE_ORDER, order.getId(),
                "Utworzono zamówienie zakupu #" + order.getId() + " do " + supplier.getName()
                        + " (" + order.getTotalGross() + " zł)");
        return mapper.toResponse(orders.save(order));
    }

    @Transactional
    public void order(Long id) {
        PurchaseOrder o = findOrThrow(id);
        changeStatus(o, PurchaseOrderStatus.ORDERED);
    }

    @Transactional
    public void receive(Long id) {
        PurchaseOrder order = findOrThrow(id);
        requireTransition(order.getStatus(), PurchaseOrderStatus.RECEIVED);

        for (PurchaseOrderItem line : items.findByOrderIdOrderById(id)) {
            productService.receiveForOrder(
                    line.getProductId(),
                    line.getQuantity(),
                    "PURCHASE_ORDER",
                    order.getId());
        }
        PurchaseOrderStatus old = order.getStatus();
        logStatusChange(id, old, PurchaseOrderStatus.RECEIVED);
        order.setStatus(PurchaseOrderStatus.RECEIVED);
        orders.save(order);
        auditService.log(AuditAction.STATUS_CHANGE, AuditEntity.PURCHASE_ORDER, id, "Status: " + old.label() + " → " + PurchaseOrderStatus.RECEIVED.label());
    }

    @Transactional
    public void cancel(Long id) {
        PurchaseOrder o = findOrThrow(id);
        changeStatus(o, PurchaseOrderStatus.CANCELLED);
    }

    // helpers

    private void changeStatus(PurchaseOrder order, PurchaseOrderStatus target) {
        requireTransition(order.getStatus(), target);
        PurchaseOrderStatus old = order.getStatus();
        logStatusChange(order.getId(), old, target);
        order.setStatus(target);
        orders.save(order);
        auditService.log(AuditAction.STATUS_CHANGE, AuditEntity.PURCHASE_ORDER, order.getId(), "Status: " + old.label() + " → " + target.label());    }

    private void requireTransition(PurchaseOrderStatus from, PurchaseOrderStatus to) {
        if (!ALLOWED.get(from).contains(to)) {
            throw new IllegalArgumentException("Niedozwolone przejście statusu: " + from + " -> " + to);
        }
    }

    private void logStatusChange(Long orderId, PurchaseOrderStatus from, PurchaseOrderStatus to) {
        PurchaseOrderStatusHistory h = new PurchaseOrderStatusHistory();
        h.setOrderId(orderId);
        h.setFromStatus(from);
        h.setToStatus(to);
        h.setChangedBy(currentUsername());
        statusHistory.save(h);
    }

    private void recomputeTotals(PurchaseOrder order) {
        BigDecimal net = BigDecimal.ZERO;
        BigDecimal vat = BigDecimal.ZERO;
        for (PurchaseOrderItem line : items.findByOrderIdOrderById(order.getId())) {
            BigDecimal lineNet = line.getPurchasePrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            BigDecimal lineVat = lineNet.multiply(BigDecimal.valueOf(line.getVatRate().getPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            net = net.add(lineNet);
            vat = vat.add(lineVat);
        }
        order.setTotalNet(net);
        order.setTotalVat(vat);
        order.setTotalGross(net.add(vat));
    }

    private PurchaseOrder findOrThrow(Long id) {
        return orders.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono zamówienia zakupu: " + id));
    }

    private Supplier findSupplierOrThrow(Long id) {
        return suppliers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono dostawcy: " + id));
    }

    private Warehouse findWarehouseOrThrow(Long id) {
        return warehouses.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono magazynu: " + id));
    }

    private Product findProductOrThrow(Long id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono produktu: " + id));
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}