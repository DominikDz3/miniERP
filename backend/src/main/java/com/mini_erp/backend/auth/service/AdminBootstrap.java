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
        // configurable admin from env/config
        createIfMissing(username, password, fullName, "ADMIN");

        // seed accounts for testing role-based access on the frontend
        createIfMissing("manager", "manager123", "Manager Testowy", "MANAGER");
        createIfMissing("user", "user123", "User Testowy", "USER");
    }

    private void createIfMissing(String username, String rawPassword, String fullName, String roleName) {
        if (users.existsByUsername(username)) return;

        Role role = roles.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(
                        "Brak roli " + roleName));

        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(rawPassword));
        user.setFull_name(fullName);
        user.setEnabled(true);
        user.setRole(role);
        users.save(user);
    }
}
