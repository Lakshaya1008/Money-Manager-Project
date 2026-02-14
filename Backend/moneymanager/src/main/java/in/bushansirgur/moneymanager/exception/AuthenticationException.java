package in.bushansirgur.moneymanager.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for authentication-related errors.
 */
public class AuthenticationException extends BaseException {

    public AuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
    }
}

