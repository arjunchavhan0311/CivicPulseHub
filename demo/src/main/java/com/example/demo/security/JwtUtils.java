package com.example.demo.security;

import com.example.demo.entity.Citizen;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // Secret key must be at least 32 characters for HS256
    private final String SECRET = "MY_SUPER_SECRET_KEY_12345678901234567890";

    // ------------------ Get signing key ------------------
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // ------------------ GENERATE TOKEN WITH EMAIL + ROLE ------------------
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // include role
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiry
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ------------------ OVERLOADED METHOD: GENERATE TOKEN FROM CITIZEN ------------------
    public String generateToken(Citizen citizen) {
        return generateToken(citizen.getEmail(), citizen.getRole().name());
    }

    // ------------------ EXTRACT EMAIL ------------------
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ------------------ EXTRACT ROLE ------------------
    public String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }

    // ------------------ VALIDATE TOKEN ------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true; // valid token
        } catch (JwtException e) {
            // token is invalid (expired, malformed, signature invalid, etc.)
            return false;
        }
    }
}
