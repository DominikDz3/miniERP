package com.mini_erp.backend.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Service
public class JwtService
{
    private final SecretKey key;
    private final long accessMs;
    private final long refreshMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-ms}") long accessMs,
                      @Value("${app.jwt.refresh-ms}") long refreshMs
                      ) {

        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessMs = accessMs;
        this.refreshMs = refreshMs;
    }

    public String generateToken(UserDetails user) {
        List<String> authorities = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("authorities", authorities)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessMs))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(UserDetails user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshMs))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(parse(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    private io.jsonwebtoken.Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public List<String> extractAuthorities(String token) {
        Object claim = parse(token).get("authorities");
        if (claim instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }
}
