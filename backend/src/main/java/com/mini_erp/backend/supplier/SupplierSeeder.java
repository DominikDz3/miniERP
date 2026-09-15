package com.mini_erp.backend.supplier;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.supplier.domain.Supplier;
import com.mini_erp.backend.supplier.repository.SupplierRepository;
import net.datafaker.Faker;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@Profile("dev")                 // runs only under the dev profile
@Order(3)                       // after AdminBootstrap (roles/users must exist first)
public class SupplierSeeder implements ApplicationRunner {

    private static final int COUNT = 50;

    private final SupplierRepository supplier;

    public SupplierSeeder(SupplierRepository supplier) {
        this.supplier = supplier;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (supplier.count() > 0) return;

        Faker faker = new Faker(new Locale("pl"));

        for (int i = 0; i < COUNT; i++) {
            Supplier s = new Supplier();
            s.setName(faker.company().name());
            s.setNip(faker.number().digits(10));
            s.setCity(faker.address().city());
            s.setStreet(faker.address().streetAddress());
            s.setPostalCode(faker.address().zipCode());
            s.setEmail(faker.internet().emailAddress());
            s.setPhone(faker.phoneNumber().subscriberNumber(9));
            s.setCountry("Polska");
            s.setActive(faker.bool().bool());
            s = supplier.save(s);
        }
    }
}