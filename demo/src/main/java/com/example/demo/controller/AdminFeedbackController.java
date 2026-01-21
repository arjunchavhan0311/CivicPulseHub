package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.payload.FeedbackViewResponse;
import com.example.demo.service.AdminFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminFeedbackController {

    private final AdminFeedbackService feedbackService;

    // Admin can see all citizen feedback
    @GetMapping("/all")
    public List<FeedbackViewResponse> getAllFeedback() {
        return feedbackService.getAllFeedbacks();
    }
}
