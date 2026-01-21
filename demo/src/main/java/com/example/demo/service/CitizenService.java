package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.payload.*;
import com.example.demo.repositories.CitizenRepository;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.security.JwtUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    // ================= SIGNUP =================
    public String signup(CitizenSignupRequest req) {
        if (citizenRepository.findByEmail(req.getEmail()) != null) {
            throw new RuntimeException("Email already registered");
        }

        Citizen citizen = Citizen.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.CITIZEN)
                .build();

        citizenRepository.save(citizen);
        return "Citizen registered successfully";
    }

    // ================= LOGIN =================
    public CitizenLoginResponse login(LoginRequest request) {
        Citizen citizen = citizenRepository.findByEmail(request.getEmail());
        if (citizen == null || !passwordEncoder.matches(request.getPassword(), citizen.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(citizen);
        return new CitizenLoginResponse(
                "Login successful",
                token,
                citizen.getRole().name()
        );
    }

    // ================= FORGOT PASSWORD =================
    public String forgotPassword(String email) {
        Citizen citizen = citizenRepository.findByEmail(email);
        if (citizen == null) {
            throw new RuntimeException("Citizen not found");
        }

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        citizen.setResetToken(otp);
        citizen.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        citizenRepository.save(citizen);

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email");
        }

        return "OTP has been sent to your email";
    }

    // ================= RESET PASSWORD =================
    public String resetPassword(String email, String resetToken, String newPassword) {
        Citizen citizen = citizenRepository.findByEmail(email);
        if (citizen == null) {
            throw new RuntimeException("Citizen not found");
        }

        if (citizen.getResetToken() == null ||
            !citizen.getResetToken().equals(resetToken) ||
            citizen.getResetTokenExpiry() == null ||
            citizen.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        citizen.setPassword(passwordEncoder.encode(newPassword));
        citizen.setResetToken(null);
        citizen.setResetTokenExpiry(null);
        citizenRepository.save(citizen);

        return "Password reset successful";
    }

    // ================= SUBMIT COMPLAINT =================
    public CitizenComplaintResponse submitComplaint(Long citizenId, Complaint complaint) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        complaint.setCitizen(citizen);
        complaint.setSubmissionDate(LocalDateTime.now());
        complaint.setStatus(ComplaintStatus.PENDING);

        Complaint savedComplaint = complaintRepository.save(complaint);

        NotificationDto payload =
                new NotificationDto(savedComplaint.getId(), savedComplaint.getStatus().name());

        messagingTemplate.convertAndSendToUser(
                citizen.getEmail().toLowerCase(),
                "/queue/notify",
                payload
        );

        messagingTemplate.convertAndSend("/topic/admin/complaints", payload);

        return mapToCitizenResponse(savedComplaint);
    }

    // ================= GET MY COMPLAINTS (INCLUDES DELETED) =================
    public List<CitizenComplaintResponse> getMyComplaints(Long citizenId) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        return complaintRepository.findByCitizen(citizen)
                .stream()
                .map(this::mapToCitizenResponse)
                .toList();
    }

    // ================= GET COMPLAINT DETAILS =================
    public CitizenComplaintResponse getComplaintDetails(Long citizenId, Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new RuntimeException("Access denied");
        }

        // Read-only view allowed even if deleted
        return mapToCitizenResponse(complaint);
    }

    // ================= REPLY TO COMPLAINT =================
    public String replyToComplaint(Long citizenId, Long complaintId, String replyMessage) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new RuntimeException("Access denied");
        }

        checkIfComplaintDeleted(complaint);

        complaint.setClarificationMessage(replyMessage);
        complaintRepository.save(complaint);

        NotificationDto payload = new NotificationDto(
                complaint.getId(),
                "Citizen replied"
        );

        messagingTemplate.convertAndSend("/topic/admin/complaints", payload);

        return "Reply submitted successfully";
    }

    // ================= UPDATE MY PROFILE =================
    public CitizenProfileResponse updateMyProfile(
            Citizen citizen,
            CitizenProfileUpdateRequest request
    ) {

        if (request.getName() != null && !request.getName().isBlank()) {
            citizen.setName(request.getName());
        }

        if (request.getPhoneNo() != null && !request.getPhoneNo().isBlank()) {
            citizen.setPhoneNo(request.getPhoneNo());
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            citizen.setAddress(request.getAddress());
        }

        if (request.getAge() > 0) {
            citizen.setAge(request.getAge());
        }

        citizenRepository.save(citizen);

        return CitizenProfileResponse.builder()
                .name(citizen.getName())
                .email(citizen.getEmail())
                .phoneNo(citizen.getPhoneNo())
                .address(citizen.getAddress())
                .age(citizen.getAge())
                .build();
    }

    // ================= HELPER: MAP COMPLAINT TO DTO =================
    private CitizenComplaintResponse mapToCitizenResponse(Complaint c) {
        return CitizenComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .complaintStage(
                        c.getComplaintStage() != null
                                ? c.getComplaintStage().name()
                                : null
                )
                .officerRemark(c.getOfficerRemark())
                .deleted(c.isDeleted())
                .deletionReason(c.getDeletionReason())
                .clarificationMessage(c.getClarificationMessage())
                .adminRemark(c.getAdminRemark())
                .officerEvidenceUrl(c.getOfficerEvidenceUrl())
                .expectedCompletionDate(c.getExpectedCompletionDate())
                .submissionDate(c.getSubmissionDate())
                .build();
    }

    // ================= PREVENT ACTION ON DELETED COMPLAINT =================
    private void checkIfComplaintDeleted(Complaint complaint) {
        if (complaint.isDeleted()) {
            throw new RuntimeException("Cannot reply or modify a deleted complaint");
        }
    }
}
