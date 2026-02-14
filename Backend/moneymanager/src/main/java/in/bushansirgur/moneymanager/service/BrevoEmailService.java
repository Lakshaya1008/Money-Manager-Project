package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.exception.EmailException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Email service using Brevo HTTP API.
 * This works on Render's free tier where SMTP ports are blocked.
 */
@Service
@Slf4j
public class BrevoEmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:}")
    private String senderEmail;

    @Value("${brevo.sender.name:Money Manager}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public boolean isConfigured() {
        return brevoApiKey != null && !brevoApiKey.isEmpty()
            && senderEmail != null && !senderEmail.isEmpty();
    }

    public void sendEmail(String to, String subject, String body) {
        if (!isConfigured()) {
            throw new EmailException("Brevo API is not configured. Please set BREVO_API_KEY and BREVO_SENDER_EMAIL environment variables.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> requestBody = new HashMap<>();

            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);
            requestBody.put("sender", sender);

            // Recipient
            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            toList.add(recipient);
            requestBody.put("to", toList);

            // Subject and content
            requestBody.put("subject", subject);
            requestBody.put("textContent", body);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                BREVO_API_URL,
                HttpMethod.POST,
                request,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new EmailException("Failed to send email via Brevo API. Status: " + response.getStatusCode());
            }

            log.info("Email sent successfully to {} via Brevo API", to);

        } catch (EmailException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to send email via Brevo API: {}", e.getMessage());
            throw new EmailException("Failed to send email to '" + to + "'. Error: " + e.getMessage());
        }
    }

    public void sendEmailWithHtml(String to, String subject, String htmlContent) {
        if (!isConfigured()) {
            throw new EmailException("Brevo API is not configured.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> requestBody = new HashMap<>();

            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);
            requestBody.put("sender", sender);

            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            toList.add(recipient);
            requestBody.put("to", toList);

            requestBody.put("subject", subject);
            requestBody.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                BREVO_API_URL,
                HttpMethod.POST,
                request,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new EmailException("Failed to send email via Brevo API. Status: " + response.getStatusCode());
            }

            log.info("HTML email sent successfully to {} via Brevo API", to);

        } catch (EmailException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to send HTML email via Brevo API: {}", e.getMessage());
            throw new EmailException("Failed to send email to '" + to + "'. Error: " + e.getMessage());
        }
    }
}

