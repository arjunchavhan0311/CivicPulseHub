package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.exception.AccessDeniedException;
import com.example.demo.exception.ComplaintNotFoundException;
import com.example.demo.payload.NotificationDto;
import com.example.demo.payload.OfficerComplaintResponse;
import com.example.demo.payload.OfficerFeedbackResponse;
import com.example.demo.payload.OfficerWorkloadResponse;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.repositories.FeedbackRepository;
import com.example.demo.repositories.OfficerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OfficerComplaintService {

    private final ComplaintRepository complaintRepository;
    private final FeedbackRepository feedbackRepository;
    private final OfficerRepository officerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/officer/";
    private final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private final List<String> ALLOWED_FILE_TYPES =
            List.of("image/png", "image/jpeg", "image/jpg");

    // ==================== HELPER ====================
    private Officer getManagedOfficer(Officer officer) {
        return officerRepository.findById(officer.getId())
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    // ==================== ASSIGNED COMPLAINTS ====================
    public List<OfficerComplaintResponse> getAssignedComplaintResponses(Officer officer) {
        Officer managedOfficer = getManagedOfficer(officer);

        return complaintRepository.findByAssignedOfficer(managedOfficer)
                .stream()
                .map(this::mapToOfficerResponse)
                .toList();
    }

    // ==================== UPLOAD EVIDENCE ====================
    public Complaint uploadEvidence(Officer officer, Long complaintId, MultipartFile file) {
        Complaint complaint = getOfficerComplaint(officer, complaintId);

        if (file == null || file.isEmpty())
            throw new RuntimeException("File is empty");

        if (!ALLOWED_FILE_TYPES.contains(file.getContentType()))
            throw new RuntimeException("Only PNG/JPG images allowed");

        if (file.getSize() > MAX_FILE_SIZE)
            throw new RuntimeException("File size exceeds 5MB");

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = Paths.get(UPLOAD_DIR, filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            complaint.setOfficerEvidenceUrl("/uploads/officer/" + filename);

            if (complaint.getStatus() == ComplaintStatus.PENDING) {
                complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            }

            Complaint saved = complaintRepository.saveAndFlush(complaint);
            updateOfficerStatus(saved.getAssignedOfficer());

            notifyAdmins(saved, "Officer uploaded evidence");
            notifyCitizen(saved, "Officer uploaded evidence for your complaint");

            return saved;

        } catch (IOException e) {
            throw new RuntimeException("Evidence upload failed", e);
        }
    }
    
    
   


    // ==================== FEEDBACK ====================
    public OfficerFeedbackResponse getFeedbackForOfficer(Officer officer, Long complaintId) {
        Complaint complaint = getOfficerComplaint(officer, complaintId);

        Feedback feedback = feedbackRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new RuntimeException("No feedback submitted"));

        return mapToFeedbackResponse(complaint, feedback);
    }

    public List<OfficerFeedbackResponse> getAllFeedbackForOfficer(Officer officer) {
        Officer managedOfficer = getManagedOfficer(officer);

        return complaintRepository.findByAssignedOfficer(managedOfficer)
                .stream()
                .map(c -> c.getFeedback() != null
                        ? mapToFeedbackResponse(c, c.getFeedback())
                        : null)
                .filter(r -> r != null)
                .toList();
    }
    
    
    
    

    private OfficerFeedbackResponse mapToFeedbackResponse(Complaint c, Feedback f) {
        return OfficerFeedbackResponse.builder()
                .complaintId(c.getId())
                .rating(f.getRating())
                .officerBehaviourRating(f.getOfficerBehaviourRating())
                .resolutionStatus(f.getResolutionStatus())
                .timeliness(f.getTimeliness())
                .feedbackComment(f.getFeedbackComment())
                .feedbackImageUrl(f.getFeedbackImageUrl())
                .reopened(f.getReopened())
                .feedbackSubmittedAt(f.getFeedbackSubmittedAt())
                .build();
    }

    // ==================== MAP RESPONSE ====================
    public OfficerComplaintResponse mapToOfficerResponse(Complaint c) {

        Officer o = c.getAssignedOfficer();

        long active = o != null
                ? complaintRepository.countByAssignedOfficerAndStatusIn(
                        o, List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS))
                : 0;

        return OfficerComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .category(c.getCategory() != null ? c.getCategory().name() : null)
                .priority(c.getPriority() != null ? c.getPriority().name() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .description(c.getDescription())
                .location(c.getLocation())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .submissionDate(c.getSubmissionDate())
                .imageUrl(c.getImageUrl())
                .officerEvidenceUrl(c.getOfficerEvidenceUrl())
                .resolutionDate(c.getResolutionDate())
                .complaintStage(c.getComplaintStage() != null ? c.getComplaintStage().name() : null)
                .assignedOfficerName(o != null ? o.getName() : null)
                .assignedOfficerStatus(o != null && o.getStatus() != null ? o.getStatus().name() : null)
                .assignedOfficerDepartment(
                        o != null && o.getDepartment() != null ? o.getDepartment().name() : null
                )
                .assignedOfficerActiveComplaints(active)
                .officerRemark(c.getOfficerRemark())
                .assignedDate(c.getAssignedDate())
                .expectedCompletionDate(c.getExpectedCompletionDate())
                .build();
    }

    // ==================== VALIDATION ====================
    private Complaint getOfficerComplaint(Officer officer, Long complaintId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found"));

        if (complaint.getAssignedOfficer() == null ||
                !complaint.getAssignedOfficer().getId().equals(officer.getId())) {
            throw new AccessDeniedException("You are not allowed");
        }

        return complaint;
    }

    // ==================== STATUS UPDATES ====================
    public Complaint updateStatus(Officer officer, Long id, ComplaintStatus status) {

        Complaint complaint = getOfficerComplaint(officer, id);
        complaint.setStatus(status);

        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolutionDate(LocalDateTime.now());
        }

        Complaint saved = complaintRepository.saveAndFlush(complaint);
        updateOfficerStatus(saved.getAssignedOfficer());

        notifyAdmins(saved, "Complaint status updated");
        notifyCitizen(saved, "Your complaint status updated");

        return saved;
    }

    public Complaint updateStage(Officer officer, Long id, ComplaintStage stage) {
        Complaint complaint = getOfficerComplaint(officer, id);
        complaint.setComplaintStage(stage);
        return complaintRepository.saveAndFlush(complaint);
    }

    public Complaint updateExpectedCompletionDate(Officer officer, Long id, LocalDate date) {
        Complaint complaint = getOfficerComplaint(officer, id);
        complaint.setExpectedCompletionDate(date);
        return complaintRepository.saveAndFlush(complaint);
    }

    public Complaint addRemark(Officer officer, Long id, String remark) {
        Complaint complaint = getOfficerComplaint(officer, id);
        complaint.setOfficerRemark(remark);
        return complaintRepository.saveAndFlush(complaint);
    }

    // ==================== OFFICER STATUS ====================
    private void updateOfficerStatus(Officer officer) {

        if (officer == null) return;

        Officer managedOfficer = getManagedOfficer(officer);

        long active = complaintRepository.countByAssignedOfficerAndStatusIn(
                managedOfficer,
                List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS)
        );

        managedOfficer.setStatus(
                active == 0 ? OfficerStatus.AVAILABLE : OfficerStatus.BUSY
        );

        officerRepository.save(managedOfficer);
    }

    // ==================== NOTIFICATIONS ====================
    private void notifyAdmins(Complaint c, String msg) {
        messagingTemplate.convertAndSend(
                "/topic/admin/complaints",
                new NotificationDto(c.getId(), msg)
        );
    }

    private void notifyCitizen(Complaint c, String msg) {
        messagingTemplate.convertAndSendToUser(
                c.getCitizen().getEmail().toLowerCase(),
                "/queue/notify",
                new NotificationDto(c.getId(), msg)
        );
    }

    // ==================== WORKLOAD ====================
    public List<OfficerWorkloadResponse> getAllOfficersWorkload() {
        return officerRepository.findAll().stream().map(o -> {

            long active = complaintRepository.countByAssignedOfficerAndStatusIn(
                    o, List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS));

            String status =
                    active == 0 ? "AVAILABLE" :
                    active <= 3 ? "BUSY" : "OVERLOADED";

            return OfficerWorkloadResponse.builder()
                    .id(o.getId())
                    .name(o.getName())
                    .email(o.getEmail())
                    .department(o.getDepartment() != null ? o.getDepartment().name() : null)
                    .activeComplaints(active)
                    .status(status)
                    .build();
        }).toList();
    }
}