package com.example.demo.controller;

import com.example.demo.entity.Admin;
import com.example.demo.entity.OfficerUpdateRequest;
import com.example.demo.payload.*;
import com.example.demo.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // -------------------- Admin Signup --------------------
    @PostMapping("/signup")
    public String signup(@RequestBody Admin admin) {
        return adminService.signup(admin);
    }

    // -------------------- Admin Login --------------------
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return adminService.login(request);
    }

    // -------------------- Create Officer --------------------
    @PostMapping("/create-officer")
    public String createOfficer(@RequestBody OfficerSignupRequest request) {
        return adminService.createOfficer(request);
    }

    // -------------------- Admin Forgot Password --------------------
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return adminService.forgotPassword(request);
    }

    // -------------------- Admin Reset Password --------------------
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        return adminService.resetPassword(request);
    }

    // -------------------- Admin Reset Officer Password --------------------
    @PostMapping("/reset-officer-password")
    public String resetOfficerPassword(@RequestBody ResetOfficerPasswordRequest request) {
        return adminService.resetOfficerPassword(request);
    }

    // -------------------- Get Admin Profile --------------------
    @GetMapping("/profile")
    public AdminProfileResponse getMyProfile(Authentication authentication) {
        Admin admin = (Admin) authentication.getPrincipal();
        return AdminProfileResponse.builder()
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }

    // -------------------- Update Admin Profile --------------------
    @PutMapping("/profile")
    public String updateMyProfile(
            @RequestBody AdminProfileUpdateRequest request,
            Authentication authentication
    ) {
        Admin admin = (Admin) authentication.getPrincipal();
        adminService.updateMyProfile(admin, request.getName());
        return "✅ Admin profile updated successfully";
    }

    // =====================================================
    // ========== OFFICER PROFILE UPDATE APPROVAL ==========
    // =====================================================

    // -------------------- GET ALL PENDING OFFICER UPDATE REQUESTS --------------------
    @GetMapping("/officer-update-requests")
    public List<OfficerUpdateRequest> getPendingOfficerUpdateRequests() {
        return adminService.getPendingOfficerProfileRequests();
    }

    // -------------------- APPROVE OFFICER UPDATE REQUEST --------------------
    @PutMapping("/officer-update-requests/{id}/approve")
    public String approveOfficerUpdate(@PathVariable Long id) {
        return adminService.approveOfficerProfileUpdate(id);
    }

    // -------------------- REJECT OFFICER UPDATE REQUEST --------------------
    @PutMapping("/officer-update-requests/{id}/reject")
    public String rejectOfficerUpdate(@PathVariable Long id, @RequestBody RejectRequestDto request) {
        return adminService.rejectOfficerProfileUpdate(id, request.getReason());
    }
}