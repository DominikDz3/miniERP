package com.mini_erp.backend.auth.web;

import com.mini_erp.backend.audit.domain.AuditAction;
import com.mini_erp.backend.audit.service.AuditService;
import com.mini_erp.backend.auth.service.JwtService;
import com.mini_erp.backend.auth.web.dto.LoginResponse;
import com.mini_erp.backend.auth.web.dto.LoginRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authManager, JwtService jwtService, UserDetailsService userDetailsService, AuditService auditService) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String username = request.username().trim().toLowerCase();
        try {
            var authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
            var user = (UserDetails) authentication.getPrincipal();

            auditService.log(AuditAction.LOGIN_SUCCESS, null, null, "Zalogowano: " + username, username);
            response.addCookie(refreshCookie(jwtService.generateRefreshToken(user), REFRESH_MAX_AGE));
            return new LoginResponse(jwtService.generateToken(user));
        } catch (AuthenticationException e) {
            auditService.log(AuditAction.LOGIN_FAILED, null, null, "Nieudane logowanie: " + username);
            throw e;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest request) {
        String refresh = readRefreshCookie(request);
        if (refresh == null || !jwtService.isValid(refresh) || !jwtService.isRefreshToken(refresh)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDetails user = userDetailsService.loadUserByUsername(jwtService.extractUsername(refresh));
        return ResponseEntity.ok(new LoginResponse(jwtService.generateToken(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addCookie(refreshCookie("", 0));
        return ResponseEntity.noContent().build();
    }

    // helpers

    private Cookie refreshCookie(String value, int maxAge) {
        Cookie c = new Cookie(REFRESH_COOKIE, value);
        c.setHttpOnly(true);
        c.setPath("/api/auth");
        c.setMaxAge(maxAge);
        return c;
    }

    private String readRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (REFRESH_COOKIE.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
