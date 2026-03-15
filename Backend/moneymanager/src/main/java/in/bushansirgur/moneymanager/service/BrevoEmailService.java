package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.exception.EmailException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Email service using Brevo (Sendinblue) HTTP API v3.
 * This works on Render free tier where SMTP port 587 is blocked.
 *
 * Required env vars:
 *   BREVO_API_KEY      = xkeysib-...
 *   BREVO_SENDER_EMAIL = noreply@yourdomain.com
 *   BREVO_SENDER_NAME  = Money Manager
 */
@Service
@Slf4j
public class BrevoEmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${brevo.sender.email:}")
    private String senderEmail;

    @Value("${brevo.sender.name:Money Manager}")
    private String senderName;

    // Fixed: was new RestTemplate() with no timeouts — if Brevo API is slow or
    // unreachable, the thread would hang indefinitely blocking request threads.
    // Now configured with 5s connect timeout and 10s read timeout.
    private final RestTemplate restTemplate = buildRestTemplate();

    private static RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(10_000);
        return new RestTemplate(factory);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && senderEmail != null && !senderEmail.isBlank();
    }

    public void sendEmail(String to, String subject, String body) {
        if (!isConfigured()) {
            throw new EmailException("Brevo API is not configured. Please set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
        }

        Map<String, Object> payload = Map.of(
                "sender",      Map.of("name", senderName, "email", senderEmail),
                "to",          List.of(Map.of("email", to)),
                "subject",     subject,
                "htmlContent", body
        );

        sendToBrevo(payload, to);
    }

    public void sendEmailWithAttachment(String to, String subject, String body,
                                        byte[] attachment, String filename) {
        if (!isConfigured()) {
            throw new EmailException("Brevo API is not configured. Please set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
        }

        String base64Content = Base64.getEncoder().encodeToString(attachment);

        Map<String, Object> payload = Map.of(
                "sender",      Map.of("name", senderName, "email", senderEmail),
                "to",          List.of(Map.of("email", to)),
                "subject",     subject,
                "htmlContent", body,
                "attachment",  List.of(Map.of(
                        "content", base64Content,
                        "name",    filename
                ))
        );

        sendToBrevo(payload, to);
    }

    private void sendToBrevo(Map<String, Object> payload, String recipient) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    BREVO_API_URL, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Brevo API returned non-2xx status: {} body: {}",
                        response.getStatusCode(), response.getBody());
                throw new EmailException(
                        "Failed to send email to '" + recipient + "'. Brevo API returned: "
                                + response.getStatusCode());
            }

            log.info("Email sent successfully to {} via Brevo API", recipient);

        } catch (EmailException e) {
            throw e;
        } catch (Exception e) {
            log.error("Brevo API call failed for recipient {}: {}", recipient, e.getMessage(), e);
            throw new EmailException(
                    "Failed to send email to '" + recipient + "'. Error: " + e.getMessage(), e);
        }
    }
}