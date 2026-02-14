package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.exception.EmailException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final BrevoEmailService brevoEmailService;

    @Value("${spring.mail.properties.mail.smtp.from:}")
    private String fromEmail;

    @Value("${email.use.api:true}")
    private boolean useApiByDefault;

    public void sendEmail(String to, String subject, String body) {
        // Try Brevo HTTP API first (works on Render free tier)
        if (useApiByDefault && brevoEmailService.isConfigured()) {
            try {
                brevoEmailService.sendEmail(to, subject, body);
                return;
            } catch (Exception e) {
                log.warn("Brevo API failed, falling back to SMTP: {}", e.getMessage());
            }
        }

        // Fallback to SMTP
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            throw new EmailException("Failed to send email to '" + to + "'. Please try again later. Error: " + e.getMessage());
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(filename, new ByteArrayResource(attachment));
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailException("Failed to send email with attachment to '" + to + "'. Error: " + e.getMessage());
        }
    }
}
