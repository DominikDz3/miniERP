package com.mini_erp.backend.purchase;

import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import com.mini_erp.backend.purchase.domain.PurchaseOrder;
import com.mini_erp.backend.purchase.domain.PurchaseOrderItem;
import com.mini_erp.backend.purchase.domain.PurchaseOrderStatus;
import com.mini_erp.backend.purchase.repository.PurchaseOrderItemRepository;
import com.mini_erp.backend.purchase.repository.PurchaseOrderRepository;
import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.repository.SupplierRepository;
import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
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
@Order(6)
public class PurchaseOrderSeeder implements ApplicationRunner {

    private static final int ORDER_COUNT = 30;

    private final PurchaseOrderRepository orders;
    private final PurchaseOrderItemRepository items;
    private final SupplierRepository suppliers;
    private final WarehouseRepository warehouses;
    private final ProductRepository products;

    public PurchaseOrderSeeder(PurchaseOrderRepository orders,
                               PurchaseOrderItemRepository items,
                               SupplierRepository suppliers,
                               WarehouseRepository warehouses,
                               ProductRepository products) {
        this.orders = orders;
        this.items = items;
        this.suppliers = suppliers;
        this.warehouses = warehouses;
        this.products = products;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (orders.count() > 0) return;

        List<Supplier> allSuppliers = suppliers.findAll();
        List<Warehouse> allWarehouses = warehouses.findAll();
        if (allSuppliers.isEmpty() || allWarehouses.isEmpty()) return;

        Faker faker = new Faker(new Locale("pl"));

        for (int i = 0; i < ORDER_COUNT; i++) {
            Supplier supplier = allSuppliers.get(faker.number().numberBetween(0, allSuppliers.size()));
            Warehouse warehouse = allWarehouses.get(faker.number().numberBetween(0, allWarehouses.size()));

            List<Product> whProducts = products.findByWarehouseId(warehouse.getId());
            if (whProducts.isEmpty()) continue;

            PurchaseOrder order = new PurchaseOrder();
            order.setSupplier(supplier);
            order.setWarehouse(warehouse);
            order.setStatus(i % 2 == 0 ? PurchaseOrderStatus.NEW : PurchaseOrderStatus.ORDERED);
            order.setCreatedBy("seeder");
            order = orders.save(order);

            int lineCount = faker.number().numberBetween(1, 5);
            BigDecimal net = BigDecimal.ZERO;
            BigDecimal vat = BigDecimal.ZERO;
            Set<Long> usedProducts = new HashSet<>();

            for (int j = 0; j < lineCount; j++) {
                Product p = whProducts.get(faker.number().numberBetween(0, whProducts.size()));
                if (!usedProducts.add(p.getId())) {
                    continue;
                }

                int quantity = faker.number().numberBetween(5, 51);

                PurchaseOrderItem item = new PurchaseOrderItem();
                item.setOrderId(order.getId());
                item.setProductId(p.getId());
                item.setSku(p.getSku());
                item.setProductName(p.getName());
                item.setPurchasePrice(p.getPurchasePrice());
                item.setVatRate(p.getVatRate());
                item.setQuantity(quantity);
                items.save(item);

                BigDecimal lineNet = p.getPurchasePrice().multiply(BigDecimal.valueOf(quantity));
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