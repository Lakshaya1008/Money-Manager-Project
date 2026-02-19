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

/**
 * Unified email service — tries Brevo HTTP API first (works on Render free tier),
 * falls back to JavaMail SMTP if Brevo is not configured or fails.
 *
 * KEY FIX: sendEmailWithAttachment() now also tries Brevo first.
 * Previously it only used SMTP, which is blocked on Render free tier.
 */
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

    // ─── Plain / HTML email ───────────────────────────────────────────────────

    public void sendEmail(String to, String subject, String body) {
        // Try Brevo HTTP API first (works on Render free tier)
        if (useApiByDefault && brevoEmailService.isConfigured()) {
            try {
                brevoEmailService.sendEmail(to, subject, body);
                return;
            } catch (Exception e) {
                log.warn("Brevo API failed for plain email, falling back to SMTP: {}", e.getMessage());
            }
        }

        // Fallback: JavaMail SMTP
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent via SMTP to {}", to);
        } catch (Exception e) {
            log.error("SMTP also failed for {}: {}", to, e.getMessage());
            throw new EmailException(
                    "Failed to send email to '" + to + "'. Please try again later. Error: " + e.getMessage());
        }
    }

    // ─── Email with attachment ────────────────────────────────────────────────

    /**
     * Send email with a binary attachment.
     *
     * FIXED: Now tries Brevo HTTP API first. Previously this only used SMTP,
     * causing 503 errors on Render free tier (SMTP port 587 is blocked).
     */
    public void sendEmailWithAttachment(String to, String subject, String body,
                                        byte[] attachment, String filename) {
        // Try Brevo HTTP API first (supports attachments via Base64)
        if (useApiByDefault && brevoEmailService.isConfigured()) {
            try {
                brevoEmailService.sendEmailWithAttachment(to, subject, body, attachment, filename);
                log.info("Attachment email sent via Brevo API to {}", to);
                return;
            } catch (Exception e) {
                log.warn("Brevo API failed for attachment email, falling back to SMTP: {}", e.getMessage());
            }
        }

        // Fallback: JavaMail MIME with attachment
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(filename, new ByteArrayResource(attachment));
            mailSender.send(message);
            log.info("Attachment email sent via SMTP to {}", to);
        } catch (MessagingException e) {
            log.error("SMTP attachment also failed for {}: {}", to, e.getMessage());
            throw new EmailException(
                    "Failed to send email with attachment to '" + to + "'. Error: " + e.getMessage());
        }
    }
}