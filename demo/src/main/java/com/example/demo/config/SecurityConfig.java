package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // ---------------- PASSWORD ENCODER ----------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ---------------- AUTH MANAGER ----------------
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // ---------------- SECURITY FILTER CHAIN ----------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // Disable CSRF for REST APIs
           .csrf(csrf -> csrf.disable())
           // ✅ Enable CORS
           .cors(cors -> {})

           // .cors(cors -> cors) // just enable it; Spring will use the CorsConfigurationSource bean


            // Allow H2 Console
            .headers(headers -> headers.frameOptions().disable())

            // Stateless session (JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ---------------- AUTHORIZATION ----------------
            .authorizeHttpRequests(auth -> auth

                // ---------- PUBLIC ----------
                .requestMatchers("/h2-console/**").permitAll()

                .requestMatchers(
                    "/api/admin/signup",
                    "/api/admin/login",
                    "/api/admin/forgot-password",
                    "/api/admin/reset-password"
                ).permitAll()

                .requestMatchers("/api/officer/login").permitAll()
                .requestMatchers("/officer/set-password/**").permitAll()

                .requestMatchers(
                    "/api/citizen/signup",
                    "/api/citizen/login",
                    "/api/citizen/forgot-password",
                    "/api/citizen/reset-password",
                    "/error"
                ).permitAll()

                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()


                // ---------- 🔥 SPECIFIC FIRST (VERY IMPORTANT) ----------
                .requestMatchers("/api/admin/officers/workload-summary").hasRole("ADMIN")

                .requestMatchers("/api/officer/workload").hasAnyRole("OFFICER", "ADMIN")

                // ---------- ROLE BASED ----------
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/officer/**").hasRole("OFFICER")
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")

                // ---------- ANY OTHER ----------
                .anyRequest().authenticated()
            )

            // JWT Filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
