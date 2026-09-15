package com.mini_erp.backend.warehouse;

import com.mini_erp.backend.warehouse.domain.Warehouse;
import com.mini_erp.backend.warehouse.repository.WarehouseRepository;
import net.datafaker.Faker;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
@Profile("dev")
@Order(2)
public class WarehouseSeeder implements ApplicationRunner {

    private static final List<String> NAMES =
            List.of("Magazyn Główny", "Magazyn Rzeszów", "Magazyn Kraków", "Magazyn Warszawa");

    private final WarehouseRepository warehouses;

    public WarehouseSeeder(WarehouseRepository warehouses) {
        this.warehouses = warehouses;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (warehouses.count() > 0) return;

        Faker faker = new Faker(new Locale("pl"));

        for (String name : NAMES) {
            Warehouse w = new Warehouse();
            w.setName(name);
            w.setPhone(faker.numerify("### ### ###"));
            w.setStreet(faker.address().streetName() + " " + faker.number().numberBetween(1, 200));
            w.setCity(faker.address().city());
            w.setPostalCode(faker.numerify("##-###"));
            w.setCountry("Polska");
            w.setActive(true);
            warehouses.save(w);
        }
    }
}