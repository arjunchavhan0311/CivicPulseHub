package com.example.demo.controller;
import com.example.demo.payload.FeedbackViewResponse;
import com.example.demo.service.OfficerFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer/feedback")
@RequiredArgsConstructor
@CrossOrigin("*")
public class OfficerFeedbackController {

    private final OfficerFeedbackService feedbackService;

    // Officer sees feedback given on his solved complaints
    @GetMapping("/my-complaints")
    public List<FeedbackViewResponse> getMyFeedbacks() {
        return feedbackService.getMyComplaintFeedbacks();
    }
}