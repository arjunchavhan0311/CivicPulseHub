package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // -------------------- Send OTP Email (for password reset) --------------------
    public void sendOtpEmail(String toEmail, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Your OTP for Password Reset");

        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                ".container {font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin:auto; border:1px solid #ddd; border-radius:10px;}" +
                ".header {text-align:center;}" +
                ".otp {font-size:28px; font-weight:bold; color:#2c7be5; padding:10px 0;}" +
                ".footer {margin-top:20px; font-size:12px; color:#555; text-align:center;}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h2>Infosys CivicPulse Hub</h2></div>" +
                "<p>Hello,</p>" +
                "<p>Your OTP for password reset is:</p>" +
                "<div class='otp'>" + otp + "</div>" +
                "<p>This OTP is valid for 10 minutes.</p>" +
                "<p>If you didn’t request this, ignore the email.</p>" +
                "<div class='footer'>© 2025 Infosys CivicPulse Hub. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    // -------------------- Send Credentials Email (Admin / Officer / Citizen) --------------------
    public void sendCredentialsEmail(String toEmail, String password, String userType) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Your " + userType + " Account Credentials");

        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                ".container {font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin:auto; border:1px solid #ddd; border-radius:10px;}" +
                ".header {text-align:center;}" +
                ".credentials {font-size:16px; font-weight:bold; color:#2c7be5; padding:10px 0;}" +
                ".footer {margin-top:20px; font-size:12px; color:#555; text-align:center;}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h2>Infosys CivicPulse Hub</h2></div>" +
                "<p>Hello " + userType + ",</p>" +
                "<p>Your account has been created successfully. Use the following credentials to login:</p>" +
                "<div class='credentials'>" +
                "Email: " + toEmail + "<br/>" +
                "Password: " + password +
                "</div>" +
                "<p>Please change your password after first login.</p>" +
                "<div class='footer'>© 2025 Infosys CivicPulse Hub. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
