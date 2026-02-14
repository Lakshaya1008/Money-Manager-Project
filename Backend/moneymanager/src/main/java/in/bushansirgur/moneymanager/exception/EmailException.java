package in.bushansirgur.moneymanager.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for email-related errors.
 */
public class EmailException extends BaseException {

    public EmailException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_ERROR");
    }

    public EmailException(String message, Throwable cause) {
        super("Email service error: " + message, HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_ERROR");
    }
}

