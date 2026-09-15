package com.mini_erp.backend.customer;

import com.mini_erp.backend.customer.domain.Customer;
import com.mini_erp.backend.customer.domain.PayerAddress;
import com.mini_erp.backend.customer.domain.ReceiverAddress;
import com.mini_erp.backend.customer.repository.CustomerRepository;
import com.mini_erp.backend.customer.repository.PayerAddressRepository;
import com.mini_erp.backend.customer.repository.ReceiverAddressRepository;
import net.datafaker.Faker;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Componentgit ad
@Profile("dev")                 // runs only under the dev profile
@Order(3)                       // after AdminBootstrap (roles/users must exist first)
public class CustomerSeeder implements ApplicationRunner {

    private static final int COUNT = 50;

    private final CustomerRepository customers;
    private final PayerAddressRepository payers;
    private final ReceiverAddressRepository receivers;

    public CustomerSeeder(CustomerRepository customers,
                          PayerAddressRepository payers,
                          ReceiverAddressRepository receivers) {
        this.customers = customers;
        this.payers = payers;
        this.receivers = receivers;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (customers.count() > 0) return;

        Faker faker = new Faker(new Locale("pl"));

        for (int i = 0; i < COUNT; i++) {
            Customer c = new Customer();
            c.setName(faker.company().name());
            c.setNip(faker.number().digits(10));
            c.setEmail(faker.internet().emailAddress());
            c.setActive(faker.bool().bool());        // mix of active/inactive to test the filter
            c = customers.save(c);

            PayerAddress p = new PayerAddress();
            p.setCustomerId(c.getId());
            p.setStreet(faker.address().streetAddress());
            p.setCity(faker.address().city());
            p.setPostalCode(faker.address().zipCode());
            p.setCountry("Polska");
            p = payers.save(p);

            ReceiverAddress r = new ReceiverAddress();
            r.setCustomerId(c.getId());
            r.setStreet(faker.address().streetAddress());
            r.setCity(faker.address().city());
            r.setPostalCode(faker.address().zipCode());
            r.setCountry("Polska");
            r.setPhone(faker.phoneNumber().subscriberNumber(9));
            r = receivers.save(r);

            ReceiverAddress r2 = new ReceiverAddress();
            r2.setCustomerId(c.getId());
            r2.setStreet(faker.address().streetAddress());
            r2.setCity(faker.address().city());
            r2.setPostalCode(faker.address().zipCode());
            r2.setCountry("Polska");
            r2.setPhone(faker.phoneNumber().subscriberNumber(9));
            r2 = receivers.save(r2);

            c.setDefaultPayerId(p.getId());
            c.setDefaultReceiverId(r.getId());
            customers.save(c);
        }
    }
}