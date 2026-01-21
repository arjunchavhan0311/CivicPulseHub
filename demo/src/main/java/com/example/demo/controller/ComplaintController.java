package com.example.demo.controller;

import com.example.demo.entity.Citizen;
import com.example.demo.entity.Complaint;
import com.example.demo.payload.ComplaintRequestDTO;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.ComplaintService;
import com.example.demo.repositories.CitizenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
@CrossOrigin
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CitizenRepository citizenRepository;
    private final JwtUtils jwtUtils;

    // ---------------- GET LOGGED-IN CITIZEN ----------------
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

    // ================= CREATE COMPLAINT WITH IMAGE =================
    @PostMapping(value = "/complaints/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<Complaint> createComplaint(
            HttpServletRequest request,
            @ModelAttribute ComplaintRequestDTO dto,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        Complaint saved = complaintService.createFromDto(dto, citizen, image);

        System.out.println("📩 Controller: Complaint submitted, ID=" + saved.getId() +
                " | Notifications sent to: " + citizen.getEmail());
        return ResponseEntity.ok(saved);
    }

    // ================= GET MY COMPLAINTS =================
    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getMyComplaints(HttpServletRequest request) {
        Citizen citizen = getCitizenFromRequest(request);
        List<Complaint> complaints = complaintService.getComplaintsByCitizen(citizen);
        System.out.println("📦 Controller: Fetched " + complaints.size() + " complaints for: " + citizen.getEmail());
        return ResponseEntity.ok(complaints);
    }

    // ================= GET SINGLE COMPLAINT =================
    @GetMapping("/complaints/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        Complaint complaint = complaintService.getComplaintById(id, citizen);
        System.out.println("📦 Controller: Fetched complaint ID=" + complaint.getId() +
                " for: " + citizen.getEmail());
        return ResponseEntity.ok(complaint);
    }

    // ================= UPDATE COMPLAINT =================
    @PutMapping(value = "/complaints/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Complaint> updateComplaint(
            HttpServletRequest request,
            @PathVariable Long id,
            @ModelAttribute ComplaintRequestDTO dto,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        Complaint updated = complaintService.updateFromDto(citizen.getId(), id, dto, image);

        System.out.println("📩 Controller: Complaint updated, ID=" + updated.getId() +
                " | Notifications sent to: " + citizen.getEmail());
        return ResponseEntity.ok(updated);
    }

    // ================= DELETE COMPLAINT =================
    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<String> deleteComplaint(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        Citizen citizen = getCitizenFromRequest(request);
        complaintService.deleteComplaint(citizen.getId(), id);

        System.out.println("📩 Controller: Complaint deleted, ID=" + id +
                " | Notifications sent to: " + citizen.getEmail());
        return ResponseEntity.ok("✅ Complaint deleted successfully");
    }
}
