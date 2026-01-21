package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.payload.*;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.repositories.OfficerRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.OfficerComplaintService;
import com.example.demo.service.OfficerService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OfficerComplaintController {

    private final OfficerComplaintService officerComplaintService;
    private final OfficerService officerService;
    private final OfficerRepository officerRepository;
    private final ComplaintRepository complaintRepository;
    private final JwtUtils jwtUtils;

    // ================== HELPER ==================
    private Officer getOfficerFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtils.extractEmail(token);

        Officer officer = officerRepository.findByEmail(email);
        if (officer == null) {
            throw new RuntimeException("Officer not found");
        }
        return officer;
    }

    // -------------------- LOGIN --------------------
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return officerService.login(request);
    }

    // -------------------- GET ASSIGNED COMPLAINTS --------------------
    @GetMapping("/complaints")
    public ResponseEntity<List<OfficerComplaintResponse>> getAssignedComplaints(
            HttpServletRequest request
    ) {
        Officer officer = getOfficerFromRequest(request);
        return ResponseEntity.ok(
                officerComplaintService.getAssignedComplaintResponses(officer)
        );
    }

    // -------------------- UPDATE COMPLAINT --------------------
    @PutMapping("/complaints/{id}")
    public ResponseEntity<OfficerComplaintResponse> updateComplaint(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String remark,
            @RequestParam(required = false) String expectedDate
    ) {
        Officer officer = getOfficerFromRequest(request);
        Complaint complaint = null;

        try {
            if (status != null && !status.isBlank()) {
                complaint = officerComplaintService.updateStatus(
                        officer, id, ComplaintStatus.valueOf(status.toUpperCase())
                );
            }

            if (stage != null && !stage.isBlank()) {
                complaint = officerComplaintService.updateStage(
                        officer, id, ComplaintStage.valueOf(stage.toUpperCase())
                );
            }

            if (remark != null && !remark.isBlank()) {
                complaint = officerComplaintService.addRemark(officer, id, remark);
            }

            if (expectedDate != null && !expectedDate.isBlank()) {
                LocalDate date = LocalDate.parse(expectedDate);
                complaint = officerComplaintService.updateExpectedCompletionDate(
                        officer, id, date
                );
            }

            if (complaint == null) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(
                    officerComplaintService.mapToOfficerResponse(complaint)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // -------------------- UPLOAD OFFICER EVIDENCE --------------------
    @PostMapping("/complaints/{id}/evidence")
    public ResponseEntity<OfficerComplaintResponse> uploadEvidence(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Officer officer = getOfficerFromRequest(request);

        Complaint updated = officerComplaintService.uploadEvidence(officer, id, file);
        return ResponseEntity.ok(
                officerComplaintService.mapToOfficerResponse(updated)
        );
    }
    
    
    // ------------------------------- OFFICER SINGLE FEEDBACK-------------------------------------------------------------------------------
    @GetMapping("/{complaintId}/feedback")
    public OfficerFeedbackResponse viewFeedback(
            @AuthenticationPrincipal Officer officer,
            @PathVariable Long complaintId
    ) {
        return officerComplaintService.getFeedbackForOfficer(officer, complaintId);
    }
    
    //--------------------------------OFFICER GET ALL FEEDBACK-------------------------------------------------------------------------------
    
    
 // -------------------- GET ALL FEEDBACKS --------------------
    @GetMapping("/feedbacks")
    public ResponseEntity<List<OfficerFeedbackResponse>> viewAllFeedbacks(
            @AuthenticationPrincipal Officer officer
    ) {
        List<OfficerFeedbackResponse> feedbacks = officerComplaintService.getAllFeedbackForOfficer(officer);
        return ResponseEntity.ok(feedbacks);
    }

    // -------------------- OFFICER WORKLOAD --------------------
    @GetMapping("/workload")
    public ResponseEntity<List<OfficerWorkloadResponse>> getOfficerWorkload() {

        List<OfficerWorkloadResponse> workload =
                officerRepository.findAll().stream().map(officer -> {

                    long active =
                            complaintRepository.countActiveComplaintsByOfficer(officer.getId());

                    String status =
                            active == 0 ? "AVAILABLE" :
                            active <= 3 ? "BUSY" : "OVERLOADED";

                    return OfficerWorkloadResponse.builder()
                            .id(officer.getId())
                            .name(officer.getName())
                            .email(officer.getEmail())
                            .department(officer.getDepartment().name())
                            .activeComplaints(active)
                            .status(status)
                            .build();
                }).toList();

        return ResponseEntity.ok(workload);
    }

    // ================== PROFILE ==================
    @GetMapping("/profile")
    public OfficerProfileUpdateResponse getMyProfile(HttpServletRequest request) {
        Officer officer = getOfficerFromRequest(request);

        return OfficerProfileUpdateResponse.builder()
                .name(officer.getName())
                .email(officer.getEmail())
                .phoneNo(officer.getPhoneNo())
                .address(officer.getAddress())
                .age(officer.getAge())
                .build();
    }

    // ================== REQUEST PROFILE UPDATE (ADMIN APPROVAL) ==================
    @PutMapping("/profile")
    public String requestProfileUpdate(
            HttpServletRequest request,
            @RequestBody OfficerProfileUpdateRequest updateRequest
    ) {
        Officer officer = getOfficerFromRequest(request);
        return officerService.requestProfileUpdate(officer, updateRequest);
    }
}