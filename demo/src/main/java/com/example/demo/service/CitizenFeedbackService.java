package com.example.demo.service;

import com.example.demo.entity.Citizen;
import com.example.demo.entity.Complaint;
import com.example.demo.entity.ComplaintStatus;
import com.example.demo.entity.Feedback;
import com.example.demo.payload.FeedbackRequest;
import com.example.demo.repositories.CitizenRepository;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.repositories.FeedbackRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitizenFeedbackService {

    private final ComplaintRepository complaintRepository;
    private final CitizenRepository citizenRepository;
    private final FeedbackRepository feedbackRepository;

    // -------------------- GET LOGGED-IN CITIZEN --------------------
    public Citizen getLoggedInCitizen() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Citizen not authenticated");
        }

        String email = authentication.getName();
        return citizenRepository.findByEmail(email);
    }


    // -------------------- SUBMIT FEEDBACK --------------------
    public String submitFeedback(Long complaintId, FeedbackRequest request) {

        // 1. Get logged-in citizen
        Citizen citizen = getLoggedInCitizen();

        // 2. Find complaint
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // 3. Prevent duplicate feedback
        if (complaint.getFeedback() != null) {
            return "❌ Feedback already submitted!";
        }

        // 4. Create feedback
        Feedback feedback = Feedback.builder()
                .rating(request.getRating())
                .resolutionStatus(request.getResolutionStatus())
                .timeliness(request.getTimeliness())
                .officerBehaviourRating(request.getOfficerBehaviourRating())
                .feedbackComment(request.getFeedbackComment())
                
                .reopened(request.getReopened())
                .feedbackSubmittedAt(LocalDateTime.now())
                .feedbackBy(citizen)
                .complaint(complaint)
                .build();

        feedbackRepository.save(feedback);

        // 5. Update complaint if reopened
        if (Boolean.TRUE.equals(request.getReopened())) {
            complaint.setStatus(ComplaintStatus.REOPENED);
            complaintRepository.save(complaint);
        }

        return "✅ Feedback submitted successfully!";
    }

    // -------------------- GET FEEDBACK FOR A COMPLAINT --------------------
    public Feedback getFeedbackByComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Feedback feedback = complaint.getFeedback();
        if (feedback == null) {
            throw new RuntimeException("No feedback submitted for this complaint");
        }
        return feedback;
    }

    // -------------------- GET ALL FEEDBACK BY LOGGED-IN CITIZEN --------------------
    public List<Feedback> getFeedbackByCitizen() {
        Citizen citizen = getLoggedInCitizen();
        return feedbackRepository.findAllByFeedbackBy(citizen);
    }
}
