package com.mini_erp.backend.sales;

import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.repository.ReceiverAddressRepository;
import com.mini_erp.backend.sales.domain.SalesOrder;
import com.mini_erp.backend.sales.domain.SalesOrderItem;
import com.mini_erp.backend.sales.domain.SalesOrderStatus;
import com.mini_erp.backend.sales.repository.SalesOrderItemRepository;
import com.mini_erp.backend.sales.repository.SalesOrderRepository;
import net.datafaker.Faker;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
@Profile("dev")
@Order(5)
public class SalesOrderSeeder implements ApplicationRunner {

    private static final int ORDER_COUNT = 15;

    private final SalesOrderRepository orders;
    private final SalesOrderItemRepository items;
    private final CustomerRepository customers;
    private final ProductRepository products;
    private final ReceiverAddressRepository receiverAddresses;

    public SalesOrderSeeder(SalesOrderRepository orders,
                            SalesOrderItemRepository items,
                            CustomerRepository customers,
                            ProductRepository products,
                            ReceiverAddressRepository receiverAddresses) {
        this.orders = orders;
        this.items = items;
        this.customers = customers;
        this.products = products;
        this.receiverAddresses = receiverAddresses;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (orders.count() > 0) return;

        List<Customer> allCustomers = customers.findAll();
        List<Product> allProducts = products.findAll();
        if (allCustomers.isEmpty() || allProducts.isEmpty()) return;

        Faker faker = new Faker(new Locale("pl"));

        for (int i = 0; i < ORDER_COUNT; i++) {
            Customer customer = allCustomers.get(faker.number().numberBetween(0, allCustomers.size()));

            List<ReceiverAddress> addrs = receiverAddresses.findByCustomerIdOrderById(customer.getId());
            if (addrs.isEmpty()) continue;
            ReceiverAddress addr = addrs.get(faker.number().numberBetween(0, addrs.size()));

            SalesOrder order = new SalesOrder();
            order.setCustomer(customer);
            order.setReceiverAddressId(addr.getId());
            order.setStatus(i % 2 == 0 ? SalesOrderStatus.NEW : SalesOrderStatus.CONFIRMED);
            order.setCreatedBy("seeder");
            order = orders.save(order);

            int lineCount = faker.number().numberBetween(1, 5);
            BigDecimal net = BigDecimal.ZERO;
            BigDecimal vat = BigDecimal.ZERO;

            Set<Long> usedProducts = new HashSet<>();

            for (int j = 0; j < lineCount; j++) {
                Product p = allProducts.get(faker.number().numberBetween(0, allProducts.size()));
                if (!usedProducts.add(p.getId())) {
                    continue;
                }

                int quantity = faker.number().numberBetween(1, 11);

                SalesOrderItem item = new SalesOrderItem();
                item.setOrderId(order.getId());
                item.setProductId(p.getId());
                item.setSku(p.getSku());
                item.setProductName(p.getName());
                item.setUnitPrice(p.getSalePrice());
                item.setVatRate(p.getVatRate());
                item.setQuantity(quantity);
                items.save(item);

                BigDecimal lineNet = p.getSalePrice().multiply(BigDecimal.valueOf(quantity));
                BigDecimal lineVat = lineNet.multiply(BigDecimal.valueOf(p.getVatRate().getPercent()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                net = net.add(lineNet);
                vat = vat.add(lineVat);
            }

            order.setTotalNet(net);
            order.setTotalVat(vat);
            order.setTotalGross(net.add(vat));
            orders.save(order);
        }
    }
}