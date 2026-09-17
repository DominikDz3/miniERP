package com.mini_erp.backend.sales.service;

import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.service.ProductService;
import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderItem;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.sales.mapper.SalesOrderMapper;
import com.mini_erp.backend.sales.repository.SalesOrderItemRepository;
import com.mini_erp.backend.sales.repository.SalesOrderRepository;
import com.mini_erp.backend.sales.web.dto.SalesOrderItemRequest;
import com.mini_erp.backend.sales.web.dto.SalesOrderItemResponse;
import com.mini_erp.backend.sales.web.dto.SalesOrderRequest;
import com.mini_erp.backend.sales.web.dto.SalesOrderResponse;
import com.mini_erp.backend.shared.exception.NotFoundException;
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
public class SalesOrderService {

    private final SalesOrderRepository orders;
    private final SalesOrderItemRepository items;
    private final SalesOrderMapper mapper;
    private final CustomerRepository customers;
    private final ProductRepository products;
    private final ProductService productService;

    public SalesOrderService(SalesOrderRepository orders,
                             SalesOrderItemRepository items,
                             SalesOrderMapper mapper,
                             CustomerRepository customers,
                             ProductRepository products,
                             ProductService productService) {
        this.orders = orders;
        this.items = items;
        this.mapper = mapper;
        this.customers = customers;
        this.products = products;
        this.productService = productService;
    }

    private static final Map<SalesOrderStatus, Set<SalesOrderStatus>> ALLOWED = Map.of(
            SalesOrderStatus.NEW,        Set.of(SalesOrderStatus.CONFIRMED, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.CONFIRMED,  Set.of(SalesOrderStatus.PROCESSING, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.PROCESSING, Set.of(SalesOrderStatus.READY, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.READY,      Set.of(SalesOrderStatus.COMPLETED, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.COMPLETED,  Set.of(),
            SalesOrderStatus.CANCELLED,  Set.of()
    );

    @Transactional(readOnly = true)
    public Page<SalesOrderResponse> list(Long customerId, SalesOrderStatus status,
                                         LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return orders.search(customerId, status, from, to, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<SalesOrderItemResponse> getItems(Long id) {
        if (!orders.existsById(id)) {
            throw new NotFoundException("Nie znaleziono zamówienia: " + id);
        }
        return items.findByOrderIdOrderById(id).stream()
                .map(mapper::toItemResponse)
                .toList();
    }

    @Transactional
    public SalesOrderResponse create(SalesOrderRequest req) {
        Customer customer = findCustomerOrThrow(req.customerId());

        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setStatus(SalesOrderStatus.NEW);
        order.setCreatedBy(currentUsername());
        order = orders.save(order);

        for (SalesOrderItemRequest ir : req.items()) {
            Product p = findProductOrThrow(ir.productId());
            SalesOrderItem item = new SalesOrderItem();
            item.setOrderId(order.getId());
            item.setProductId(p.getId());
            item.setSku(p.getSku());
            item.setProductName(p.getName());
            item.setUnitPrice(p.getSalePrice());
            item.setVatRate(p.getVatRate());
            item.setQuantity(ir.quantity());
            items.save(item);
        }

        recomputeTotals(order);
        return mapper.toResponse(orders.save(order));
    }

    public void confirm(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.CONFIRMED); }

    public void process(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.PROCESSING); }

    public void ready(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.READY); }

    public void cancel(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.CANCELLED); }

    @Transactional
    public void complete(Long id) {
        SalesOrder order = findOrThrow(id);
        requireTransition(order.getStatus(), SalesOrderStatus.COMPLETED);   // najpierw walidacja, potem stan

        for (SalesOrderItem line : items.findByOrderIdOrderById(id)) {
            productService.issueForOrder(
                    line.getProductId(),
                    line.getQuantity(),
                    "SALES_ORDER",
                    order.getId());
        }
        order.setStatus(SalesOrderStatus.COMPLETED);
    }

    // helpers

    private void changeStatus(SalesOrder order, SalesOrderStatus target) {
        requireTransition(order.getStatus(), target);
        order.setStatus(target);
        orders.save(order);
    }

    private void requireTransition(SalesOrderStatus from, SalesOrderStatus to) {
        if (!ALLOWED.get(from).contains(to)) {
            throw new IllegalArgumentException("Niedozwolone przejście statusu: " + from + " -> " + to);
        }
    }

    private void recomputeTotals(SalesOrder order) {
        BigDecimal net = BigDecimal.ZERO;
        BigDecimal vat = BigDecimal.ZERO;
        for (SalesOrderItem line : items.findByOrderIdOrderById(order.getId())) {
            BigDecimal lineNet = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            BigDecimal lineVat = lineNet.multiply(line.getVatRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            net = net.add(lineNet);
            vat = vat.add(lineVat);
        }
        order.setTotalNet(net);
        order.setTotalVat(vat);
        order.setTotalGross(net.add(vat));
    }

    private SalesOrder findOrThrow(Long id) {
        return orders.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono zamówienia: " + id));
    }

    private Customer findCustomerOrThrow(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono klienta: " + id));
    }

    private Product findProductOrThrow(Long id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono produktu: " + id));
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}