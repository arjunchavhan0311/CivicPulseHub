package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.payload.*;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.repositories.OfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminComplaintService {

    private final ComplaintRepository complaintRepository;
    private final OfficerRepository officerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ---------------- GET OFFICER BY ID ----------------
    public Officer getOfficerById(Long officerId) {
        return officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    // ---------------- LIST ALL COMPLAINTS ----------------
    public List<Complaint> listAllComplaints(String search, String status, String priority) {
        return complaintRepository.findAll().stream()
                .filter(c -> !c.isDeleted())
                .filter(c -> status == null || c.getStatus().name().equalsIgnoreCase(status))
                .filter(c -> priority == null || c.getPriority().name().equalsIgnoreCase(priority))
                .filter(c -> search == null || c.getTitle().toLowerCase().contains(search.toLowerCase()))
                .toList();
    }

    // ---------------- GET COMPLAINT DETAILS ----------------
    public Complaint getComplaintDetails(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        if (complaint.isDeleted()) {
            throw new RuntimeException("Complaint has been deleted");
        }
        return complaint;
    }

    // ---------------- ASSIGN OFFICER ----------------
    @Transactional
    public Complaint assignOfficer(Long complaintId, ComplaintAssignRequestDto request) {
        Complaint complaint = getComplaintDetails(complaintId);

        Officer officer = getOfficerById(request.getOfficerId());

        if (complaint.getCategory() != officer.getDepartment()) {
            throw new RuntimeException("Officer department does not match complaint category");
        }

        if (officer.getStatus() != OfficerStatus.AVAILABLE) {
            throw new RuntimeException("Officer is not available");
        }

        complaint.setAssignedOfficer(officer);
        complaint.setAssignedDate(LocalDateTime.now());
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setComplaintStage(ComplaintStage.ASSIGNED);

        officer.setStatus(OfficerStatus.BUSY);
        officerRepository.save(officer);

        Complaint saved = complaintRepository.save(complaint);

        // Notify citizen
        messagingTemplate.convertAndSendToUser(
                saved.getCitizen().getEmail(),
                "/queue/notify",
                new NotificationDto(saved.getId(), "Assigned to Officer: " + officer.getName())
        );

        // Notify officer
        messagingTemplate.convertAndSendToUser(
                officer.getEmail(),
                "/queue/notify",
                new NotificationDto(saved.getId(), "A new complaint has been assigned to you: " + saved.getTitle())
        );

        // Notify assigned admin only
        if (saved.getAssignedAdmin() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getAssignedAdmin().getEmail(),
                    "/queue/notify",
                    new NotificationDto(saved.getId(),
                            "Officer " + officer.getName() + " has been assigned to complaint: " + saved.getTitle())
            );
        }

        return saved;
    }

    // ---------------- UPDATE STATUS ----------------
    @Transactional
    public Complaint updateStatus(Long complaintId, ComplaintStatusUpdateRequestDto request) {
        Complaint complaint = getComplaintDetails(complaintId);

        ComplaintStatus newStatus = ComplaintStatus.valueOf(request.getStatus().toUpperCase());
        complaint.setStatus(newStatus);

        Officer officer = complaint.getAssignedOfficer();
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolutionDate(LocalDateTime.now());

            if (officer != null) {
                long activeCount = complaintRepository.countByAssignedOfficerAndStatusIn(
                        officer, List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS));
                if (activeCount == 0) {
                    officer.setStatus(OfficerStatus.AVAILABLE);
                }
                officerRepository.save(officer);
            }
        }

        Complaint saved = complaintRepository.save(complaint);

        // Notify citizen
        messagingTemplate.convertAndSendToUser(
                saved.getCitizen().getEmail(),
                "/queue/notify",
                new NotificationDto(saved.getId(), "Status updated: " + newStatus.name())
        );

        // Notify assigned admin only
        if (saved.getAssignedAdmin() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getAssignedAdmin().getEmail(),
                    "/queue/notify",
                    new NotificationDto(saved.getId(),
                            "Officer " + (officer != null ? officer.getName() : "N/A") +
                                    " updated complaint status to: " + newStatus.name())
            );
        }

        return saved;
    }

    // ---------------- UPDATE STAGE ----------------
    @Transactional
    public Complaint updateStage(Long complaintId, ComplaintStage stage) {
        Complaint complaint = getComplaintDetails(complaintId);

        complaint.setComplaintStage(stage);

        Complaint saved = complaintRepository.save(complaint);

        // Notify citizen
        messagingTemplate.convertAndSendToUser(
                saved.getCitizen().getEmail(),
                "/queue/notify",
                new NotificationDto(saved.getId(), "Complaint stage updated to: " + stage.name())
        );

        // Notify assigned admin only
        if (saved.getAssignedAdmin() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getAssignedAdmin().getEmail(),
                    "/queue/notify",
                    new NotificationDto(saved.getId(),
                            "Officer " + (saved.getAssignedOfficer() != null ? saved.getAssignedOfficer().getName() : "N/A") +
                                    " updated complaint stage to: " + stage.name())
            );
        }

        return saved;
    }

    // ---------------- UPDATE PRIORITY ----------------
    @Transactional
    public Complaint updatePriority(Long complaintId, String priority) {
        Complaint complaint = getComplaintDetails(complaintId);

        Priority newPriority = Priority.valueOf(priority.toUpperCase());
        complaint.setPriority(newPriority);

        Complaint saved = complaintRepository.save(complaint);

        // Notify citizen
        messagingTemplate.convertAndSendToUser(
                saved.getCitizen().getEmail(),
                "/queue/notify",
                new NotificationDto(saved.getId(), "Complaint priority updated to: " + newPriority.name())
        );

        // Notify assigned admin only
        if (saved.getAssignedAdmin() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getAssignedAdmin().getEmail(),
                    "/queue/notify",
                    new NotificationDto(saved.getId(),
                            "Officer " + (saved.getAssignedOfficer() != null ? saved.getAssignedOfficer().getName() : "N/A") +
                                    " updated complaint priority to: " + newPriority.name())
            );
        }

        return saved;
    }

    // ---------------- DELETE WITH REASON (SOFT DELETE) ----------------
    @Transactional
    public void deleteComplaint(Long complaintId, ComplaintDeleteRequestDto request) {
        Complaint complaint = getComplaintDetails(complaintId);

        String reason = request.getReason() != null ? request.getReason() : "No reason provided";
        complaint.setDeleted(true);
        complaint.setAdminRemark(reason);
        complaint.setResolutionDate(LocalDateTime.now());

        complaintRepository.save(complaint);

        // Notify citizen
        messagingTemplate.convertAndSendToUser(
                complaint.getCitizen().getEmail(),
                "/queue/notify",
                new NotificationDto(complaint.getId(), "Complaint deleted by admin. Reason: " + reason)
        );

        // Notify assigned admin (if any)
        if (complaint.getAssignedAdmin() != null) {
            messagingTemplate.convertAndSendToUser(
                    complaint.getAssignedAdmin().getEmail(),
                    "/queue/notify",
                    new NotificationDto(complaint.getId(), "Complaint was deleted. Reason: " + reason)
            );
        }
    }

    // ---------------- OFFICER WORKLOAD ----------------
    public List<OfficerWorkloadResponse> getAllOfficersWorkload() {
        return officerRepository.findAll().stream()
                .map(officer -> {
                    long activeComplaints = complaintRepository.countByAssignedOfficerAndStatusIn(
                            officer,
                            List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS)
                    );
                    return OfficerWorkloadResponse.builder()
                            .id(officer.getId())
                            .name(officer.getName())
                            .email(officer.getEmail())
                            .department(officer.getDepartment().name())
                            .activeComplaints(activeComplaints)
                            .status(officer.getStatus().name())
                            .build();
                })
                .toList();
    }
}
