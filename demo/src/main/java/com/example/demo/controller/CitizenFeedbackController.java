package com.example.demo.controller;

import com.example.demo.payload.FeedbackRequest;
import com.example.demo.service.CitizenFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/citizen/feedback")
@RequiredArgsConstructor
@Validated
public class CitizenFeedbackController {

    private final CitizenFeedbackService feedbackService;

    // -------------------- Structured API Response --------------------
    public record ApiResponse(String message) {}
    
    // 1️⃣ Submit feedback for a complaint
    @PostMapping("/submit/{complaintId}")
    public ResponseEntity<ApiResponse> submitFeedback(
            @PathVariable Long complaintId,
            @Valid @RequestBody FeedbackRequest request
    ) {
        String response = feedbackService.submitFeedback(complaintId, request);

        // Return 409 Conflict if feedback already exists
        if (response.contains("already submitted")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(response));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse(response));
    }

    // 2️⃣ View feedback for a specific complaint
    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<?> getFeedbackForComplaint(@PathVariable Long complaintId) {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbackByComplaint(complaintId));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(ex.getMessage()));
        }
    }

    // 3️⃣ View all feedback submitted by logged-in citizen
    @GetMapping("/my-feedback")
    public ResponseEntity<List<?>> getMyFeedback() {
        List<?> feedbackList = feedbackService.getFeedbackByCitizen();
        return ResponseEntity.ok(feedbackList);
    }
}
