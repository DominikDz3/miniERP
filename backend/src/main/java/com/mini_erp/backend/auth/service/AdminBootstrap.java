package com.mini_erp.backend.auth.service;

import com.mini_erp.backend.auth.domain.Role;
import com.mini_erp.backend.auth.domain.User;
import com.mini_erp.backend.auth.repository.RoleRepository;
import com.mini_erp.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final String username;
    private final String password;
    private final String fullName;

    public AdminBootstrap(UserRepository users, RoleRepository roles, PasswordEncoder encoder,
                          @Value("${app.admin.username:admin}") String username,
                          @Value("${app.admin.password:admin123}") String password,
                          @Value("${app.admin.full-name:Administrator}") String fullName) {

        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (users.existsByUsername(username)) return;

        Role adminRole = roles.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Brak roli ADMIN"));

        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(encoder.encode(password));
        admin.setFull_name(fullName);
        admin.setEnabled(true);
        admin.setRole(adminRole);
        users.save(admin);



    }
}
