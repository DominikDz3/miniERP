package com.mini_erp.backend.catalog;

import com.mini_erp.backend.catalog.domain.Category;
import com.mini_erp.backend.catalog.domain.Product;
import com.mini_erp.backend.catalog.repository.CategoryRepository;
import com.mini_erp.backend.catalog.repository.ProductRepository;
import net.datafaker.Faker;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Component
@Profile("dev")
@Order(3)
public class CatalogSeeder implements ApplicationRunner {

    private static final int COUNT = 50;

    private static final List<String> CATEGORY_NAMES =
            List.of("Elektronika", "Narzędzia", "Chemia", "Biuro", "AGD");

    private final ProductRepository products;
    private final CategoryRepository categories;

    public CatalogSeeder(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (products.count() > 0) return;

        Faker faker = new Faker(new Locale("pl"));

        if (categories.count() == 0) {
            for (String name : CATEGORY_NAMES) {
                Category c = new Category();
                c.setName(name);
                c.setActive(true);
                categories.save(c);
            }
        }

        List<Category> allCategories = categories.findAll();

        for (int i = 0; i < COUNT; i++) {
            BigDecimal purchasePrice = BigDecimal
                    .valueOf(faker.number().randomDouble(2, 5, 500))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal salePrice = purchasePrice
                    .multiply(BigDecimal.valueOf(1.3))
                    .setScale(2, RoundingMode.HALF_UP);

            Category category = allCategories.get(faker.number().numberBetween(0, allCategories.size()));

            Product p = new Product();
            p.setSku("SKU-" + String.format("%04d", i + 1));
            p.setName(faker.commerce().productName());
            p.setDescription(faker.lorem().sentence());
            p.setCategory(category);
            p.setPurchasePrice(purchasePrice);
            p.setSalePrice(salePrice);
            p.setVatRate(new BigDecimal("23.00"));
            p.setUnit("szt");
            p.setStock(faker.number().numberBetween(0, 200));
            p.setMinStock(faker.number().numberBetween(0, 20));
            p.setActive(faker.bool().bool());
            products.save(p);
        }
    }
}