package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String message) {
        // Send to all clients subscribed to /topic/notifications
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }
}
