package com.example.demo.service;

import com.example.demo.entity.Admin;
import com.example.demo.entity.Officer;
import com.example.demo.entity.OfficerUpdateRequest;
import com.example.demo.entity.RequestStatus;
import com.example.demo.entity.Role;
import com.example.demo.entity.ComplaintCategory;
import com.example.demo.payload.*;
import com.example.demo.repositories.AdminRepository;
import com.example.demo.repositories.OfficerRepository;
import com.example.demo.repositories.OfficerUpdateRequestRepository;
import com.example.demo.security.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.mail.MessagingException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;




@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OfficerRepository officerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;
    
    
    @Autowired
    private OfficerUpdateRequestRepository officerUpdateRequestRepository;

    @Autowired
    private ObjectMapper objectMapper;


    // -------------------- Admin Signup --------------------
    public String signup(Admin admin) {

        if (adminRepository.findByEmail(admin.getEmail()) != null) {
            return "❌ Admin email already exists!";
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ADMIN);
        adminRepository.save(admin);

        return "✅ Admin registered successfully!";
    }

    // -------------------- Admin Login --------------------
    public LoginResponse login(LoginRequest request) {

        Admin admin = adminRepository.findByEmail(request.getEmail());

        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            return new LoginResponse("❌ Invalid email or password", null, null);
        }

        String token = jwtUtils.generateToken(admin.getEmail(), admin.getRole().name());
        return new LoginResponse("✅ Login successful", token, admin.getRole().name());
    }

    // -------------------- Create Officer --------------------
    public String createOfficer(OfficerSignupRequest request) {

        if (officerRepository.findByEmail(request.getEmail()) != null) {
            return "❌ Officer email already exists!";
        }

        ComplaintCategory department;
        try {
            department = ComplaintCategory.valueOf(request.getDepartment().toUpperCase());
        } catch (IllegalArgumentException e) {
            return "❌ Invalid department value!";
        }

        Officer officer = Officer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNo(request.getPhoneNo())
                .department(department)
                .address(request.getAddress())      
                .age(request.getAge())      
                .role(Role.OFFICER)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        officerRepository.save(officer);

        try {
            emailService.sendCredentialsEmail(
                    request.getEmail(),
                    request.getPassword(),
                    "Officer"
            );
        } catch (MessagingException e) {
            e.printStackTrace();
            return "⚠ Officer created but email sending failed!";
        }

        return "✅ Officer created successfully! Email sent with login credentials.";
    }

    // -------------------- Admin Forgot Password --------------------
    public String forgotPassword(ForgotPasswordRequest request) {

        Admin admin = adminRepository.findByEmail(request.getEmail());
        if (admin == null) return "❌ Admin not found!";

        String otp = String.format("%06d", (int) (Math.random() * 900000 + 100000));

        admin.setResetToken(otp);
        admin.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        adminRepository.save(admin);

        try {
            emailService.sendOtpEmail(admin.getEmail(), otp);
        } catch (MessagingException e) {
            e.printStackTrace();
            return "❌ Failed to send OTP email!";
        }

        return "✅ OTP sent to your registered email!";
    }

    // -------------------- Reset Admin Password --------------------
    public String resetPassword(ResetPasswordRequest request) {

        Admin admin = adminRepository.findByEmail(request.getEmail());
        if (admin == null) return "❌ Admin not found!";

        if (admin.getResetToken() == null ||
            !admin.getResetToken().equals(request.getResetToken())) {
            return "❌ Invalid OTP!";
        }

        if (admin.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            return "⏳ OTP expired!";
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        admin.setResetToken(null);
        admin.setResetTokenExpiry(null);
        adminRepository.save(admin);

        return "✅ Admin password reset successful!";
    }

    // -------------------- Reset Officer Password --------------------
    public String resetOfficerPassword(ResetOfficerPasswordRequest request) {

        Officer officer = officerRepository.findByEmail(request.getOfficerEmail());
        if (officer == null) return "❌ Officer not found!";

        officer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        officerRepository.save(officer);

        return "✅ Officer password reset successfully!";
    }

    // =====================================================
    // ================= ADMIN PROFILE LOGIC =================
    // =====================================================

    // -------------------- Get Admin Profile --------------------
    public AdminProfileResponse getMyProfile(Admin admin) {

        return AdminProfileResponse.builder()
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }

    // -------------------- Get Admin By Email --------------------
    public Admin getAdminByEmail(String email) {

        Admin admin = adminRepository.findByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        return admin;
    }

    // -------------------- Update Admin Profile --------------------
    public void updateMyProfile(Admin admin, String newName) {

        if (newName != null && !newName.trim().isEmpty()) {
            admin.setName(newName.trim());
        }

        adminRepository.save(admin);
    }
    
 // =====================================================
 // ========== OFFICER PROFILE UPDATE APPROVAL ==========
 // =====================================================

 // -------------------- View Pending Requests --------------------
 public List<OfficerUpdateRequest> getPendingOfficerProfileRequests() {
     return officerUpdateRequestRepository.findByStatus(RequestStatus.PENDING);
 }

 // -------------------- Approve Officer Profile Update --------------------
 public String approveOfficerProfileUpdate(Long requestId) {

     OfficerUpdateRequest request =
             officerUpdateRequestRepository.findById(requestId)
                     .orElseThrow(() -> new RuntimeException("Update request not found"));

     Officer officer = request.getOfficer();

     try {
         OfficerProfileUpdateRequest updateData =
                 objectMapper.readValue(
                         request.getRequestedData(),
                         OfficerProfileUpdateRequest.class
                 );

         if (updateData.getName() != null)
             officer.setName(updateData.getName());

         if (updateData.getPhoneNo() != null)
             officer.setPhoneNo(updateData.getPhoneNo());

         if (updateData.getAddress() != null)
             officer.setAddress(updateData.getAddress());

         if (updateData.getAge() > 0)
             officer.setAge(updateData.getAge());

         officerRepository.save(officer);

         request.setStatus(RequestStatus.APPROVED);
         request.setReviewedAt(LocalDateTime.now());
         officerUpdateRequestRepository.save(request);

         return "✅ Officer profile update approved successfully";

     } catch (Exception e) {
         throw new RuntimeException("Failed to approve profile update");
     }
 }

 // -------------------- Reject Officer Profile Update --------------------
 public String rejectOfficerProfileUpdate(Long requestId, String reason) {

     OfficerUpdateRequest request =
             officerUpdateRequestRepository.findById(requestId)
                     .orElseThrow(() -> new RuntimeException("Update request not found"));

     request.setStatus(RequestStatus.REJECTED);
     request.setRejectionReason(reason);
     request.setReviewedAt(LocalDateTime.now());

     officerUpdateRequestRepository.save(request);

     return "❌ Officer profile update rejected";
 }

}