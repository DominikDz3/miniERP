package com.mini_erp.backend.auth.service;

import com.mini_erp.backend.auth.domain.Role;
import com.mini_erp.backend.auth.domain.User;
import com.mini_erp.backend.auth.repository.RoleRepository;
import com.mini_erp.backend.auth.repository.UserRepository;
import com.mini_erp.backend.auth.web.dto.*;
import com.mini_erp.backend.shared.exception.NotFoundException;
import com.mini_erp.backend.shared.mappers.UserMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final UserMapper mapper;

    public UserService(UserRepository users, RoleRepository roles, PasswordEncoder encoder, UserMapper mapper) {
        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return users.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public UserResponse create(UserCreateRequest req) {
        String username = req.username().trim().toLowerCase();
        if (users.existsByUsername(username)) {
            throw new IllegalArgumentException("Nazwa użytkownika już istnieje: " + req.username());
        }
        Role role = findRoleOrThrow(req.roleName());

        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(req.password()));
        u.setFullName(req.fullName());
        u.setRole(role);
        u.setEnabled(true);
        return mapper.toResponse(users.save(u));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest req) {
        User u = findOrThrow(id);
        u.setFullName(req.fullName());
        u.setRole(findRoleOrThrow(req.roleName()));
        return mapper.toResponse(users.save(u));
    }

    @Transactional
    public void resetPassword(Long id, PasswordResetRequest req) {
        User u = findOrThrow(id);
        u.setPassword(encoder.encode(req.newPassword()));
        users.save(u);
    }

    @Transactional
    public void activate(Long id) {
        User u = findOrThrow(id);
        u.setEnabled(true);
        users.save(u);
    }

    @Transactional
    public void deactivate(Long id) {
        User u = findOrThrow(id);
        if (u.getUsername().equals(currentUsername())) {
            throw new IllegalArgumentException("Nie można dezaktywować własnego konta");
        }
        u.setEnabled(false);
        users.save(u);
    }

    // helpers

    private User findOrThrow(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono użytkownika: " + id));
    }

    private Role findRoleOrThrow(String name) {
        return roles.findByName(name)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono roli: " + name));
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}