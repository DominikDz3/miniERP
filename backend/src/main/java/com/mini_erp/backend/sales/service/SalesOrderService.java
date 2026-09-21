package com.mini_erp.backend.sales.service;

import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.catalog.service.ProductService;
import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.repository.ReceiverAddressRepository;
import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderItem;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.sales.domain.SalesOrderStatusHistory;
import com.mini_erp.backend.shared.mappers.SalesOrderMapper;
import com.mini_erp.backend.sales.repository.SalesOrderItemRepository;
import com.mini_erp.backend.sales.repository.SalesOrderRepository;
import com.mini_erp.backend.sales.repository.SalesOrderStatusHistoryRepository;
import com.mini_erp.backend.sales.web.dto.*;
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
    private final ReceiverAddressRepository receiverAddresses;
    private final SalesOrderStatusHistoryRepository statusHistory;

    public SalesOrderService(SalesOrderRepository orders,
                             SalesOrderItemRepository items,
                             SalesOrderMapper mapper,
                             CustomerRepository customers,
                             ProductRepository products,
                             ProductService productService,
                             ReceiverAddressRepository receiverAddresses,
                             SalesOrderStatusHistoryRepository statusHistory) {
        this.orders = orders;
        this.items = items;
        this.mapper = mapper;
        this.customers = customers;
        this.products = products;
        this.productService = productService;
        this.receiverAddresses = receiverAddresses;
        this.statusHistory = statusHistory;
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
        return orders.search(customerId, status, from, to, pageable).map(o -> mapper.toResponse(o, formatAddress(o.getReceiverAddressId())));
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse get(Long id) {
        SalesOrder order = findOrThrow(id);
        return mapper.toResponse(order, formatAddress(order.getReceiverAddressId()));
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

        ReceiverAddress address = receiverAddresses.findById(req.receiverAddressId())
                .orElseThrow(() -> new NotFoundException("Nie znaleziono adresu: " + req.receiverAddressId()));
        if (!address.getCustomerId().equals(customer.getId())) {
            throw new IllegalArgumentException("Adres nie należy do wskazanego klienta");
        }

        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setReceiverAddressId(address.getId());
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
        orders.save(order);
        logStatusChange(order.getId(), null, SalesOrderStatus.NEW);
        return mapper.toResponse(order, formatAddress(order.getReceiverAddressId()));
    }

    @Transactional
    public void confirm(Long id) {
        SalesOrder order = findOrThrow(id);
        requireTransition(order.getStatus(), SalesOrderStatus.CONFIRMED);
        for (SalesOrderItem line : items.findByOrderIdOrderById(id)) {
            Product p = findProductOrThrow(line.getProductId());
            if (p.getStock() < line.getQuantity()) {
                throw new IllegalArgumentException(
                        "Za mało towaru: " + p.getName() + ". Dostępne " + p.getStock() + ", zamówiono " + line.getQuantity());
            }
        }
        logStatusChange(id, order.getStatus(), SalesOrderStatus.CONFIRMED);
        order.setStatus(SalesOrderStatus.CONFIRMED);
        orders.save(order);
    }

    @Transactional
    public void process(Long id) {
        SalesOrder order = findOrThrow(id);
        requireTransition(order.getStatus(), SalesOrderStatus.PROCESSING);
        for (SalesOrderItem line : items.findByOrderIdOrderById(id)) {
            productService.issueForOrder(line.getProductId(), line.getQuantity(),
                    "SALES_ORDER", order.getId());
        }
        logStatusChange(id, order.getStatus(), SalesOrderStatus.PROCESSING);
        order.setStatus(SalesOrderStatus.PROCESSING);
        orders.save(order);
    }

    public void ready(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.READY); }

    @Transactional
    public void cancel(Long id) {
        SalesOrder order = findOrThrow(id);
        requireTransition(order.getStatus(), SalesOrderStatus.CANCELLED);
        if (order.getStatus() == SalesOrderStatus.PROCESSING
                || order.getStatus() == SalesOrderStatus.READY) {
            for (SalesOrderItem line : items.findByOrderIdOrderById(id)) {
                productService.returnForOrder(line.getProductId(), line.getQuantity(),
                        "SALES_ORDER", order.getId());
            }
        }
        logStatusChange(id, order.getStatus(), SalesOrderStatus.CANCELLED);
        order.setStatus(SalesOrderStatus.CANCELLED);
        orders.save(order);
    }

    @Transactional
    public void complete(Long id) { changeStatus(findOrThrow(id), SalesOrderStatus.COMPLETED); }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistory(Long id) {
        if (!orders.existsById(id)) {
            throw new NotFoundException("Nie znaleziono zamówienia: " + id);
        }
        return statusHistory.findByOrderIdOrderByChangedAtAsc(id).stream()
                .map(h -> new StatusHistoryResponse(
                        h.getId(), h.getFromStatus(), h.getToStatus(), h.getChangedBy(), h.getChangedAt()))
                .toList();
    }

    // helpers

    private void changeStatus(SalesOrder order, SalesOrderStatus target) {
        requireTransition(order.getStatus(), target);
        logStatusChange(order.getId(), order.getStatus(), target);
        order.setStatus(target);
        orders.save(order);
    }

    private void requireTransition(SalesOrderStatus from, SalesOrderStatus to) {
        if (!ALLOWED.get(from).contains(to)) {
            throw new IllegalArgumentException("Niedozwolone przejście statusu: " + from + " -> " + to);
        }
    }

    private String formatAddress(Long addressId) {
        return receiverAddresses.findById(addressId)
                .map(a -> a.getStreet() + ", " + a.getPostalCode() + " " + a.getCity())
                .orElse("-");
    }

    private void recomputeTotals(SalesOrder order) {
        BigDecimal net = BigDecimal.ZERO;
        BigDecimal vat = BigDecimal.ZERO;
        for (SalesOrderItem line : items.findByOrderIdOrderById(order.getId())) {
            BigDecimal lineNet = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            BigDecimal lineVat = lineNet.multiply(BigDecimal.valueOf(line.getVatRate().getPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            net = net.add(lineNet);
            vat = vat.add(lineVat);
        }
        order.setTotalNet(net);
        order.setTotalVat(vat);
        order.setTotalGross(net.add(vat));
    }

    private void logStatusChange(Long orderId, SalesOrderStatus from, SalesOrderStatus to) {
        SalesOrderStatusHistory h = new SalesOrderStatusHistory();
        h.setOrderId(orderId);
        h.setFromStatus(from);   // null przy utworzeniu
        h.setToStatus(to);
        h.setChangedBy(currentUsername());
        statusHistory.save(h);
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