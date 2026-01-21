package com.example.demo.controller;

import com.example.demo.entity.Citizen;
import com.example.demo.entity.Complaint;
import com.example.demo.payload.*;
import com.example.demo.repositories.CitizenRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.CitizenService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
@CrossOrigin
public class CitizenController {

    private final CitizenService citizenService;
    private final CitizenRepository citizenRepository;
    private final JwtUtils jwtUtils;

    // ================== HELPER ==================
    private Citizen getCitizenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtils.extractEmail(token);

        Citizen citizen = citizenRepository.findByEmail(email);
        if (citizen == null) {
            throw new RuntimeException("Citizen not found");
        }
        return citizen;
    }

    // ================== AUTH ==================
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody CitizenSignupRequest request) {
        return ResponseEntity.ok(citizenService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<CitizenLoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(citizenService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(citizenService.forgotPassword(request.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(
                citizenService.resetPassword(
                        request.getEmail(),
                        request.getResetToken(),
                        request.getNewPassword()
                )
        );
    }

    // ================== COMPLAINTS ==================

    @GetMapping("/complaints/my")
    public ResponseEntity<List<CitizenComplaintResponse>> getMyComplaints(HttpServletRequest request) {
        Citizen citizen = getCitizenFromRequest(request);
        return ResponseEntity.ok(
                citizenService.getMyComplaints(citizen.getId())
        );
    }

    @GetMapping("/complaints/deleted")
    public ResponseEntity<List<CitizenComplaintResponse>> getDeletedComplaints(HttpServletRequest request) {
        Citizen citizen = getCitizenFromRequest(request);

        List<CitizenComplaintResponse> deleted =
                citizenService.getMyComplaints(citizen.getId())
                        .stream()
                        .filter(CitizenComplaintResponse::isDeleted)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<CitizenComplaintResponse> getComplaintDetails(
            @PathVariable Long complaintId,
            HttpServletRequest request
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        return ResponseEntity.ok(
                citizenService.getComplaintDetails(citizen.getId(), complaintId)
        );
    }

    @PostMapping("/complaints")
    public ResponseEntity<CitizenComplaintResponse> submitComplaint(
            @RequestBody Complaint complaint,
            HttpServletRequest request
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        return new ResponseEntity<>(
                citizenService.submitComplaint(citizen.getId(), complaint),
                HttpStatus.CREATED
        );
    }

    // ================== REPLY TO COMPLAINT ==================
    @PostMapping("/complaints/{complaintId}/reply")
    public ResponseEntity<String> replyToComplaint(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        Citizen citizen = getCitizenFromRequest(request);

        String message = body.get("message");
        return ResponseEntity.ok(
                citizenService.replyToComplaint(
                        citizen.getId(),
                        complaintId,
                        message
                )
        );
    }

    // ================== PROFILE ==================
    @GetMapping("/profile")
    public CitizenProfileResponse getMyProfile(HttpServletRequest request) {
        Citizen citizen = getCitizenFromRequest(request);

        return CitizenProfileResponse.builder()
                .name(citizen.getName())
                .email(citizen.getEmail())
                .phoneNo(citizen.getPhoneNo())
                .address(citizen.getAddress())
                .age(citizen.getAge())
                .build();
    }

    // ================== UPDATE PROFILE ==================
    @PutMapping("/profile")
    public CitizenProfileResponse updateMyProfile(
            HttpServletRequest request,
            @RequestBody CitizenProfileUpdateRequest updateRequest
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        return citizenService.updateMyProfile(citizen, updateRequest);
    }
}
