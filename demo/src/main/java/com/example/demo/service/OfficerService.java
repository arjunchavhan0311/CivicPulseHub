package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.payload.*;
import com.example.demo.repositories.OfficerRepository;
import com.example.demo.repositories.OfficerUpdateRequestRepository;
import com.example.demo.security.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OfficerService {

    @Autowired
    private OfficerRepository officerRepository;

    @Autowired
    private OfficerUpdateRequestRepository updateRequestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    // ================= OFFICER LOGIN =================
    public LoginResponse login(LoginRequest request) {
        Officer officer = officerRepository.findByEmail(request.getEmail());

        if (officer == null || !passwordEncoder.matches(request.getPassword(), officer.getPassword())) {
            return new LoginResponse("❌ Invalid email or password", null, null);
        }

        String token = jwtUtils.generateToken(
                officer.getEmail(),
                officer.getRole().name()
        );

        return new LoginResponse(
                "✅ Officer login successful",
                token,
                officer.getRole().name()
        );
    }

    // ================= REQUEST PROFILE UPDATE =================
    public String requestProfileUpdate(
            Officer officer,
            OfficerProfileUpdateRequest request
    ) {
        try {
            String jsonData = objectMapper.writeValueAsString(request);

            OfficerUpdateRequest updateRequest =
                    OfficerUpdateRequest.builder()
                            .officer(officer)
                            .requestedData(jsonData)
                            .status(RequestStatus.PENDING)
                            .requestedAt(LocalDateTime.now())
                            .build();

            updateRequestRepository.save(updateRequest);

            return "✅ Profile update request sent for admin approval";

        } catch (Exception e) {
            throw new RuntimeException("Failed to submit update request");
        }
    }
}