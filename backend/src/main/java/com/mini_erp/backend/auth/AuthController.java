package com.mini_erp.backend.auth;

import com.mini_erp.backend.auth.dto.LoginResponse;
import com.mini_erp.backend.auth.dto.LoginRequest;
import jakarta.validation.Valid;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authManager, JwtService jwtService) {
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        var user = (UserDetails) authentication.getPrincipal();
        return new LoginResponse(jwtService.generateToken(user));
    }




}
