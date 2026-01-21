package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.payload.FeedbackViewResponse;
import com.example.demo.repositories.ComplaintRepository;
import com.example.demo.repositories.OfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficerFeedbackService {

    private final ComplaintRepository complaintRepository;
    private final OfficerRepository officerRepository;

    // 🔐 Logged-in Officer
    private Officer getLoggedInOfficer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return officerRepository.findByEmail(email);
    }

    // 📌 Officer can see feedback on his complaints
    public List<FeedbackViewResponse> getMyComplaintFeedbacks() {

        Officer officer = getLoggedInOfficer();

        return complaintRepository.findByAssignedOfficer(officer)
                .stream()
                .filter(c -> c.getFeedback() != null)
                .map(this::mapToResponse)
                .toList();
    }

    private FeedbackViewResponse mapToResponse(Complaint c) {
        Feedback f = c.getFeedback();
        Citizen citizen = c.getCitizen();

        return FeedbackViewResponse.builder()
                .complaintId(c.getId())
                .complaintTitle(c.getTitle())
                .complaintCategory(c.getCategory() != null ? c.getCategory().name() : null)
                .complaintStatus(c.getStatus().name())

                .citizenId(citizen.getId())
                .citizenName(citizen.getName())
                .citizenLocation(citizen.getAddress())

                .rating(f.getRating())
                .officerBehaviourRating(f.getOfficerBehaviourRating())
                .resolutionStatus(f.getResolutionStatus())
                .timeliness(f.getTimeliness())
                .feedbackComment(f.getFeedbackComment())
                .reopened(f.getReopened())
                .submittedAt(f.getFeedbackSubmittedAt())
                .build();
    }
}
