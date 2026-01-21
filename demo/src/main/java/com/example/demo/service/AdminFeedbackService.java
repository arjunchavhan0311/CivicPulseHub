package com.example.demo.service;
import com.example.demo.entity.Citizen;
import com.example.demo.entity.Complaint;
import com.example.demo.entity.Feedback;
import com.example.demo.payload.FeedbackViewResponse;
import com.example.demo.repositories.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminFeedbackService {

    private final ComplaintRepository complaintRepository;

    public List<FeedbackViewResponse> getAllFeedbacks() {

        return complaintRepository.findByFeedbackIsNotNull()
                .stream()
                .map((Complaint c) -> {

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
                })
                .collect(Collectors.toList());
    }
}
